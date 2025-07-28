import express from 'express';
import { getConnection } from '../config/mysql.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Lấy bảng xếp hạng tổng quát
router.get('/', async (req, res) => {
  try {
    const mysqlConnection = getConnection();
    // Lấy điểm số tổng của mỗi user
    const [rows] = await mysqlConnection.execute(`
      SELECT 
        s.user_id,
        SUM(s.score) as total_score,
        COUNT(DISTINCT s.exercise_id) as exercises_solved,
        COUNT(s.id) as total_submissions
      FROM submissions s
      WHERE s.status = 'accepted'
      GROUP BY s.user_id
      ORDER BY total_score DESC, exercises_solved DESC
      LIMIT 50
    `);

    // Lấy thông tin user từ MongoDB
    const leaderboard = [];
    for (const row of rows) {
      const user = await User.findById(row.user_id).select('username');
      if (user) {
        leaderboard.push({
          userId: row.user_id,
          username: user.username,
          totalScore: row.total_score,
          exercisesSolved: row.exercises_solved,
          totalSubmissions: row.total_submissions
        });
      }
    }

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy bảng xếp hạng theo bài tập
router.get('/exercise/:exerciseId', async (req, res) => {
  try {
    const mysqlConnection = getConnection();
    const [rows] = await mysqlConnection.execute(`
      SELECT 
        s.user_id,
        s.score,
        s.created_at,
        s.code
      FROM submissions s
      WHERE s.exercise_id = ? AND s.status = 'accepted'
      ORDER BY s.score DESC, s.created_at ASC
      LIMIT 20
    `, [req.params.exerciseId]);

    // Lấy thông tin user
    const leaderboard = [];
    for (const row of rows) {
      const user = await User.findById(row.user_id).select('username');
      if (user) {
        leaderboard.push({
          userId: row.user_id,
          username: user.username,
          score: row.score,
          submittedAt: row.created_at
        });
      }
    }

    res.json(leaderboard);
  } catch (error) {
    console.error('Get exercise leaderboard error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy thống kê cá nhân
router.get('/stats/:userId', async (req, res) => {
  try {
    const mysqlConnection = getConnection();
    const userId = req.params.userId;

    // Thống kê tổng quát
    const [stats] = await mysqlConnection.execute(`
      SELECT 
        COUNT(DISTINCT s.exercise_id) as exercises_solved,
        COUNT(s.id) as total_submissions,
        SUM(s.score) as total_score,
        AVG(s.score) as avg_score
      FROM submissions s
      WHERE s.user_id = ?
    `, [userId]);

    // Thống kê theo độ khó
    const [difficultyStats] = await mysqlConnection.execute(`
      SELECT 
        e.difficulty,
        COUNT(DISTINCT s.exercise_id) as solved,
        AVG(s.score) as avg_score
      FROM submissions s
      JOIN exercises e ON s.exercise_id = e.id
      WHERE s.user_id = ? AND s.status = 'accepted'
      GROUP BY e.difficulty
    `, [userId]);

    // Lấy user info
    const user = await User.findById(userId).select('username');

    res.json({
      user: {
        id: userId,
        username: user ? user.username : 'Unknown'
      },
      stats: stats[0] || {
        exercises_solved: 0,
        total_submissions: 0,
        total_score: 0,
        avg_score: 0
      },
      difficultyStats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// API: Bảng xếp hạng progress (số bài học đã tick)
router.get('/progress', async (req, res) => {
  try {
    const users = await User.find().select('username email progress');
    const sorted = users
      .map(u => ({
        username: u.username,
        email: u.email,
        progressCount: u.progress ? u.progress.length : 0
      }))
      .sort((a, b) => b.progressCount - a.progressCount);

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Đã đăng xuất' });
});

export default router; 