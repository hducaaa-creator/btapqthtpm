# Đề tài 35: Hệ thống Quiz / Thi trắc nghiệm

## Giới thiệu
Dự án triển khai và quản trị hệ thống phần mềm web thi trắc nghiệm trực tuyến tự động chấm điểm, tích hợp đầy đủ ngăn xếp giám sát và lưu trữ log.

## Thành phần công nghệ
- **Web App**: Node.js & Express (Tạo đề, làm trắc nghiệm, chấm điểm tự động)
- **Database**: MySQL 8.0 & phpMyAdmin
- **Reverse Proxy**: Nginx (Bảo mật header, ẩn version `server_tokens off`)
- **Monitoring**: Prometheus & Node Exporter
- **Visual Dashboard**: Grafana (Port 3000)
- **Log Management**: Grafana Loki & Promtail (Truy vấn LogQL)

## Hướng dẫn chạy nhanh (Quick Start)
1. Cài đặt Docker & Docker Compose trên máy chủ/máy ảo Ubuntu.
2. Khởi chạy toàn bộ hệ thống:
   ```bash
   docker compose up -d --build
   ```
3. Truy cập các dịch vụ:
   - **Quiz App**: `http://<IP_SERVER>/`
   - **phpMyAdmin**: `http://<IP_SERVER>/phpmyadmin/` (User: `quizuser` / Pass: `quizpassword`)
   - **Grafana Dashboard**: `http://<IP_SERVER>:3000` (User: `admin` / Pass: `admin`)
   - **Prometheus**: `http://<IP_SERVER>:9090`
