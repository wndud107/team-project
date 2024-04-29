// app.js

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// 사용자 데이터를 저장하기 위한 가상의 데이터베이스
let users = [];

// 정적 파일을 제공하기 위해 static 미들웨어를 사용합니다.
app.use(express.static('public'));

// POST 요청의 body를 파싱하기 위한 미들웨어를 추가합니다.
app.use(bodyParser.urlencoded({ extended: true }));

// 로그인 페이지로 이동하는 라우트
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// 회원가입 페이지로 이동하는 라우트
app.get('/join', (req, res) => {
  res.sendFile(__dirname + '/public/join.html');
});

// 로그인 요청 처리하는 라우트
app.post('/login', (req, res) => {
  const { userid, userpw } = req.body;
  const user = users.find(u => u.userid === userid && u.userpw === userpw);
  if (user) {
    res.send(`로그인 성공! 환영합니다, ${userid}님`);
  } else {
    res.send('아이디 또는 비밀번호가 올바르지 않습니다.');
  }
});

// 회원가입 요청 처리하는 라우트
app.post('/join', (req, res) => {
  const { joinEmail, joinPassword, joinName, joinBirth, joinTelnumber, joinGender } = req.body;
  // 가상의 데이터베이스에 새로운 사용자 추가
  users.push({ userid: joinEmail, userpw: joinPassword, name: joinName, birth: joinBirth, telnumber: joinTelnumber, gender: joinGender });
  res.send('회원가입이 완료되었습니다!');
});

// 서버를 3000 포트에서 시작합니다.
app.listen(3000, () => {
  console.log('서버가 3000번 포트에서 실행 중입니다.');
});

