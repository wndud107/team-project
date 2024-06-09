const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const { ObjectId } = require("mongodb");
const db = require("../data/database");
const multer = require('multer');

const dir = path.join(__dirname, '../public/meal_images');

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const router = express.Router();

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../public/meal_images');
    cb(null, dir); // 파일이 저장될 경로
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // 파일명 설정 (현재 시간 + 원래 파일명)
  }
});

const upload = multer({storage : storage});

// 아침, 점심, 저녁 식단 사진 저장 라우트
router.post('/save-meals', upload.fields([{ name: 'morningMeal' }, { name: 'lunchMeal' }, { name: 'dinnerMeal' }]), async (req, res) => {
  console.log('파일 업로드 시작');
  const { date } = req.body;
  const user = req.session.user;
  console.log('req.body:', req.body); // req.body 출력하여 값 확인
  const mealData = [];
  
  if (req.files.morningMeal) {
    mealData.push({
      author: user.id,
      date: date,
      mealType: '아침',
      filename: req.files.morningMeal[0].filename,
      imagePath: req.files.morningMeal[0].path
    });
  }

  if (req.files.lunchMeal) {
    mealData.push({
      author: user.id,
      date: date,
      mealType: '점심',
      filename: req.files.lunchMeal[0].filename,
      imagePath: req.files.lunchMeal[0].path
    });
  }

  if (req.files.dinnerMeal) {
    mealData.push({
      author: user.id,
      date: date,
      mealType: '저녁',
      filename: req.files.dinnerMeal[0].filename,
      imagePath: req.files.dinnerMeal[0].path
    });
  }

  try {
    if (mealData.length > 0) {
      await db.getDb().collection("User_diary_meals").insertMany(mealData);
      res.redirect('/diary');
    } else {
      res.status(400).send("파일 업로드 실패");
    }
  } catch (error) {
    console.error("Error saving meal:", error);
    res.status(500).send("Error saving meal");
  }
});

// 식단 목록 가져오기 라우트
router.get("/meals", async (req, res) => {
  const { date } = req.query;
  const user = req.session.user;
  try {
    const meals = await db.getDb().collection("User_diary_meals")
    .find({ date, author: user.id })
    .toArray();
    res.json(meals);
  } catch (error) {
    console.error("Error fetching meals:", error);
    res.status(500).send("Error fetching meals");
  }
});

// 식단 삭제 라우트
router.delete('/delete-meal/:id', async (req, res) => {
  const mealId = req.params.id;
  try {
    const result = await db.getDb().collection("User_diary_meals").deleteOne({ _id: new ObjectId(mealId) });
    if (result.deletedCount > 0) {
      res.json({ message: "Meal deleted successfully" });
    } else {
      res.status(404).json({ message: "Meal not found" });
    }
  } catch (error) {
    console.error("Error deleting meal:", error);
    res.status(500).json({ message: "Error deleting meal" });
  }
});

router.get("/diary", async function (req, res) {
    const user = req.session.user;
    if (!user) {
      res.send(
        '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
      );
      return;
    }
    try {
      const userData = await db
        .getDb()
        .collection("User_info")
        .findOne({ id_join: user.id });
  
      if (userData) {
        const currentDate = new Date();
        const goalDate = new Date(userData.goal_date_join);
        const dDay = Math.ceil((goalDate - currentDate) / (1000 * 60 * 60 * 24));
        const goalWeight = userData.goal_weight_join;

        // 해당 유저의 날짜별 운동 기록을 불러오기
        const exerciseLogs = await db.getDb().collection("User_diary_exlogs").find({ author: user.id }).toArray();

        res.render("diary", { user: userData, dDay: dDay , goalWeight:goalWeight, exerciseLogs: exerciseLogs} );
      } else {
        res.send(
          '<script>alert("사용자 정보를 불러오는 데 실패했습니다."); window.location.href = "/";</script>'
        );
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).send("Internal Server Error");
    }
  });

