const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'quizuser',
  password: process.env.DB_PASSWORD || 'quizpassword',
  database: process.env.DB_NAME || 'quiz_db',
  waitForConnections: true,
  connectionLimit: 10
});

// Khoi tao bang du lieu va cau hoi mau sau khi MySQL khoi dong xong
function initDB(retries = 10) {
  db.query(`CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_option CHAR(1) NOT NULL
  )`, (err) => {
    if (err) {
      if (retries > 0) {
        console.log(`Dang cho DB khoi dong... thu lai sau 3s (${retries} lan con lai)`);
        setTimeout(() => initDB(retries - 1), 3000);
      } else {
        console.error('Khong the khoi tao database:', err);
      }
      return;
    }
    console.log('Khoi tao bang questions thanh cong!');
    db.query('SELECT COUNT(*) AS count FROM questions', (err, rows) => {
      if (rows && rows[0].count === 0) {
        const sql = `INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_option) VALUES 
          ('Loi ich chinh cua Docker la gi?', 'Dong goi ung dung nhat quan moi moi truong', 'Tang toc do phan cung CPU', 'Tu dong sua code bi loi', 'Thay the hoan toan lap trinh vien', 'A'),
          ('Nginx thuong dong vai tro gi trong kien truc web?', 'Co so du lieu NoSQL', 'Reverse Proxy va Load Balancer', 'He dieu hanh nhung', 'Trinh bien dich ngon ngu', 'B'),
          ('Cong mac dinh cua he quan tri co so du lieu MySQL la?', '80', '8080', '3306', '22', 'C'),
          ('Prometheus la cong cu dung de lam gi?', 'Luu tru file media', 'Giam sat he thong va thu thap metrics', 'Quan ly source code', 'Soan thao van ban', 'B'),
          ('LogQL duoc su dung de truy van log trong cong cu nao?', 'Grafana Loki', 'MySQL', 'Node.js', 'Apache Kafka', 'A')`;
        db.query(sql, () => console.log('Them 5 cau hoi trac nghiem mau thanh cong!'));
      }
    });
  });
}

setTimeout(initDB, 5000);

// Giao dien lam bai thi
app.get('/', (req, res) => {
  db.query('SELECT id, question, option_a, option_b, option_c, option_d FROM questions', (err, questions) => {
    if (err) return res.status(500).send("Loi ket noi co so du lieu: " + err.message);
    
    let html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>He thong Thi Trac Nghiem - De 35</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
    .container { max-width: 750px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    .q-box { margin-bottom: 25px; padding: 15px; border: 1px solid #e1e8ed; border-radius: 6px; }
    .q-title { font-weight: bold; color: #333; margin-bottom: 10px; font-size: 16px; }
    label { display: block; margin: 6px 0; cursor: pointer; }
    button { background: #27ae60; color: white; border: none; padding: 12px 25px; font-size: 16px; border-radius: 5px; cursor: pointer; width: 100%; }
    button:hover { background: #219150; }
  </style>
</head>
<body>
  <div class="container">
    <h1>HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN</h1>
    <p style="text-align: center; color: #7f8c8d;">Đề tài 35: Triển khai và Quản trị Hệ thống Phần mềm</p>
    <form action="/submit" method="POST">`;

    questions.forEach((q, idx) => {
      html += `
      <div class="q-box">
        <div class="q-title">Câu ${idx + 1}: ${q.question}</div>
        <label><input type="radio" name="q_${q.id}" value="A" required> A. ${q.option_a}</label>
        <label><input type="radio" name="q_${q.id}" value="B"> B. ${q.option_b}</label>
        <label><input type="radio" name="q_${q.id}" value="C"> C. ${q.option_c}</label>
        <label><input type="radio" name="q_${q.id}" value="D"> D. ${q.option_d}</label>
      </div>`;
    });

    html += `
      <button type="submit">Nộp Bài và Xem Điểm Số</button>
    </form>
  </div>
</body>
</html>`;
    res.send(html);
  });
});

// Cham diem tu dong
app.post('/submit', (req, res) => {
  db.query('SELECT id, correct_option FROM questions', (err, questions) => {
    if (err) return res.status(500).send("Loi cham diem: " + err.message);
    let score = 0;
    questions.forEach(q => {
      if (req.body[`q_${q.id}`] === q.correct_option) score++;
    });
    const total = questions.length;
    const finalScore = total > 0 ? ((score / total) * 10).toFixed(2) : 0;
    res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Ket Qua Bai Thi</title>
  <style>
    body { font-family: sans-serif; background: #f4f6f9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .card { background: white; padding: 40px; border-radius: 10px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 450px; }
    .score-badge { font-size: 48px; color: #27ae60; font-weight: bold; margin: 20px 0; }
    a { display: inline-block; margin-top: 20px; color: #3498db; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <h2>KẾT QUẢ THI TRẮC NGHIỆM</h2>
    <p>Số câu trả lời chính xác: <b>${score} / ${total}</b></p>
    <div class="score-badge">${finalScore} / 10</div>
    <a href="/">← Quay lại làm bài thi mới</a>
  </div>
</body>
</html>`);
  });
});

app.listen(3000, () => {
  console.log('Quiz application running on port 3000');
});
