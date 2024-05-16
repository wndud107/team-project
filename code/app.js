// mongodb 연결
const mongoclient = require('mongodb').MongoClient;
const url = 'mongodb+srv://songhyojun:qpdCa0vTaBry6lv7@songhyojun.tvwku08.mongodb.net/?retryWrites=true&w=majority&appName=songhyojun';
let mydb;
mongoclient.connect(url).then(client => {
  mydb = client.db('account');
  mydb.collection('post').find().toArray().then(result => {
    console.log(result);
  })

  app.listen(3000, function(){
    console.log('localhost:3000/');
  });
}).catch(err => {
  console.log(err);
})

const fs = require('fs');
const path = require('path');

const express = require('express');
const { restart } = require('nodemon');

const app = express();

// body-parser 라이브러리 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

// Express에 EJS를 사용하기 위한 설정
app.set('views', path.join(__dirname,'views')); // views 디렉토리 설정
app.set('view engine','ejs');

// 정적 파일을 제공하기 위해 static 미들웨어 사용
app.use(express.static('public'));

// POST 요청의 body를 파싱하기 위한 미들웨어 추가
app.use(express.urlencoded({ extended: false }));

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
  mydb.collection('post').findOne({id_join: userid, pw_join: userpw}
  ).then(user => {
    if (user) {
      res.render('index', {user});
    } else {
      res.render('login', { message: '아이디 또는 비밀번호를 잘못 입력했습니다.' });
    }
  }).catch(error => console.error('Error finding user:', error));


});

// 회원가입 페이지로 이동하는 라우트
app.get('/join', function (req, res) {
  res.render('join');
});

// 회원가입 요청 처리하는 라우트
app.post('/join', function (req, res) {
  const join = req.body;

  //몽고DB에 데이터 저장하기
  mydb.collection('post').insertOne(join).then(result => {
    console.log('데이터 추가 성공');
    console.log('complete-join으로 리다이렉팅 중...');
    res.redirect('complete-join');
  });

  const filePath = path.join(__dirname, 'data', 'joins.json');
  const fileData = fs.readFileSync(filePath);
  const storedJoins = JSON.parse(fileData);

  storedJoins.push(join);

  fs.writeFileSync(filePath, JSON.stringify(storedJoins));

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

  mydb.collection('post').findOne({ name_join: username, telnumber_join: usertel })
    .then(user => {
      if (user) {
        res.render('complete-LI', { userId: user.id_join }); // 사용자가 있으면 아이디 찾기 성공 창 띄우기
      } else {
        res.render('looking-for-id', { error: '해당 아이디 또는 이름이 일치하지 않습니다' }); // 사용자가 없으면 오류 메시지 출력
      }
    })
    .catch(error => console.error('아이디 찾기 오류:', error));
});

app.get('/looking-for-pw', function(req,res) {
  res.render('looking-for-pw', { error: null });
});

app.post('/looking-for-pw', function(req, res) {
  const { userid, username } = req.body;
  const filePath = path.join(__dirname, 'data', 'joins.json');
  const fileData = fs.readFileSync(filePath);
  const users = JSON.parse(fileData);

  mydb.collection('post').findOne({ id_join: userid, name_join: username })
    .then(user => {
      if (user) {
        res.render('complete-LP', { userPw: user.pw_join }); // 사용자가 있으면 비밀번호 찾기 성공 창 띄우기
      } else {
        res.render('looking-for-pw', { error: '해당 아이디 또는 이름이 일치하지 않습니다' }); // 사용자가 없으면 오류 메시지 출력
      }
    })
    .catch(error => console.error('비밀번호 찾기 오류:', error));
});

app.get('/complete-LI', function(req,res) {
  res.render('complete-LI');
});

app.get('/complete-LP', function(req,res) {
  res.render('complete-LP');
});

app.get('/diary', function(req,res){
  res.render('diary');
});

app.get('/update-board', function(req,res){
  res.render('update-board');
});

app.get('leg_list', function (req, res) {
  res.render('leg_list');
});

app.get('chest_list', function (req, res) {
  res.render('chest_list');
});

app.get('shoulder_list', function (req, res) {
  res.render('chest_list');
});

app.get('abs_list', function (req, res) {
  res.render('chest_list');
});

app.get('arm_list', function (req, res) {
  res.render('chest_list');
});

app.get('cardio_list', function (req, res) {
  res.render('chest_list');
});

app.get('wieght_list', function (req, res) {
  res.render('chest_list');
});

app.get('stretching_list', function (req, res) {
  res.render('chest_list');
});

app.get('etc_list', function (req, res) {
  res.render('chest_list');
});
