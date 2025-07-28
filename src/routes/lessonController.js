// server/src/controllers/lessonController.js
import Lesson from '../models/Lesson.js';

export const createLesson = async (req, res) => {
  try {
    const { title, description, content } = req.body;
    if (!title || !description || !content) {
      return res.status(400).json({ message: 'Thiếu thông tin bài học' });
    }
    const lesson = new Lesson({ title, description, content });
    await lesson.save();
    res.status(201).json({ message: 'Tạo bài học thành công', lesson });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
