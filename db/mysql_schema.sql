-- Tạo database nếu chưa có và sử dụng nó
CREATE DATABASE IF NOT EXISTS algofast;
USE algofast;

-- Bảng bài tập (exercises)
CREATE TABLE IF NOT EXISTS exercises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng test case cho bài tập
CREATE TABLE IF NOT EXISTS exercise_testcases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exercise_id INT NOT NULL,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Bảng kết quả nộp bài (submissions)
CREATE TABLE IF NOT EXISTS submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  exercise_id INT NOT NULL,
  code TEXT NOT NULL,
  language VARCHAR(32) NOT NULL,
  status ENUM('pending', 'accepted', 'wrong', 'error') DEFAULT 'pending',
  score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
); 