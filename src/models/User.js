import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function() {
      // Nếu không có googleId và không có githubId thì mới bắt buộc password
      return !this.googleId && !this.githubId;
    }
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  progress: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  googleId: String,
  githubId: String,
}, { timestamps: true });

export default mongoose.model('User', userSchema); 