const fs = require('fs');
const path = require('path');

const express = require('express');
const { restart } = require('nodemon');

const app = express();

// Express에 EJS를 사용하기 위한 설정
app.set('views', path.join(__dirname,'views')); // views 디렉토리 설정
app.set('view engine','ejs');

// 정적 파일을 제공하기 위해 static 미들웨어 사용
app.use(express.static('public'));

// POST 요청의 body를 파싱하기 위한 미들웨어 추가
app.use(express.urlencoded({ extended: false }));

// 사용자 데이터를 저장하기 위한 가상의 데이터베이스

app.get('/', function(req,res){
  res.render('index');
});

app.get('/index', function(req,res){
  res.render('index');
});

// 로그인 페이지로 이동하는 라우트
app.get('/login', function (req, res) {
  res.render('login', { message: null });
});

// 로그인 요청 처리하는 라우트
app.post('/login', function (req, res) {
  const { userid, userpw } = req.body;
  const user = users.find(u => u.userid === userid && u.userpw === userpw);
  if (user) {
    res.send(`로그인 성공! 환영합니다, ${userid}님`);
  } else {
    res.render('login', { message: '아이디 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.' });
  }
});

// 회원가입 페이지로 이동하는 라우트
app.get('/join', function (req, res) {
  res.render('join');
});

// 회원가입 요청 처리하는 라우트
app.post('/join', function (req, res) {
  const join= req.body;

  const filePath = path.join(__dirname, 'data', 'joins.json');
  const fileData = fs.readFileSync(filePath);
  const storedJoins = JSON.parse(fileData);

  storedJoins.push(join);

  fs.writeFileSync(filePath, JSON.stringify(storedJoins));

  console.log('complete-join으로 리다이렉팅 중...');
  res.redirect('complete-join');
});

app.get('/complete-join', function(req, res) {
  res.render('complete-join');
});

app.get('/test', function(req,res) {
  res.render('test');
});

app.get('/looking-for-id', function(req,res) {
  res.render('looking-for-id', { error: null } );
});

app.post('/looking-for-id', function(req, res) {
  const { username, usertel } = req.body;
  const filePath = path.join(__dirname, 'data', 'joins.json');
  const fileData = fs.readFileSync(filePath);
  const users = JSON.parse(fileData);

  const user = users.find(u => u.name_join === username && u.telnumber_join === usertel);
  
  if (user) {
    res.render('complete-LI', { userId: user['id_join'] }); 
  } else {
    res.render('looking-for-id', { error: '해당 아이디 또는 이름이 일치하지 않습니다' });
  }
});

app.get('/looking-for-pw', function(req,res) {
  res.render('looking-for-pw', { error: null });
});

app.post('/looking-for-pw', function(req, res) {
  const { userid, username } = req.body;
  const filePath = path.join(__dirname, 'data', 'joins.json');
  const fileData = fs.readFileSync(filePath);
  const users = JSON.parse(fileData);

  const user = users.find(u => u.id_join === userid && u.name_join === username);
  
  if (user) {
      res.render('complete-LP', { userPw: user['pw_join'] });
  } else {
      res.render('looking-for-pw', { error: '해당 아이디 또는 이름이 일치하지 않습니다' });
  }
});

app.get('/complete-LI', function(req,res) {
  res.render('complete-LI');
});

app.get('/complete-LP', function(req,res) {
  res.render('complete-LP');
});

// 서버를 3000 포트에서 시작
app.listen(3000, () => {
  console.log('localhost:3000/');
});
