/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Trả về thông tin user
 *       401:
 *         description: Chưa đăng nhập
 */
export function requireRole(role) {
  return async (req, res, next) => {
    // Remove session check, rely on userId in request (e.g., from JWT or header)
    const userId = req.session?.userId || req.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Chưa đăng nhập hoặc phiên đã hết hạn' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'User không tồn tại hoặc phiên đã hết hạn' });
    }
    if (user.role !== role) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    next();
  };
}

// Middleware: kiểm tra đã đăng nhập chưa
export function requireLogin(req, res, next) {
  // Remove session check, rely on userId in request (e.g., from JWT or header)
  const userId = req.session?.userId || req.userId || req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ message: 'Chưa đăng nhập hoặc phiên đã hết hạn' });
  }
  User.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: 'User không tồn tại hoặc phiên đã hết hạn' });
      }
      next();
    })
    .catch(() => res.status(500).json({ message: 'Lỗi server' }));
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký người dùng
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Username hoặc email đã tồn tại
 *       500:
 *         description: Lỗi server
 */

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
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập người dùng
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       400:
 *         description: Email hoặc mật khẩu không đúng
 *       500:
 *         description: Lỗi server
 */
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
    const user = await User.findOne({ email }).select('-password');
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Đăng xuất
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *       500:
 *         description: Lỗi khi đăng xuất
 */
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Lỗi khi đăng xuất' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Đã đăng xuất' });
  });
});

export default router;
