import express from 'express';
import User from '../models/User.js';
import { requireLogin } from './auth.js';

const router = express.Router();

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

router.put('/users/:id/role', requireLogin, requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'student'].includes(role)) {
    return res.status(400).json({ message: 'Role không hợp lệ' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ message: 'User không tồn tại' });
  res.json({ message: 'Cập nhật role thành công', user });
});

export default router;
