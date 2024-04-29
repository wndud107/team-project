const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Express에 EJS를 사용하기 위한 설정
app.set('view engine', 'ejs');
app.set('views', 'views'); // views 디렉토리 설정

// 사용자 데이터를 저장하기 위한 가상의 데이터베이스
let users = [];

// 정적 파일을 제공하기 위해 static 미들웨어를 사용
app.use(express.static('public'));

// POST 요청의 body를 파싱하기 위한 미들웨어를 추가
app.use(bodyParser.urlencoded({ extended: true }));

// 로그인 페이지로 이동하는 라우트
app.get('/login', (req, res) => {
  res.render('login', { message: null });
});

// 회원가입 페이지로 이동하는 라우트
app.get('/join', (req, res) => {
  res.render('join');
});

// 로그인 요청 처리하는 라우트
app.post('/login', (req, res) => {
  const { userid, userpw } = req.body;
  const user = users.find(u => u.userid === userid && u.userpw === userpw);
  if (user) {
    res.send(`로그인 성공! 환영합니다, ${userid}님`);
  } else {
    res.render('login', { message: '아이디 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.' });
  }
});

// 회원가입 요청 처리하는 라우트
app.post('/join', (req, res) => {
  const { joinEmail, joinPassword, joinName, joinBirth, joinTelnumber, joinGender } = req.body;
  // 가상의 데이터베이스에 새로운 사용자 추가
  users.push({ userid: joinEmail, userpw: joinPassword, name: joinName, birth: joinBirth, telnumber: joinTelnumber, gender: joinGender });
  res.send('회원가입이 완료되었습니다!');
});

// 서버를 3000 포트에서 시작
app.listen(3000, () => {
  console.log('서버가 3000번 포트에서 실행 중 . . .');
});
