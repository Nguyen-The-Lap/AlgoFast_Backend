import mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // Nội dung chính, có thể là HTML/Markdown
  summary: { type: String },                 // Tóm tắt ngắn
  image: { type: String },                   // Link ảnh minh họa
  video: { type: String },                   // Link video (YouTube, Vimeo, ...)
  examples: [{ type: String }],              // Mảng ví dụ minh họa
  quiz: [
    {
      question: String,
      options: [String],
      answer: String
    }
  ],
  references: [{ type: String }],            // Tài liệu tham khảo
  createdAt: { type: Date, default: Date.now }
});

const Lesson = mongoose.model('Lesson', LessonSchema);
export default Lesson; 