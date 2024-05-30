const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const mypageRoutes = require('./routes/my-page');
const db = require('./data/database');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'dkufe8938493j4e08349u',
  resave: false,
  saveUninitialized: true,
}));

// 사용자 정보를 모든 템플릿에 전달하는 미들웨어
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Routes
app.use(userRoutes);
app.use(mypageRoutes);


app.use(function (error, req, res, next) {
  console.error(error);
  res.status(500).render('500');
});

db.connectToDatabase().then(function () {
  app.listen(3000, function () {
    console.log('Server is running on localhost:3000');
  });
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});
