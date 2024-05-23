const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://songhyojun:jySM0DpoGblpnTIW@songhyojun.tvwku08.mongodb.net/';
let mydb;

const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// express-session 미들웨어 설정
let session = require('express-session');
app.use(session({
  secret: 'dkufe8938493j4e08349u', // 세션 암호화에 사용되는 비밀 키
  resave: false, // 변경되지 않은 세션도 다시 저장할지 여부
  saveUninitialized: true // 초기화되지 않은 세션을 저장할지 여부
}))

// body-parser 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// 사용자 정보를 모든 템플릿에 전달하는 미들웨어
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

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
  console.log(req.session);
  if(req.session.user){
    console.log('세션 유지');
    res.send('로그인 되었습니다.');
  }else{
    res.render('login', { message: null });
  }
  
});

app.post('/login', function(req, res) {
  const { userid, userpw } = req.body;
  mydb.collection('User_info').findOne({ id_join: userid, pw_join: userpw }) // 컬렉션 이름 확인
    .then(user => {
      if (user) {
        req.session.user = {
          id: user.id_join,
          name: user.name_join
        }
        console.log('새로운 로그인')
        res.render('index', { user });
      } else {
        res.render('login', { message: '아이디 또는 비밀번호를 잘못 입력했습니다.' });
      }
    })
    .catch(error => console.error('Error finding user:', error));
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.send('<script>alert("로그아웃 되었습니다."); window.location.href = "/login";</script>');
    console.log('로그아웃')
  });
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


app.get('/diary', function(req, res) {
  if (!req.session.user) {
    // 로그인되어 있지 않으면 알림창을 띄우고 로그인 페이지로 리다이렉트
    res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  } else {
    // 로그인되어 있으면 다이어리 페이지로 이동
    res.render('diary');
  }
});

app.get('/main-board', function(req, res) {
  res.render('main-board');
});

app.get('/update-board', function(req, res) {
  res.render('update-free-board');
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

app.get('/list_leg', (req, res) => {
  if (!req.session.user) {
    // 로그인되어 있지 않으면 알림창을 띄우고 로그인 페이지로 리다이렉트
    res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  } else {
    // 로그인되어 있으면 페이지를 렌더링
    res.render('list_leg');
  }
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

app.post('/my-page', function (req, res) {
  res.render('my-page');
})

app.post('/save-free-board', function (req, res) {
  console.log(req.body.title);
  console.log(req.body.file);
  console.log(req.body.content);

  // 세션에서 사용자 정보 가져오기
  const user = req.session.user;

  // 사용자가 로그인되어 있지 않다면 알림창을 띄우고 로그인 페이지로 리다이렉트
  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }

  // 현재 날짜와 시간을 생성
  const currentDate = new Date();

  //몽고DB에 데이터 저장하기
  mydb.collection('free_board').insertOne(
    {title: req.body.title, file: req.body.file, content:req.body.content, author:user.id, date: currentDate}
  ).then(result=> {
    console.log(result);
    console.log('데이터 추가 성공')
    // 데이터를 추가한 후, 다시 info-board 페이지로 리다이렉트
    res.redirect("/free-board");
  })
  .catch(error => {
    console.error('Error inserting data into MongoDB:', error);
    res.status(500).send('Internal Server Error');
  });
});

app.post('/save-info-board', function (req, res) {
  console.log(req.body.title);
  console.log(req.body.file);
  console.log(req.body.content);

  // 세션에서 사용자 정보 가져오기
  const user = req.session.user;

  // 사용자가 로그인되어 있지 않다면 알림창을 띄우고 로그인 페이지로 리다이렉트
  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }

  // 현재 날짜와 시간을 생성
  const currentDate = new Date();

  //몽고DB에 데이터 저장하기
  mydb.collection('info_board').insertOne(
    {title: req.body.title, file: req.body.file, content:req.body.content, author:user.id, date: currentDate}
  ).then(result=> {
    console.log(result);
    console.log('데이터 추가 성공')
    // 데이터를 추가한 후, 다시 info-board 페이지로 리다이렉트
    res.redirect("/info-board");
  })
  .catch(error => {
    console.error('Error inserting data into MongoDB:', error);
    res.status(500).send('Internal Server Error');
  });
});

app.post('/save-end-board', function (req, res) {
  console.log(req.body.title);
  console.log(req.body.file);
  console.log(req.body.content);

  // 세션에서 사용자 정보 가져오기
  const user = req.session.user;

  // 사용자가 로그인되어 있지 않다면 알림창을 띄우고 로그인 페이지로 리다이렉트
  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }

  // 현재 날짜와 시간을 생성
  const currentDate = new Date();

  //몽고DB에 데이터 저장하기
  mydb.collection('end_board').insertOne(
    {title: req.body.title, file: req.body.file, content:req.body.content, author:user.id, date: currentDate}
  ).then(result=> {
    console.log(result);
    console.log('데이터 추가 성공')
    // 데이터를 추가한 후, 다시 info-board 페이지로 리다이렉트
    res.redirect("/end-board");
  })
  .catch(error => {
    console.error('Error inserting data into MongoDB:', error);
    res.status(500).send('Internal Server Error');
  });
});

app.post('/save-child-board', function (req, res) {
  console.log(req.body.title);
  console.log(req.body.file);
  console.log(req.body.content);

  // 세션에서 사용자 정보 가져오기
  const user = req.session.user;

  // 사용자가 로그인되어 있지 않다면 알림창을 띄우고 로그인 페이지로 리다이렉트
  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }

  // 현재 날짜와 시간을 생성
  const currentDate = new Date();

  //몽고DB에 데이터 저장하기
  mydb.collection('child_board').insertOne(
    {title: req.body.title, file: req.body.file, content:req.body.content, author:user.id, date: currentDate}
  ).then(result=> {
    console.log(result);
    console.log('데이터 추가 성공')
    // 데이터를 추가한 후, 다시 info-board 페이지로 리다이렉트
    res.redirect("/child-board");
  })
  .catch(error => {
    console.error('Error inserting data into MongoDB:', error);
    res.status(500).send('Internal Server Error');
  });
});

