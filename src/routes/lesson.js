// routes/lesson.js
import express from 'express';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';
import { requireLogin } from './auth.js';

const router = express.Router();

// Lấy tất cả bài học
router.get('/', async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ createdAt: 1 });
    res.json(lessons);
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy bài học theo ID
router.get('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Bài học không tồn tại' });
    res.json(lesson);
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy tiến độ bài học
router.get('/:id/progress', requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const progress = user.progress.find(p => p.lessonId.toString() === req.params.id);
    res.json({
      lessonId: req.params.id,
      completed: progress ? progress.completed : false,
      score: progress ? progress.score : 0
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật tiến độ
router.post('/:id/progress', requireLogin, async (req, res) => {
  try {
    const { completed, score } = req.body;
    const user = await User.findById(req.session.userId);
    const idx = user.progress.findIndex(p => p.lessonId.toString() === req.params.id);

    if (idx >= 0) {
      user.progress[idx].completed = completed;
      user.progress[idx].score = score;
    } else {
      user.progress.push({ lessonId: req.params.id, completed, score });
    }

    await user.save();
    res.json({ message: 'Cập nhật tiến độ thành công' });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thêm bài học mới (chỉ admin)
router.post('/', requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (user.role !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { title, description, content, exercises } = req.body;
    const lesson = new Lesson({ title, description, content, exercises: exercises || [] });

    await lesson.save();
    res.status(201).json(lesson);
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thêm bài học (public route)
router.post('/add', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Thiếu thông tin' });

    const lesson = new Lesson({ title, content });
    await lesson.save();
    res.status(201).json({ message: 'Thêm bài học thành công', lesson });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật bài học (admin)
router.put('/:id', requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (user.role !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { title, description, content, exercises } = req.body;
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { title, description, content, exercises },
      { new: true }
    );

    if (!lesson) return res.status(404).json({ message: 'Bài học không tồn tại' });

    res.json(lesson);
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa bài học
router.delete('/:id', requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (user.role !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Bài học không tồn tại' });

    res.json({ message: 'Xóa bài học thành công' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;
