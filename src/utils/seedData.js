import mongoose from 'mongoose';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Lesson from '../models/Lesson.js';

dotenv.config();

async function seedMongo() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Xóa dữ liệu cũ
  await User.deleteMany({});
  await Lesson.deleteMany({});

  // Thêm user mẫu
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: '$2a$12$123456789012345678901uQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw', // bcrypt hash cho '123456'
    role: 'user',
    progress: []
  });

  // Thêm admin
  await User.create({
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$12$123456789012345678901uQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw', // bcrypt hash cho '123456'
    role: 'admin',
    progress: []
  });

  // Thêm lesson mẫu
  const lesson = await Lesson.create({
    title: 'Giới thiệu về thuật toán',
    description: 'Bài học đầu tiên về thuật toán',
    content: 'Nội dung bài học...',
    exercises: [1]
  });

  console.log('Seed MongoDB thành công');
  await mongoose.disconnect();
}

async function seedMySQL() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  // Xóa dữ liệu cũ
  await connection.execute('DELETE FROM exercise_testcases');
  await connection.execute('DELETE FROM submissions');
  await connection.execute('DELETE FROM exercises');

  // Thêm bài tập mẫu
  const [result] = await connection.execute(
    'INSERT INTO exercises (title, description, difficulty) VALUES (?, ?, ?)',
    ['Tính tổng hai số', 'Viết chương trình tính tổng hai số nguyên a, b.', 'easy']
  );
  const exerciseId = result.insertId;

  // Thêm test case mẫu
  await connection.execute(
    'INSERT INTO exercise_testcases (exercise_id, input, expected_output, is_sample) VALUES (?, ?, ?, ?)',
    [exerciseId, '2 3', '5', true]
  );
  await connection.execute(
    'INSERT INTO exercise_testcases (exercise_id, input, expected_output, is_sample) VALUES (?, ?, ?, ?)',
    [exerciseId, '10 20', '30', false]
  );

  console.log('Seed MySQL thành công');
  await connection.end();
}

(async () => {
  await seedMongo();
  await seedMySQL();
  console.log('Seed dữ liệu hoàn tất!');
  process.exit(0);
})(); 