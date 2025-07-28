# Hướng dẫn cài đặt & chạy Backend

## 1. Cài đặt dependencies
```bash
cd server
npm install
```

## 2. Cấu hình biến môi trường
Tạo file `.env` trong thư mục `server` với nội dung mẫu:
```
MONGODB_URI=mongodb://localhost:27017/algofast
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=algofast
```
- Thay `yourpassword` bằng mật khẩu MySQL của bạn.

## 3. Khởi tạo database MySQL
- Mở MySQL Workbench hoặc terminal, import file `db/mysql_schema.sql` để tạo các bảng cần thiết.

## 4. Seed dữ liệu mẫu
```bash
node src/utils/seedData.js
```
- Script này sẽ seed dữ liệu mẫu cho cả MongoDB và MySQL.

## 5. Chạy server backend
```bash
npm start
```
- Server sẽ chạy ở cổng mặc định (ví dụ: 5000).

## 7. Lưu ý
- Backend hỗ trợ cả MongoDB (bài học, user) và MySQL (bài tập, test case, submission).
- Đảm bảo cả hai database đều đang chạy.
- Nếu thay đổi schema, hãy chạy lại seed hoặc migrate.

---
Nếu gặp lỗi, kiểm tra log terminal và cấu hình `.env`. 