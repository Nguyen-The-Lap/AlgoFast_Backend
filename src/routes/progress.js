import express from 'express';
import User from '../models/User.js';
import { requireLogin } from './auth.js';

const router = express.Router();

// Lấy progress của user hiện tại (danh sách lessonId đã tick)
router.get('/user/progress', requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    res.json(user.progress || []);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tick bài học (đánh dấu đã học)
router.post('/user/progress', requireLogin, async (req, res) => {
  try {
    const { lessonId } = req.body;
    if (!lessonId) return res.status(400).json({ message: 'Thiếu lessonId' });

    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });

    if (!user.progress.includes(lessonId)) {
      user.progress.push(lessonId);
      await user.save();
    }
    res.json({ message: 'Đã lưu progress', progress: user.progress });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Bỏ tick bài học
router.delete('/user/progress/:lessonId', requireLogin, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });

    user.progress = user.progress.filter(id => id.toString() !== lessonId);
    await user.save();
    res.json({ message: 'Đã xóa progress', progress: user.progress });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;
