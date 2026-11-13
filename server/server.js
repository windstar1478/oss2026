const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// public 폴더 내의 정적 파일(index.html, style.css, JS 파일) 서빙
app.use(express.static(path.join(__dirname, '../public')));

// 헬스체크 API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Caffeine Diary Server is running' });
});

// 메인 페이지 전달
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`서버가 실행되었습니다!`);
  console.log(`접속 주소: http://localhost:${PORT}`);
  console.log(`========================================`);
});

// 라우터 연결
const caffeineRouter = require('./routes/caffeine');
app.use('/api/caffeine', caffeineRouter);
