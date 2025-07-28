import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  testCases: [
    {
      input: String,
      expected_output: String,
      is_sample: Boolean
    }
  ]
});

export default mongoose.model('Exercise', ExerciseSchema);
