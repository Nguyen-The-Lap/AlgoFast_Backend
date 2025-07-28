import mongoose from 'mongoose';
const chatMessageSchema = new mongoose.Schema({
  // Bỏ exerciseId nếu là chat toàn cục
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('ChatMessage', chatMessageSchema);
