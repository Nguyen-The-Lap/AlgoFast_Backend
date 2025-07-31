// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();
export function requireRole(role) {
  return async (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const user = await User.findById(req.session.userId);
    if (!user || user.role !== role) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    next();
  };
}
// Middleware: kiểm tra đã đăng nhập chưa
export function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  next();
}

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username hoặc email đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    req.session.userId = user._id;

    res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });

    req.session.userId = user._id;

    res.json({
      message: 'Đăng nhập thành công',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy thông tin user hiện tại
router.get('/me', requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Đăng xuất
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Lỗi khi đăng xuất' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Đã đăng xuất' });
  });
});

export default router;