// 운동 저장하기 라우트 
router.post("/save-exercise", async (req, res) => {
  const { date, exercise, reps, sets } = req.body;
  const user = req.session.user;
  try {
    const result = await db.getDb().collection("User_diary").insertOne({ 
      author : user.id, 
      date, 
      exercise, 
      reps, 
      sets, 
      checked: false });

    // 해당 날짜의 운동 기록 수 업데이트
    await db.getDb().collection("User_diary_exlogs").updateOne(
      { author: user.id, date: date },
      { $inc: { count: 1 } },
      { upsert: true });

    res.json({ message: "Exercise saved successfully", _id: result.insertedId}); // _id 반환
  } catch (error) {
    console.error("Error saving exercise:", error);
    res.status(500).send("Error saving exercise");
  }
});
  
// 운동 목록 가져오기 라우트
router.get("/exercises", async (req, res) => {
  const { date } = req.query;
  const user = req.session.user;
  try {
    const exercises = await db
      .getDb()
      .collection("User_diary")
      .find({ date, author: user.id })
      .toArray();
    res.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).send("Error fetching exercises");
  }
});
  
// 운동 상태 업데이트 라우트
router.post('/update-exercise', async (req, res) => {
  const { id, checked } = req.body;
  try {
    const result = await db.getDb().collection('User_diary').updateOne(
      { _id: new ObjectId(id) },
      { $set: { checked: checked } }
    );
    res.json({ message: 'Exercise updated successfully', result });
  } catch (error) {
    console.error('Error updating exercise status:', error);
    res.status(500).send('Error updating exercise status');
  }
});

// 운동 기록 수 가져오기 라우트
router.get("/exercise-logs", async (req, res) => {
  const user = req.session.user;
  try {
    const exerciseLogs = await db.getDb().collection("User_diary_exlogs").aggregate([
        { $match: { author: user.id } },
        { $group: { _id: "$date", count: { $sum: 1 } } }
    ]).toArray();
    res.json(exerciseLogs);
  } catch (error) {
    console.error("Error fetching exercise logs:", error);
    res.status(500).send("Error fetching exercise logs");
  }
});
  
// 운동 목록 삭제
router.post("/delete-exercise", async function (req, res) {
  const { id, date } = req.body;
  const user = req.session.user;
  try {
    await db.getDb().collection("User_diary").deleteOne({
        _id: new ObjectId(id),
        author: user.id
    });

    // 해당 날짜의 운동 기록 수 감소
    await db.getDb().collection("User_diary_exlogs").updateOne(
      { author: user.id, date: date },
      { $inc: { count: -1 } });

    res.status(200).json({ message: 'Exercise data deleted successfully' });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    res.status(500).send("Error deleting exercise");
  }
});
  
// 체중 저장하기 라우트 
router.post("/save-weight", async (req, res) => {
  const { weight, date } = req.body;
  const user = req.session.user;

  if (!weight ) {
    return res.status(400).json({ message: "체중을 입력해주세요." });
  }

  try {
    const result = await db.getDb().collection("User_inbody").insertOne({ 
      author : user.id, 
      date : date, 
      weight : weight });

    res.json({ message: "Weight saved successfully", _id: result.insertedId }); // _id 반환
  } catch (error) {
    console.error("Error saving weight:", error);
    res.status(500).send("Error saving weight");
  }
  console.log(`Date: ${date}, Weight: ${weight}`);
});

// 체중 목록 가져오기 라우트
router.get("/weight", async (req, res) => {
  const { date } = req.query;
  const user = req.session.user;
  try {
    const weight = await db
      .getDb()
      .collection("User_inbody")
      .find({ date, author: user.id })
      .toArray();
    res.json(weight);
  } catch (error) {
    console.error("Error fetching weight:", error);
    res.status(500).send("Error fetching weight");
  }
});

// 체중 목록 삭제 
router.post("/delete-weight", async function (req, res) {
  const { date, weight } = req.body;
  const user = req.session.user;

  try {
    await db.getDb().collection("User_inbody").deleteOne({
      author: user.id,
      date, 
      weight
    });
    res.send("Weight deleted successfully");
  } catch (error) {
    console.error("Error deleting weight:", error);
    res.status(500).send("Error deleting weight");
  }
});

module.exports = router;
