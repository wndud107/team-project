const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const { ObjectId } = require("mongodb");
const db = require("../data/database");
const multer = require('multer');

//업로드된 파일의 경로가 실제 서버의 디렉터리 구조와 일치하는지 확인
if (!fs.existsSync('./public/meal_images')){
    fs.mkdirSync('./public/meal_images', { recursive: true });
}

if (!fs.existsSync('./public/nunbody_images')){
  fs.mkdirSync('./public/nunbody_images', { recursive: true });
}

const router = express.Router();

// JSON 및 URL-encoded 데이터 파싱
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpg|jpeg|png|webp/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, .png, and .webp files are allowed!"));
  }
};


// 식단 Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/meal_images'); // 파일이 저장될 경로
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // 파일명 설정 (현재 시간 + 원래 파일명)
  }
});

// 눈바디 Multer 설정
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/nunbody_images'); // 파일이 저장될 경로
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // 파일명 설정 (현재 시간 + 원래 파일명)
  }
});

// 정적 파일 제공을 위해 /meal_images 경로 설정
router.use('/meal_images', express.static(path.join(__dirname, '../public/meal_images')));

// 정적 파일 제공을 위해 /nunbody_images 경로 설정
router.use('/nunbody_images', express.static(path.join(__dirname, '../public/nunbody_images')));


// 식단 사진 업로드
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// 눈바디 사진 업로드
const upload2 = multer({
  storage: storage2,
  fileFilter: fileFilter,
});

///////////////////////