app.post('/save-ghwm-board', function (req, res) {
  console.log(req.body.title);
  console.log(req.body.file);
  console.log(req.body.content);

  // 세션에서 사용자 정보 가져오기
  const user = req.session.user;

  // 사용자가 로그인되어 있지 않다면 알림창을 띄우고 로그인 페이지로 리다이렉트
  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }

  // 현재 날짜와 시간을 생성
  const currentDate = new Date();

  //몽고DB에 데이터 저장하기
  mydb.collection('ghwm_board').insertOne(
    {title: req.body.title, file: req.body.file, content:req.body.content, author:user.id, date: currentDate}
  ).then(result=> {
    console.log(result);
    console.log('데이터 추가 성공')
    // 데이터를 추가한 후, 다시 info-board 페이지로 리다이렉트
    res.redirect("/ghwm-board");
  })
  .catch(error => {
    console.error('Error inserting data into MongoDB:', error);
    res.status(500).send('Internal Server Error');
  });
});

// 날짜를 원하는 형식으로 변환하는 함수
function formatDate(date) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(date).toLocaleDateString('ko-KR', options);
}

app.get('/info-board', (req, res) => {
  // Fetch data from MongoDB collection and sort by date in descending order
  mydb.collection('info_board').find().sort({ date: -1 }).toArray()
    .then(data => {
      // 날짜를 변환하여 뷰에 전달
      const formattedData = data.map(item => {
        return {
          title: item.title,
          author: item.author,
          // 변환된 날짜를 전달
          date: formatDate(item.date)
        };
      });
      res.render('info-board', { data: formattedData }); // Pass the sorted and formatted data to the view
    })
    .catch(error => {
      console.error('Error fetching data from MongoDB:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/free-board', (req, res) => {
  // Fetch data from MongoDB collection and sort by date in descending order
  mydb.collection('free_board').find().sort({ date: -1 }).toArray()
    .then(data => {
      // 날짜를 변환하여 뷰에 전달
      const formattedData = data.map(item => {
        return {
          title: item.title,
          author: item.author,
          // 변환된 날짜를 전달
          date: formatDate(item.date)
        };
      });
      res.render('free-board', { data: formattedData }); // Pass the sorted and formatted data to the view
    })
    .catch(error => {
      console.error('Error fetching data from MongoDB:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/end-board', (req, res) => {
  // Fetch data from MongoDB collection and sort by date in descending order
  mydb.collection('end_board').find().sort({ date: -1 }).toArray()
    .then(data => {
      // 날짜를 변환하여 뷰에 전달
      const formattedData = data.map(item => {
        return {
          title: item.title,
          author: item.author,
          // 변환된 날짜를 전달
          date: formatDate(item.date)
        };
      });
      res.render('end-board', { data: formattedData }); // Pass the sorted and formatted data to the view
    })
    .catch(error => {
      console.error('Error fetching data from MongoDB:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/child-board', (req, res) => {
  // Fetch data from MongoDB collection and sort by date in descending order
  mydb.collection('child_board').find().sort({ date: -1 }).toArray()
    .then(data => {
      // 날짜를 변환하여 뷰에 전달
      const formattedData = data.map(item => {
        return {
          title: item.title,
          author: item.author,
          // 변환된 날짜를 전달
          date: formatDate(item.date)
        };
      });
      res.render('child-board', { data: formattedData }); // Pass the sorted and formatted data to the view
    })
    .catch(error => {
      console.error('Error fetching data from MongoDB:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/ghwm-board', (req, res) => {
  // Fetch data from MongoDB collection and sort by date in descending order
  mydb.collection('ghwm_board').find().sort({ date: -1 }).toArray()
    .then(data => {
      // 날짜를 변환하여 뷰에 전달
      const formattedData = data.map(item => {
        return {
          title: item.title,
          author: item.author,
          // 변환된 날짜를 전달
          date: formatDate(item.date)
        };
      });
      res.render('ghwm-board', { data: formattedData }); // Pass the sorted and formatted data to the view
    })
    .catch(error => {
      console.error('Error fetching data from MongoDB:', error);
      res.status(500).send('Internal Server Error');
    });
});
