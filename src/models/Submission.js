import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  code: { type: String, required: true },
  language: { type: String, required: true, default: 'python' },
  status: { type: String, enum: ['Accepted', 'Failed', 'Error'], default: 'Error' },
  output: { type: String },
  expectedOutput: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Submission = mongoose.model('Submission', SubmissionSchema);
export default Submission;