router.get("/diary", async function (req, res) {
  const user = req.session.user;
  const { date } = req.query;

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
      
      // 해당 유저의 식단 기록 불러오기
      const meals = await db.getDb().collection("User_diary_meals").find({ author: user.id, date }).toArray();
      
      // 식단 기록을 아침, 점심, 저녁으로 분리
      const morningMeals = meals.filter(meal => meal.mealType === '아침');
      const lunchMeals = meals.filter(meal => meal.mealType === '점심');
      const dinnerMeals = meals.filter(meal => meal.mealType === '저녁');

      // 인바디 사진 기록 불러오기
      const nunbodyPhoto = await db.getDb().collection("User_diary_nunbody").findOne({ author: user.id, date });

      
      res.render("diary", { 
        user: userData, 
        dDay: dDay, 
        goalWeight: goalWeight, 
        exerciseLogs: exerciseLogs,
        morningMeals,
        lunchMeals,
        dinnerMeals,
        nunbodyPhoto, // nunbodyPhoto를 템플릿에 전달
        selectedDate: date // 선택된 날짜를 템플릿에 전달합니다.
      });
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



//////////////// 운동 ////////////////////////

// 운동 저장하기 라우트 
router.post("/save-exercise", async (req, res) => {
  const { date, exercise, reps, sets } = req.body;
  const user = req.session.user;
  try {
    const result = await db.getDb().collection("User_diary").insertOne({ 
      author: user.id, 
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

    res.json({ message: "Exercise saved successfully", _id: result.insertedId }); // _id 반환
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
  const { id, date, checked } = req.body;
  const user = req.session.user;
  try {
    const result = await db.getDb().collection('User_diary').updateOne(
      { _id: new ObjectId(id), author: user.id },
      { $set: { checked: checked } }
    );
    // 해당 운동의 날짜 가져오기
    const exercise = await db.getDb().collection('User_diary').findOne({ author: user.id });

    // 해당 날짜의 모든 운동의 checked 상태 확인
    const allExercises = await db.getDb().collection('User_diary').find({ author: user.id, date: date }).toArray();
    const allChecked = allExercises.every(ex => ex.checked);

    await db.getDb().collection("User_diary_exlogs").updateOne(
      { author: user.id, date: date },
      { $set: { allChecked: allChecked, count: allExercises.length } },
      { upsert: true }
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
      { $group: { _id: "$date", 
          count: { $sum: "$count" }, 
          allChecked: { $first: "$allChecked" } } }
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
    // 운동 삭제
    const deleteResult = await db.getDb().collection("User_diary").deleteOne({
      _id: new ObjectId(id),
      author: user.id
    });

    if (deleteResult.deletedCount === 0) {
      throw new Error('Exercise not found or not authorized to delete');
    }

    console.log(`Deleted exercise id: ${id} for user: ${user.id} on date: ${date}`);


    // 해당 날짜의 운동 기록 수 감소
    const updateResult = await db.getDb().collection("User_diary_exlogs").updateOne(
      { author: user.id, date: date },
      { $inc: { count: -1 } }
    );

    console.log(`Update result: ${JSON.stringify(updateResult)}`);

    // 기록이 0이 되면 해당 날짜의 로그 삭제
    if (updateResult.matchedCount > 0) {
      const log = await db.getDb().collection("User_diary_exlogs").findOne({ author: user.id, date: date });
      console.log(`Log found: ${JSON.stringify(log)}`);
      if (log && log.count <= 0) {
        const deleteLogResult = await db.getDb().collection("User_diary_exlogs").deleteOne({ author: user.id, date: date });
        console.log(`Deleted log result: ${JSON.stringify(deleteLogResult)}`);
      }
    }

    res.status(200).json({ message: 'Exercise data deleted successfully' });
  } catch (error) {
    console.error("Error deleting exercise:", error.message);
    res.status(500).send("Error deleting exercise");
  }
});


/////////////// 눈바디 ///////////////////


router.post('/save-nunbody', upload2.single('nunbodyPhoto'), async (req, res) => {
  const user = req.session.user;
  const { date } = req.body;

  console.log('User :', user);
  console.log('Date :', date);
  console.log('File :', req.file);

  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }

  if (!req.file) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다. 다시 시도해 주세요." });
  }
  

  try {
    const nunbodyPhotoUrl = `/nunbody_images/${req.file.filename}`;
    console.log('Nunbody Photo URL:', nunbodyPhotoUrl); // 로그 추가

    await db.getDb().collection("User_diary_nunbody").insertOne({
      author: user.id,
      date,
      imagePath: nunbodyPhotoUrl
    });

    res.status(200).json({ message: "눈바디 사진이 성공적으로 저장되었습니다." });
  } catch (error) {
    console.error("Error saving nunbody photo:", error);
    res.status(500).send("Internal Server Error");
  }
});


// 눈바디 가져오기 라우트
router.get("/nunbody", async (req, res) => {
  const { date } = req.query;
  const user = req.session.user;
  try {
    const nunbodyPhoto = await db.getDb().collection("User_diary_nunbody")
      .find({ author: user.id, date: date })
      .toArray();
    console.log("Fetched nunbody photos:", nunbodyPhoto); // 로그 추가
    res.json(nunbodyPhoto);
  } catch (error) {
    console.error("Error fetching nunbody photos:", error);
    res.status(500).send("Error fetching nunbody photos");
  }
});



//////////// 식단 /////////////////


// 아침, 점심, 저녁 식단 사진 저장 라우트
router.post('/save-meals', upload.fields([
  { name: 'morningMeal', maxCount: 1 },
  { name: 'lunchMeal', maxCount: 1 },
  { name: 'dinnerMeal', maxCount: 1 }
]), async (req, res) => {
  const user = req.session.user;
  const {date} = req.body;

  if (!user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  if (!req.files.morningMeal && !req.files.lunchMeal && !req.files.dinnerMeal) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다. 다시 시도해 주세요." });
  }

  try{
    const mealData = [];
    const userMeals  = await db.getDb().collection("User_diary_meals").find({user:user.id , date}).toArray();
    const processMeal = async (mealFile, mealType) => {
      const existingMeal = userMeals.find(meal => meal.mealType === mealType);
      const filename = mealFile[0].filename;
      const imagePath = `/meal_images/${filename}`;

      if (existingMeal) {
        await db.getDb().collection("User_diary_meals").updateOne(
          { _id: existingMeal._id },
          { $set: { imagePath: imagePath } }
        );
        if (existingMeal.imagePath && existingMeal.imagePath !== "") {
          fs.unlink(path.join(__dirname, "..", "public", existingMeal.imagePath), (err) => {
            if (err) {
              console.error(`Error deleting old ${mealType} photo:`, err);
            }
          });
        }
      } else {
        mealData.push({
          author: user.id,
          date: date,
          mealType: mealType,
          imagePath: imagePath
        });
      }
    };

    if (req.files.morningMeal) {
      await processMeal(req.files.morningMeal, '아침');
    }
    if (req.files.lunchMeal) {
      await processMeal(req.files.lunchMeal, '점심');
    }
    if (req.files.dinnerMeal) {
      await processMeal(req.files.dinnerMeal, '저녁');
    }

    if (mealData.length > 0) {
      await db.getDb().collection("User_diary_meals").insertMany(mealData);
    }

    res.status(200).json({ message: "식단이 성공적으로 저장되었습니다." });
  } catch (error) {
    console.error("Error saving meal:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// 식단 목록 가져오기 라우트
router.get("/meals", async (req, res) => {
  const { date } = req.query;
  const user = req.session.user;
  try {
      const meals = await db.getDb().collection("User_diary_meals")
      .find({ 
          author: user.id, 
          date: date
      })
      .toArray();
      res.json(meals);
  } catch (error) {
      console.error("Error fetching meals:", error);
      res.status(500).send("Error fetching meals");
  }

});


// 식단 삭제 라우트
router.delete('/delete-meal/:id', async (req, res) => {
  
});



//////////////  체중  ///////////////////
  
// 체중 저장하기 라우트 
router.post("/save-weight", async (req, res) => {
  const { weight, date } = req.body;
  const user = req.session.user;

  if (!weight) {
    return res.status(400).json({ message: "체중을 입력해주세요." });
  }

  try {
    const result = await db.getDb().collection("User_inbody").insertOne({ 
      author: user.id, 
      date: date, 
      weight: weight });

    res.json({ message: "Weight saved successfully", _id: result.insertedId }); // _id 반환
  } catch (error) {
    console.error("Error saving weight:", error);
    res.status(500).send("Error saving weight");
  }
  console.log(`Date: ${date}, Weight: ${weight}`);
});


// 체중 및 사진 저장 라우트
router.post('/save-inbody', upload.single('photo'), async (req, res) => {
  const { date } = req.body;
  const user = req.session.user;
  const inbodyData = {
    author: user.id,
    date: date,
    photo: req.file.filename
  };
  try {
    await db.getDb().collection('User_inbody').insertOne(inbodyData);
    res.redirect('/diary');
  } catch (error) {
    console.error('체중 데이터 저장 실패', error);
    res.status(500).send('체중 데이터 저장 실패');
  }
});


// 인바디 데이터 가져오기 라우트
router.get('/inbody', async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
  }

  try {
    const inbodyData = await db.getDb().collection('User_inbody')
      .find({ id_join: user.id })
      .sort({ date: 1 }) // 날짜 순으로 정렬
      .toArray();

    res.json({ success: true, data: inbodyData });
  } catch (error) {
    console.error('Error fetching inbody data:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});


// 체중 데이터만 가져오기 라우트
router.get('/weights', async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  try {
    const weights = await db.getDb().collection('User_inbody')
      .find({ author: user.id })
      .project({ date: 1, weight: 1 })
      .sort({ date: 1 }) // 날짜 순으로 정렬
      .toArray();

    res.json(weights);
  } catch (error) {
    console.error("Error fetching weight data:", error);
    res.status(500).send("Error fetching weight data");
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
