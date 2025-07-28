import express from 'express';
import Exercise from '../models/Exercise.js';
import Submission from '../models/Submission.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { requireLogin } from './auth.js';

const router = express.Router();

// GET all exercises
router.get('/', async (req, res) => {
  try {
    const exercises = await Exercise.find().sort({ createdAt: 1 });
    res.json(exercises);
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET exercise by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const exercise = await Exercise.findById(id);
    if (!exercise) {
      return res.status(404).json({ message: 'Bài tập không tồn tại' });
    }
    res.json(exercise);
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET all submissions for an exercise
router.get('/:id/submissions', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const submissions = await Submission.find({ exerciseId: id }).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy bình luận
router.get('/:id/comments', async (req, res) => {
  const comments = await Comment.find({ exerciseId: req.params.id }).sort({ createdAt: -1 });
  res.json(comments);
});

// Thêm bình luận
router.post('/:id/comments', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.userId);
  const comment = await Comment.create({
    exerciseId: req.params.id,
    userId: user._id,
    username: user.username,
    text: req.body.text
  });
  res.json(comment);
});

// POST new exercise
router.post('/', async (req, res) => {
  try {
    const { title, description, difficulty, testCases } = req.body;

    const exercise = new Exercise({
      title,
      description,
      difficulty,
      testCases: testCases || []
    });

    await exercise.save();
    res.status(201).json(exercise);
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT update an exercise
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, testCases } = req.body;

    const exercise = await Exercise.findByIdAndUpdate(
      id,
      { title, description, difficulty, testCases },
      { new: true }
    );

    if (!exercise) {
      return res.status(404).json({ message: 'Bài tập không tồn tại' });
    }

    res.json(exercise);
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// DELETE an exercise
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await Exercise.findByIdAndDelete(id);
    if (!exercise) {
      return res.status(404).json({ message: 'Bài tập không tồn tại' });
    }

    res.json({ message: 'Xóa bài tập thành công' });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;
