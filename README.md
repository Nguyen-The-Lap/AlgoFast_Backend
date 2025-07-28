# 🚀 Hướng Dẫn Cài Đặt & Chạy Backend

## 1️⃣ Cài Đặt Dependencies

```bash
cd server
npm install
```

---

## 2️⃣ Cấu Hình Biến Môi Trường

Tạo file `.env` trong thư mục `server` với nội dung mẫu:

```
MONGODB_URI=mongodb://localhost:27017/algofast
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=algofast
```
> ⚠️ Thay `yourpassword` bằng mật khẩu MySQL của bạn.

---

## 3️⃣ Khởi Tạo Database MySQL

- Mở MySQL Workbench hoặc terminal.
- Import file `db/mysql_schema.sql` để tạo các bảng cần thiết.

---

## 4️⃣ Seed Dữ Liệu Mẫu

```bash
node src/utils/seedData.js
```
- Script này sẽ seed dữ liệu mẫu cho cả **MongoDB** và **MySQL**.

---

## 5️⃣ Chạy Server Backend

```bash
npm start
```
- Server sẽ chạy ở cổng mặc định (ví dụ: **5000**).

---

## 6️⃣ Lưu Ý

- Backend hỗ trợ cả **MongoDB** (bài học, user) và **MySQL** (bài tập, test case, submission).
- Đảm bảo cả hai database đều đang chạy.
- Nếu thay đổi schema, hãy chạy lại seed hoặc migrate.

---

> ❗ Nếu gặp lỗi, kiểm tra log terminal và cấu hình `.env`.