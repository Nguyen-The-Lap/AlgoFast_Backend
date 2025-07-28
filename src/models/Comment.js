import mongoose from 'mongoose';
const commentSchema = new mongoose.Schema({
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Comment', commentSchema);
