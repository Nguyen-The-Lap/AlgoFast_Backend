import express from 'express';
import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import { requireLogin } from './auth.js';

const router = express.Router();

// Lấy tất cả tin nhắn chat (giới hạn 100 tin mới nhất)
router.get('/', async (req, res) => {
  const messages = await ChatMessage.find().sort({ createdAt: -1 }).limit(100);
  res.json(messages.reverse());
});

// Gửi tin nhắn chat mới
router.post('/', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.userId);
  const message = await ChatMessage.create({
    userId: user._id,
    username: user.username,
    text: req.body.text
  });
  res.json(message);
});

export default router;
