import express from 'express';
import authRouter from './auth.js';
import leaderboardRouter from './leaderboard.js';
import exerciseRouter from './exercise.js';
import lessonRouter from './lesson.js';
import submissionRouter from './submission.js';
import adminRouter from './admin.js';
import { requireRole } from './auth.js';
import { createLesson } from './lessonController.js';
import User from '../models/User.js';
import { requireLogin } from './auth.js';
import chatRouter from './chat.js';
import Lesson from './lesson.js';
import progressRouter from './progress.js';


const router = express.Router();

router.use('/auth', authRouter);
router.use('/exercise', exerciseRouter);
router.use('/lesson', lessonRouter);
router.use('/submission', submissionRouter);
router.use('/admin', adminRouter);
router.use('/chat', chatRouter);
router.use('/progress', progressRouter);
router.use('/leaderboard', leaderboardRouter);

// Chỉ admin mới được tạo bài học
router.post('/lessons', requireRole('admin'), createLesson);

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Không đủ quyền truy cập' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
}

router.get('/users', requireLogin, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.delete('/users/:id', requireLogin, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    res.json({ message: 'Xóa user thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.get('/user-stats', requireLogin, requireAdmin, async (req, res) => {
  try {
    const total = await User.countDocuments();
    const admin = await User.countDocuments({ role: 'admin' });
    const student = await User.countDocuments({ role: 'student' });
    res.json({ total, admin, student });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy progress của user hiện tại
router.get('/user/progress', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.json(user.progress || []);
});

// Tick bài học (đánh dấu đã học)
router.post('/user/progress', requireLogin, async (req, res) => {
  const { lessonId } = req.body;
  if (!lessonId) return res.status(400).json({ message: 'Thiếu lessonId' });

  const user = await User.findById(req.session.userId);
  if (!user.progress.includes(lessonId)) {
    user.progress.push(lessonId);
    await user.save();
  }
  res.json({ message: 'Đã lưu progress', progress: user.progress });
});

// Bỏ tick bài học
router.delete('/user/progress/:lessonId', requireLogin, async (req, res) => {
  const { lessonId } = req.params;
  const user = await User.findById(req.session.userId);
  user.progress = user.progress.filter(id => id.toString() !== lessonId);
  await user.save();
  res.json({ message: 'Đã xóa progress', progress: user.progress });
});

export default router; 