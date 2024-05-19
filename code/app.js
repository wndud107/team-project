const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://Songhyojun:9O4KbqHDe8dqGsvm@cluster80502.o9ppw6e.mongodb.net/';
let mydb;

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

MongoClient.connect(url, )
  .then(client => {
    console.log('Connected to MongoDB');
    mydb = client.db('User'); // 데이터베이스 이름 확인
    app.listen(3000, function() {
      console.log('Server is running on localhost:3000');
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/index', function(req, res) {
  res.render('index');
});

app.get('/login', function(req, res) {
  res.render('login', { message: null });
});

app.post('/login', function(req, res) {
  const { userid, userpw } = req.body;
  mydb.collection('User_info').findOne({ id_join: userid, pw_join: userpw }) // 컬렉션 이름 확인
    .then(user => {
      if (user) {
        res.render('index', { user });
      } else {
        res.render('login', { message: '아이디 또는 비밀번호를 잘못 입력했습니다.' });
      }
    })
    .catch(error => console.error('Error finding user:', error));
});

app.get('/join', function(req, res) {
  res.render('join');
});

app.post('/join', function(req, res) {
  const join = req.body;

  mydb.collection('User_info').insertOne(join) // 컬렉션 이름 확인
    .then(result => {
      console.log('데이터 추가 성공');
      console.log('complete-join으로 리다이렉팅 중...');
      res.redirect('complete-join');
    })
    .catch(error => console.error('Error inserting user:', error));

  const filePath = path.join(__dirname, 'data', 'joins.json');
  const fileData = fs.readFileSync(filePath);
  const storedJoins = JSON.parse(fileData);

  storedJoins.push(join);

  fs.writeFileSync(filePath, JSON.stringify(storedJoins));
});

app.get('/complete-join', function(req, res) {
  res.render('complete-join');
});

app.get('/looking-for-id', function(req, res) {
  res.render('looking-for-id', { error: null });
});

app.post('/looking-for-id', function(req, res) {
  const { username, usertel } = req.body;

  mydb.collection('User_info').findOne({ name_join: username, telnumber_join: usertel })
    .then(user => {
      if (user) {
        res.render('complete-LI', { userId: user.id_join });
      } else {
        res.render('looking-for-id', { error: '해당 아이디 또는 이름이 일치하지 않습니다' });
      }
    })
    .catch(error => console.error('아이디 찾기 오류:', error));
});

app.get('/looking-for-pw', function(req, res) {
  res.render('looking-for-pw', { error: null });
});

app.post('/looking-for-pw', function(req, res) {
  const { userid, username } = req.body;

  mydb.collection('User_info').findOne({ id_join: userid, name_join: username })
    .then(user => {
      if (user) {
        res.render('complete-LP', { userPw: user.pw_join });
      } else {
        res.render('looking-for-pw', { error: '해당 아이디 또는 이름이 일치하지 않습니다' });
      }
    })
    .catch(error => console.error('비밀번호 찾기 오류:', error));
});

app.get('/complete-LI', function(req, res) {
  res.render('complete-LI');
});

app.get('/complete-LP', function(req, res) {
  res.render('complete-LP');
});

// 다른 라우트들...

app.get('/diary', function(req, res) {
  res.render('diary');
});

app.get('/update-free-board', function(req, res) {
  res.render('update-free-board');
});

// ... 나머지 라우트들
app.get('/update-end-board', function(req,res){
  res.render('update-end-board');
});

app.get('/update-ghwm-board', function(req,res){
  res.render('update-ghwm-board');
});

app.get('/update-info-board', function(req,res){
  res.render('update-info-board');
});

app.get('/update-child-board', function(req,res){
  res.render('update-child-board');
});

app.get('/free-board', function(req,res){
  res.render('free-board');
});

app.get('/list_leg', function (req, res) {
  res.render('list_leg');
});

app.get('/list_chest', function (req, res) {
  res.render('list_chest');
});

app.get('/list_shoulder', function (req, res) {
  res.render('list_shoulder');
});

app.get('/list_abs', function (req, res) {
  res.render('list_abs');
});

app.get('/list_back', function (req, res) {
  res.render('list_back');
});

app.get('/list_arm', function (req, res) {
  res.render('list_arm');
});

app.get('/list_cardio', function (req, res) {
  res.render('list_cardio');
});

app.get('/list_weight', function (req, res) {
  res.render('list_weight');
});

app.get('/list_etc', function (req, res) {
  res.render('list_etc');
});
