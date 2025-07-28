const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  created_at: { type: Date, default: Date.now }
});

const ExerciseTestcaseSchema = new mongoose.Schema({
  exercise_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  input: { type: String, required: true },
  expected_output: { type: String, required: true },
  is_sample: { type: Boolean, default: false }
});

const SubmissionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  exercise_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'wrong', 'error'], default: 'pending' },
  score: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

module.exports = {
  Exercise: mongoose.model('Exercise', ExerciseSchema),
  ExerciseTestcase: mongoose.model('ExerciseTestcase', ExerciseTestcaseSchema),
  Submission: mongoose.model('Submission', SubmissionSchema)
};