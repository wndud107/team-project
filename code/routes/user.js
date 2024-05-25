const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const { ObjectId } = require('mongodb');
const db = require('../data/database');

const router = express.Router();

router.get('/', function (req, res) {
  res.render('index');
});

router.get('/index', function (req, res) {
  res.render('index');
});

router.get('/login', function (req, res) {
  if (req.session.user) {
    res.send('로그인 되었습니다.');
  } else {
    res.render('login', { message: null });
  }
});

router.post('/login', async function (req, res) {
  const { userid, userpw } = req.body;
  try {
    const user = await db.getDb().collection('User_info').findOne({ id_join: userid });

    if (!user || !(await bcrypt.compare(userpw, user.pw_join))) {
      return res.render('login', { message: '아이디 또는 비밀번호를 잘못 입력했습니다.' });
    }

    req.session.user = { id: user.id_join, name: user.name_join };
    res.redirect('/index');
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.send('<script>alert("로그아웃 되었습니다."); window.location.href = "/login";</script>');
  });
});

router.get('/join', function (req, res) {
  res.render('join');
});

router.post('/join', async function (req, res) {
  const { id_join, pw_join, name_join, birth_join, telnumber_join, 'join-gender': join_gender } = req.body;
  const hashedPassword = await bcrypt.hash(pw_join, 12);

  try {
    await db.getDb().collection('User_info').insertOne({
      id_join, pw_join: hashedPassword, name_join, birth_join, telnumber_join, join_gender
    });
    res.redirect('complete-join');
  } catch (error) {
    console.error('Error inserting user:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/complete-join', function (req, res) {
  res.render('complete-join');
});

router.get('/looking-for-id', function (req, res) {
  res.render('looking-for-id', { error: null });
});

router.post('/looking-for-id', async function (req, res) {
  const { username, usertel } = req.body;

  try {
    const user = await db.getDb().collection('User_info').findOne({ name_join: username, telnumber_join: usertel });
    if (user) {
      res.render('complete-LI', { userId: user.id_join });
    } else {
      res.render('looking-for-id', { error: '해당 아이디 또는 이름이 일치하지 않습니다' });
    }
  } catch (error) {
    console.error('아이디 찾기 오류:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/looking-for-pw', function (req, res) {
  res.render('looking-for-pw', { error: null });
});

router.post('/looking-for-pw', async function (req, res) {
  const { userid, username } = req.body;

  try {
    const user = await db.getDb().collection('User_info').findOne({ id_join: userid, name_join: username });
    if (user) {
      res.render('complete-LP', { userPw: user.pw_join });
    } else {
      res.render('looking-for-pw', { error: '해당 아이디 또는 이름이 일치하지 않습니다' });
    }
  } catch (error) {
    console.error('비밀번호 찾기 오류:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/complete-LI', function (req, res) {
  res.render('complete-LI');
});

router.get('/complete-LP', function (req, res) {
  res.render('complete-LP');
});

router.get('/diary', function (req, res) {
  if (!req.session.user) {
    res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  } else {
    res.render('diary');
  }
});

router.post('/save-exercise', async (req, res) => {
  const { date, exercise, reps, sets } = req.body;
  try {
    await db.getDb().collection('User_diary').insertOne({ date, exercise, reps, sets });
    res.send('Exercise saved successfully');
  } catch (error) {
    console.error('Error saving exercise:', error);
    res.status(500).send('Error saving exercise');
  }
});

router.get('/exercises', async (req, res) => {
  const { date } = req.query;
  try {
    const exercises = await db.getDb().collection('User_diary').find({ date }).toArray();
    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).send('Error fetching exercises');
  }
});

router.post('/upload', (req, res) => {
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, '..', 'public', 'uploads');
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).send('Error uploading file');
    }

    const { date, mealType } = fields;
    const oldPath = files.photo.path;
    const newPath = path.join(form.uploadDir, files.photo.name);

    fs.rename(oldPath, newPath, async (err) => {
      if (err) {
        console.error('Error renaming file:', err);
        return res.status(500).send('Error renaming file');
      }

      try {
        await db.getDb().collection('Meals').insertOne({ date, mealType, filename: files.photo.name });
        res.send('File uploaded and data saved successfully');
      } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send('Error saving data');
      }
    });
  });
});

router.get('/meals', async (req, res) => {
  const { date } = req.query;
  try {
    const meals = await db.getDb().collection('Meals').find({ date }).toArray();
    res.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).send('Error fetching meals');
  }
});

router.get('/main-board', function (req, res) {
  res.render('main-board');
});

router.get('/update-board', function (req, res) {
  res.render('update-free-board');
});

router.get('/update-free-board', function (req, res) {
  res.render('update-free-board');
});

router.get('/update-end-board', function (req, res) {
  res.render('update-end-board');
});

router.get('/update-ghwm-board', function (req, res) {
  res.render('update-ghwm-board');
});

router.get('/update-info-board', function (req, res) {
  res.render('update-info-board');
});

router.get('/update-child-board', function (req, res) {
  res.render('update-child-board');
});

router.get('/list_leg', function (req, res) {
  if (!req.session.user) {
    res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  } else {
    res.render('list_leg');
  }
});

router.get('/list_chest', function (req, res) {
  res.render('list_chest');
});

router.get('/list_shoulder', function (req, res) {
  res.render('list_shoulder');
});

router.get('/list_abs', function (req, res) {
  res.render('list_abs');
});

router.get('/list_back', function (req, res) {
  res.render('list_back');
});

router.get('/list_arm', function (req, res) {
  res.render('list_arm');
});

router.get('/list_cardio', function (req, res) {
  res.render('list_cardio');
});

router.get('/list_weight', function (req, res) {
  res.render('list_weight');
});

router.get('/list_etc', function (req, res) {
  res.render('list_etc');
});

router.get('/my-page', async function (req, res) {
  const user = req.session.user;

  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }

  try {
    const userData = await db.getDb().collection('User_info').findOne({ id_join: user.id });

    const freeBoardPosts = await db.getDb().collection('free_board').find({ author: user.id }).toArray();
    const endBoardPosts = await db.getDb().collection('end_board').find({ author: user.id }).toArray();
    const ghwmBoardPosts = await db.getDb().collection('ghwm_board').find({ author: user.id }).toArray();
    const infoBoardPosts = await db.getDb().collection('info_board').find({ author: user.id }).toArray();
    const childBoardPosts = await db.getDb().collection('child_board').find({ author: user.id }).toArray();

    const userPosts = [
      ...freeBoardPosts.map(post => ({ ...post, board: '자유게시판' })),
      ...endBoardPosts.map(post => ({ ...post, board: '오운완게시판' })),
      ...infoBoardPosts.map(post => ({ ...post, board: '정보게시판' })),
      ...ghwmBoardPosts.map(post => ({ ...post, board: '헬린이게시판' })),
      ...childBoardPosts.map(post => ({ ...post, board: 'G.H.W.M 게시판' })),
    ];

    if (userData) {
      res.render('my-page', { user: userData, posts: userPosts });
    } else {
      res.send('<script>alert("사용자 정보를 불러오는 데 실패했습니다."); window.location.href = "/";</script>');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/save-free-board', async function (req, res) {
  const user = req.session.user;

  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }

  const currentDate = new Date();

  try {
    await db.getDb().collection('free_board').insertOne({
      title: req.body.title,
      file: req.body.file,
      content: req.body.content,
      author: user.id,
      date: currentDate,
    });
    res.redirect('/free-board');
  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/save-info-board', async function (req, res) {
  const user = req.session.user;

  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }

  const currentDate = new Date();

  try {
    await db.getDb().collection('info_board').insertOne({
      title: req.body.title,
      file: req.body.file,
      content: req.body.content,
      author: user.id,
      date: currentDate,
    });
    res.redirect('/info-board');
  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/save-end-board', async function (req, res) {
  const user = req.session.user;

  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }

  const currentDate = new Date();

  try {
    await db.getDb().collection('end_board').insertOne({
      title: req.body.title,
      file: req.body.file,
      content: req.body.content,
      author: user.id,
      date: currentDate,
    });
    res.redirect('/end-board');
  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/save-child-board', async function (req, res) {
  const user = req.session.user;

  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }

  const currentDate = new Date();

  try {
    await db.getDb().collection('child_board').insertOne({
      title: req.body.title,
      file: req.body.file,
      content: req.body.content,
      author: user.id,
      date: currentDate,
    });
    res.redirect('/child-board');
  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/save-ghwm-board', async function (req, res) {
  const user = req.session.user;

  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }

  const currentDate = new Date();

  try {
    await db.getDb().collection('ghwm_board').insertOne({
      title: req.body.title,
      file: req.body.file,
      content: req.body.content,
      author: user.id,
      date: currentDate,
    });
    res.redirect('/ghwm-board');
  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});

function formatDate(date) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(date).toLocaleDateString('ko-KR', options);
}

router.get('/info-board', async (req, res) => {
  try {
    const data = await db.getDb().collection('info_board').find().sort({ date: -1 }).toArray();
    const formattedData = data.map((item) => ({
      title: item.title,
      author: item.author,
      date: formatDate(item.date),
    }));
    res.render('info-board', { data: formattedData });
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/free-board', async (req, res) => {
  try {
    const data = await db.getDb().collection('free_board').find().sort({ date: -1 }).toArray();
    const formattedData = data.map((item) => ({
      title: item.title,
      author: item.author,
      date: formatDate(item.date),
    }));
    res.render('free-board', { data: formattedData });
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/end-board', async (req, res) => {
  try {
    const data = await db.getDb().collection('end_board').find().sort({ date: -1 }).toArray();
    const formattedData = data.map((item) => ({
      title: item.title,
      author: item.author,
      date: formatDate(item.date),
    }));
    res.render('end-board', { data: formattedData });
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/child-board', async (req, res) => {
  try {
    const data = await db.getDb().collection('child_board').find().sort({ date: -1 }).toArray();
    const formattedData = data.map((item) => ({
      title: item.title,
      author: item.author,
      date: formatDate(item.date),
    }));
    res.render('child-board', { data: formattedData });
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/ghwm-board', async (req, res) => {
  try {
    const data = await db.getDb().collection('ghwm_board').find().sort({ date: -1 }).toArray();
    const formattedData = data.map((item) => ({
      title: item.title,
      author: item.author,
      date: formatDate(item.date),
    }));
    res.render('ghwm-board', { data: formattedData });
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/free-content/:id', async function (req, res) {
  const id = req.params.id;

  try {
    const post = await db.getDb().collection('free_board').findOne({ _id: new ObjectId(id) });

    if (post) {
      res.render('free-content', { data: post });
    } else {
      res.status(404).send('게시물을 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
