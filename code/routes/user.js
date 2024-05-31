const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const { ObjectId } = require("mongodb");
const db = require("../data/database");

const router = express.Router();

let multer = require('multer');

let storage = multer.diskStorage({
  destination : function(req, file, done){
    done(null, './public/image')
  },
  filename : function(req, file, done){
    done(null, file.originalname)
  }
})

let upload = multer({storage : storage});

router.get("/", function (req, res) {
  res.render("index");
});

router.get("/index", function (req, res) {
  res.render("index");
});

router.get("/login", function (req, res) {
  if (req.session.user) {
    res.send("로그인 되었습니다.");
  } else {
    res.render("login", { message: null });
  }
});

router.post("/login", async function (req, res) {
  const { userid, userpw } = req.body;
  try {
    const user = await db
      .getDb()
      .collection("User_info")
      .findOne({ id_join: userid });

    if (!user || !(await bcrypt.compare(userpw, user.pw_join))) {
      return res.render("login", {
        message: "아이디 또는 비밀번호를 잘못 입력했습니다.",
      });
    }

    req.session.user = { id: user.id_join, name: user.name_join };
    res.redirect("/index");
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/");
    }
    res.clearCookie("connect.sid");
    res.send(
      '<script>alert("로그아웃 되었습니다."); window.location.href = "/login";</script>'
    );
  });
});

router.get("/join", function (req, res) {
  res.render("join");
});

router.post("/join", async function (req, res) {
  const {
    id_join,
    pw_join,
    name_join,
    birth_join,
    telnumber_join,
    height_join,
    weight_join,
    goal_weight_join,
    goal_date_join,
    nickname_join
  } = req.body;

  const hashedPassword = await bcrypt.hash(pw_join, 12);

  try {
    await db.getDb().collection("User_info").insertOne({
      id_join,
      pw_join: hashedPassword,
      name_join,
      birth_join,
      telnumber_join,
      height_join,
      weight_join,
      goal_weight_join,
      goal_date_join,
      nickname_join
    });
    res.redirect("login");
  } catch (error) {
    console.error("Error inserting user:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.get("/complete-join", function (req, res) {
  res.render("complete-join");
});

router.get("/looking-for-id", function (req, res) {
  res.render("looking-for-id", { error: null });
});

router.post("/looking-for-id", async function (req, res) {
  const { username, usertel } = req.body;

  try {
    const user = await db
      .getDb()
      .collection("User_info")
      .findOne({ name_join: username, telnumber_join: usertel });
    if (user) {
      res.render("complete-LI", { userId: user.id_join });
    } else {
      res.render("looking-for-id", {
        error: "해당 아이디 또는 이름이 일치하지 않습니다",
      });
    }
  } catch (error) {
    console.error("아이디 찾기 오류:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/looking-for-pw", function (req, res) {
  res.render("looking-for-pw", { error: null });
});

router.post("/looking-for-pw", async function (req, res) {
  const { userid, username } = req.body;

  try {
    const user = await db
      .getDb()
      .collection("User_info")
      .findOne({ id_join: userid, name_join: username });
    if (user) {
      res.render("complete-LP", { userPw: user.pw_join });
    } else {
      res.render("looking-for-pw", {
        error: "해당 아이디 또는 이름이 일치하지 않습니다",
      });
    }
  } catch (error) {
    console.error("비밀번호 찾기 오류:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/complete-LI", function (req, res) {
  res.render("complete-LI");
});

router.get("/complete-LP", function (req, res) {
  res.render("complete-LP");
});

router.get("/diary", function (req, res) {
  if (!req.session.user) {
    res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  } else {
    res.render("diary");
  }
});

router.post("/save-exercise", async (req, res) => {
  const { date, exercise, reps, sets } = req.body;
  try {
    await db
      .getDb()
      .collection("User_diary")
      .insertOne({ date, exercise, reps, sets });
    res.send("Exercise saved successfully");
  } catch (error) {
    console.error("Error saving exercise:", error);
    res.status(500).send("Error saving exercise");
  }
});

router.get("/exercises", async (req, res) => {
  const { date } = req.query;
  try {
    const exercises = await db
      .getDb()
      .collection("User_diary")
      .find({ date })
      .toArray();
    res.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).send("Error fetching exercises");
  }
});

router.post("/delete-exercise", async function (req, res) {
  const { date, exercise, reps, sets } = req.body;
  try {
    await db.getDb().collection("User_diary").deleteOne({
      date,
      exercise,
      reps,
      sets
    });
    res.send("Exercise deleted successfully");
  } catch (error) {
    console.error("Error deleting exercise:", error);
    res.status(500).send("Error deleting exercise");
  }
});

router.post("/upload", (req, res) => {
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, "..", "public", "uploads");
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(500).send("Error uploading file");
    }

    const { date, mealType } = fields;
    const oldPath = files.photo.path;
    const newPath = path.join(form.uploadDir, files.photo.name);

    fs.rename(oldPath, newPath, async (err) => {
      if (err) {
        console.error("Error renaming file:", err);
        return res.status(500).send("Error renaming file");
      }

      try {
        await db
          .getDb()
          .collection("Meals")
          .insertOne({ date, mealType, filename: files.photo.name });
        res.send("File uploaded and data saved successfully");
      } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).send("Error saving data");
      }
    });
  });
});

router.get("/meals", async (req, res) => {
  const { date } = req.query;
  try {
    const meals = await db.getDb().collection("Meals").find({ date }).toArray();
    res.json(meals);
  } catch (error) {
    console.error("Error fetching meals:", error);
    res.status(500).send("Error fetching meals");
  }
});

// 인바디 데이터 저장 엔드포인트
router.post("/save-inbody", async function (req, res) {
  // const {  height, weight, muscle_mass,  fat, bmi, fat_percentage} = req.body;
  if (!req.session.user) {
    return res.status(401).send("로그인이 필요합니다.");
  }
  
  const user = req.session.user;
  // const selectedDate = new date.getDate();
  try {
    await db.getDb().collection("User_inbody").insertOne({
      author : user.id,  
      // date : selectedDate,
      height : req.body.height,
      weight: req.body.weight,
      skeletalMuscleMass: req.body.muscle_mass,
      bodyFatMass: req.body.fat,
      bmi: req.body.bmi,
      bodyFatPercentage: req.body.fat_percentage
    });
    res.redirect("/diary");
  } catch (error) {
    console.error("인바디 데이터 저장 오류:", error);
    res.status(500).send("인바디 데이터 저장 중 오류가 발생했습니다.");
  }
});

router.get("/main-board", async (req, res) => {
  try {
    const boards = ["free_board", "end_board", "info_board", "child_board", "ghwm_board"];
    const popularPostsPromises = boards.map(board =>
      db.getDb().collection(board).find().sort({ view: -1 }).limit(4).toArray()
    );
    const popularPostsData = await Promise.all(popularPostsPromises);
    const popularPosts = popularPostsData.flat().map(post => ({
      ...post,
      board: post.board // board 필드 포함
    })).sort((a, b) => b.view - a.view).slice(0, 4);

    const freeBoardPosts = await db.getDb().collection("free_board").find().sort({ date: -1 }).limit(4).toArray();
    const endBoardPosts = await db.getDb().collection("end_board").find().sort({ date: -1 }).limit(4).toArray();
    const infoBoardPosts = await db.getDb().collection("info_board").find().sort({ date: -1 }).limit(4).toArray();
    const childBoardPosts = await db.getDb().collection("child_board").find().sort({ date: -1 }).limit(4).toArray();
    const ghwmBoardPosts = await db.getDb().collection("ghwm_board").find().sort({ date: -1 }).limit(4).toArray();

    res.render("main-board", { freeBoardPosts, endBoardPosts, infoBoardPosts, childBoardPosts, ghwmBoardPosts, popularPosts });
  } catch (error) {
    console.error("Error fetching board posts:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/update-board", function (req, res) {
  res.render("update-free-board");
});

router.get("/update-free-board", function (req, res) {
  res.render("update-free-board");
});

router.get("/update-end-board", function (req, res) {
  res.render("update-end-board");
});

router.get("/update-ghwm-board", function (req, res) {
  res.render("update-ghwm-board");
});

router.get("/update-info-board", function (req, res) {
  res.render("update-info-board");
});

router.get("/update-child-board", function (req, res) {
  res.render("update-child-board");
});

router.get("/list_leg", function (req, res) {
  res.render("list_leg");
});

router.get("/list_chest", function (req, res) {
  res.render("list_chest");
});

router.get("/list_shoulder", function (req, res) {
  res.render("list_shoulder");
});

router.get("/list_abs", function (req, res) {
  res.render("list_abs");
});

router.get("/list_back", function (req, res) {
  res.render("list_back");
});

router.get("/list_arm", function (req, res) {
  res.render("list_arm");
});

router.get("/list_cardio", function (req, res) {
  res.render("list_cardio");
});

router.get("/list_weight", function (req, res) {
  res.render("list_weight");
});

router.get("/list_etc", function (req, res) {
  res.render("list_etc");
});


router.post("/save-free-board", async function (req, res) {
  const user = req.session.user;
  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }
  const currentDate = new Date();
  try {
    const result = await db.getDb().collection("free_board").insertOne({
      title: req.body.title,
      content: req.body.content,
      author: user.id,
      date: currentDate,
      path: req.session.imagepath || '',
      view: 0, // 조회수 초기화
      board: 'free' // 게시판 이름 추가
    });
    console.log("Post inserted:", result.insertedId);
    req.session.imagepath = null;
    res.redirect("/free-board");
  } catch (error) {
    console.error("Error inserting data into MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/save-info-board", async function (req, res) {
  const user = req.session.user;
  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }
  const currentDate = new Date();
  try {
    const result = await db.getDb().collection("info_board").insertOne({
      title: req.body.title,
      content: req.body.content,
      author: user.id,
      date: currentDate,
      path: req.session.imagepath || '',
      view: 0, // 조회수 초기화
      board: 'free' // 게시판 이름 추가
    });
    console.log("Post inserted:", result.insertedId);
    req.session.imagepath = null;
    res.redirect("/info-board");
  } catch (error) {
    console.error("Error inserting data into MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/save-end-board", async function (req, res) {
  const user = req.session.user;
  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }
  const currentDate = new Date();
  try {
    const result = await db.getDb().collection("end_board").insertOne({
      title: req.body.title,
      content: req.body.content,
      author: user.id,
      date: currentDate,
      path: req.session.imagepath || '',
      view: 0, // 조회수 초기화
      board: 'free' // 게시판 이름 추가
    });
    console.log("Post inserted:", result.insertedId);
    req.session.imagepath = null;
    res.redirect("/end-board");
  } catch (error) {
    console.error("Error inserting data into MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/save-child-board", async function (req, res) {
  const user = req.session.user;
  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }
  const currentDate = new Date();
  try {
    const result = await db.getDb().collection("child_board").insertOne({
      title: req.body.title,
      content: req.body.content,
      author: user.id,
      date: currentDate,
      path: req.session.imagepath || '',
      view: 0, // 조회수 초기화
      board: 'free' // 게시판 이름 추가
    });
    console.log("Post inserted:", result.insertedId);
    req.session.imagepath = null;
    res.redirect("/child-board");
  } catch (error) {
    console.error("Error inserting data into MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/save-ghwm-board", async function (req, res) {
  const user = req.session.user;
  if (!user) {
    return res.send('<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>');
  }
  const currentDate = new Date();
  try {
    const result = await db.getDb().collection("ghwm_board").insertOne({
      title: req.body.title,
      content: req.body.content,
      author: user.id,
      date: currentDate,
      path: req.session.imagepath || '',
      view: 0, // 조회수 초기화
      board: 'free' // 게시판 이름 추가
    });
    console.log("Post inserted:", result.insertedId);
    req.session.imagepath = null;
    res.redirect("/ghwm-board");
  } catch (error) {
    console.error("Error inserting data into MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

function formatDate(date) {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(date).toLocaleDateString("ko-KR", options);
}

router.get('/check-login-status', function(req, res) {
  if (req.session.user) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

router.get("/info-board", async (req, res) => {
  try {
    const data = await db
      .getDb()
      .collection("info_board")
      .find()
      .sort({ date: -1 })
      .toArray();
    const formattedData = data.map((item) => ({
      _id: item._id,
      title: item.title,
      author: item.author,
      date: formatDate(item.date),
    }));
    res.render("info-board", { data: formattedData });
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/free-board", async (req, res) => {
  try {
    const data = await db
      .getDb()
      .collection("free_board")
      .find()
      .sort({ date: -1 })
      .toArray();
    const formattedData = data.map((item) => ({
      _id: item._id,
      title: item.title,
      author: item.author,
      date: formatDate(item.date),
    }));
    res.render("free-board", { data: formattedData });
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/end-board", async (req, res) => {
  try {
    const data = await db
      .getDb()
      .collection("end_board")
      .find()
      .sort({ date: -1 })
      .toArray();
    const formattedData = data.map((item) => ({
      _id: item._id,
      title: item.title,
      author: item.author,
      date: formatDate(item.date),
    }));
    res.render("end-board", { data: formattedData });
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/child-board", async (req, res) => {
  try {
    const data = await db
      .getDb()
      .collection("child_board")
      .find()
      .sort({ date: -1 })
      .toArray();
    const formattedData = data.map((item) => ({
      _id: item._id,
      title: item.title,
      author: item.author,
      date: formatDate(item.date),
    }));
    res.render("child-board", { data: formattedData });
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/ghwm-board", async (req, res) => {
  try {
    const data = await db
      .getDb()
      .collection("ghwm_board")
      .find()
      .sort({ date: -1 })
      .toArray();
    const formattedData = data.map((item) => ({
      _id: item._id,
      title: item.title,
      author: item.author,
      date: formatDate(item.date),
    }));
    res.render("ghwm-board", { data: formattedData });
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

// 게시물보기

// 자유게시판
router.get("/free-content/:id", async function (req, res) {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    // Find the post by ID
    const post = await db.getDb().collection("free_board").findOne({ _id: new ObjectId(id) });

    if (post) {
      // Increment view count
      await db.getDb().collection("free_board").updateOne(
        { _id: new ObjectId(id) },
        { $inc: { view: 1 } }
      );
      res.render("free-content", { data: post, user: req.session.user });
    } else {
      console.log("No post found with id:", id);
      res.status(404).send("게시물을 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.delete("/delete-free-post/:id", async function (req, res) {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    // Find the post
    const post = await db.getDb().collection("free_board").findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // Check if the logged-in user is the author of the post
    if (req.session.user.id !== post.author) {
      return res.status(403).send("삭제 권한이 없습니다.");
    }

    // Delete the post
    await db.getDb().collection("free_board").deleteOne({ _id: new ObjectId(id) });

    res.status(200).send("삭제되었습니다.");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/edit-free-board/:id", async function (req, res) {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const post = await db.getDb().collection("free_board").findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // Check if the logged-in user is the author of the post
    if (req.session.user.id !== post.author) {
      return res.status(403).send("수정 권한이 없습니다.");
    }

    res.render("edit-free-board", { data: post });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/update-free-board/:id", async function (req, res) {
  const id = req.params.id;
  const { title, content } = req.body;
  let imagepath = req.session.imagepath || ''; // 세션에 저장된 imagepath 사용

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const post = await db.getDb().collection("free_board").findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // Check if the logged-in user is the author of the post
    if (req.session.user.id !== post.author) {
      return res.status(403).send("수정 권한이 없습니다.");
    }

    await db.getDb().collection("free_board").updateOne(
      { _id: new ObjectId(id) },
      { $set: { title: title, content: content, path: imagepath } }
    );

    // 게시물 수정 후 이미지 경로 초기화
    req.session.imagepath = null;

    res.redirect("/free-content/" + id);
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).send("Internal Server Error");
  }
});

// 오운완게시판
router.get("/end-content/:id", async function (req, res) {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    // Find the post by ID
    const post = await db.getDb().collection("end_board").findOne({ _id: new ObjectId(id) });

    if (post) {
      // Increment view count
      await db.getDb().collection("end_board").updateOne(
        { _id: new ObjectId(id) },
        { $inc: { view: 1 } }
      );
      res.render("end-content", { data: post, user: req.session.user });
    } else {
      console.log("No post found with id:", id);
      res.status(404).send("게시물을 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/delete-end-post/:id", async function (req, res) {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    // Find the post
    const post = await db.getDb().collection("end_board").findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // Check if the logged-in user is the author of the post
    if (req.session.user.id !== post.author) {
      return res.status(403).send("삭제 권한이 없습니다.");
    }

    // Delete the post
    await db.getDb().collection("end_board").deleteOne({ _id: new ObjectId(id) });

    res.status(200).send("삭제되었습니다.");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/edit-end-board/:id", async function (req, res) {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const post = await db.getDb().collection("end_board").findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // Check if the logged-in user is the author of the post
    if (req.session.user.id !== post.author) {
      return res.status(403).send("수정 권한이 없습니다.");
    }

    res.render("edit-end-board", { data: post });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/update-end-board/:id", async function (req, res) {
  const id = req.params.id;
  const { title, content } = req.body;
  let imagepath = req.session.imagepath || ''; // 세션에 저장된 imagepath 사용

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const post = await db.getDb().collection("end_board").findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // Check if the logged-in user is the author of the post
    if (req.session.user.id !== post.author) {
      return res.status(403).send("수정 권한이 없습니다.");
    }

    await db.getDb().collection("end_board").updateOne(
      { _id: new ObjectId(id) },
      { $set: { title: title, content: content, path: imagepath } }
    );

    // 게시물 수정 후 이미지 경로 초기화
    req.session.imagepath = null;

    res.redirect("/end-content/" + id);
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).send("Internal Server Error");
  }
});

// 헬린이게시판
router.get("/child-content/:id", async function (req, res) {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    // Find the post by ID
    const post = await db.getDb().collection("child_board").findOne({ _id: new ObjectId(id) });

    if (post) {
      // Increment view count
      await db.getDb().collection("child_board").updateOne(
        { _id: new ObjectId(id) },
        { $inc: { view: 1 } }
      );
      res.render("child-content", { data: post, user: req.session.user });
    } else {
      console.log("No post found with id:", id);
      res.status(404).send("게시물을 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/delete-child-post/:id", async function (req, res) {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    // Find the post
    const post = await db.getDb().collection("child_board").findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // Check if the logged-in user is the author of the post
    if (req.session.user.id !== post.author) {
      return res.status(403).send("삭제 권한이 없습니다.");
    }

    // Delete the post
    await db.getDb().collection("child_board").deleteOne({ _id: new ObjectId(id) });

    res.status(200).send("삭제되었습니다.");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/edit-child-board/:id", async function (req, res) {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const post = await db.getDb().collection("child_board").findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // Check if the logged-in user is the author of the post
    if (req.session.user.id !== post.author) {
      return res.status(403).send("수정 권한이 없습니다.");
    }

    res.render("edit-child-board", { data: post });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/update-child-board/:id", async function (req, res) {
  const id = req.params.id;
  const { title, content } = req.body;
  let imagepath = req.session.imagepath || ''; // 세션에 저장된 imagepath 사용

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const post = await db.getDb().collection("child_board").findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // Check if the logged-in user is the author of the post
    if (req.session.user.id !== post.author) {
      return res.status(403).send("수정 권한이 없습니다.");
    }

    await db.getDb().collection("child_board").updateOne(
      { _id: new ObjectId(id) },
      { $set: { title: title, content: content, path: imagepath } }
    );

    // 게시물 수정 후 이미지 경로 초기화
    req.session.imagepath = null;

    res.redirect("/child-content/" + id);
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).send("Internal Server Error");
  }
});

// 정보게시판
router.get("/info-content/:id", async function (req, res) {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    // Find the post by ID
    const post = await db.getDb().collection("info_board").findOne({ _id: new ObjectId(id) });

    if (post) {
      // Increment view count
      await db.getDb().collection("info_board").updateOne(
        { _id: new ObjectId(id) },
        { $inc: { view: 1 } }
      );
      res.render("info-content", { data: post, user: req.session.user });
    } else {
      console.log("No post found with id:", id);
      res.status(404).send("게시물을 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/delete-info-post/:id", async function (req, res) {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    // Find the post
    const post = await db.getDb().collection("info_board").findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // Check if the logged-in user is the author of the post
    if (req.session.user.id !== post.author) {
      return res.status(403).send("삭제 권한이 없습니다.");
    }

    // Delete the post
    await db.getDb().collection("info_board").deleteOne({ _id: new ObjectId(id) });

    res.status(200).send("삭제되었습니다.");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/edit-info-board/:id", async function (req, res) {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const post = await db.getDb().collection("info_board").findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // Check if the logged-in user is the author of the post
    if (req.session.user.id !== post.author) {
      return res.status(403).send("수정 권한이 없습니다.");
    }

    res.render("edit-info-board", { data: post });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/update-info-board/:id", async function (req, res) {
  const id = req.params.id;
  const { title, content } = req.body;
  let imagepath = req.session.imagepath || ''; // 세션에 저장된 imagepath 사용

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const post = await db.getDb().collection("info_board").findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // Check if the logged-in user is the author of the post
    if (req.session.user.id !== post.author) {
      return res.status(403).send("수정 권한이 없습니다.");
    }

    await db.getDb().collection("info_board").updateOne(
      { _id: new ObjectId(id) },
      { $set: { title: title, content: content, path: imagepath } }
    );

    // 게시물 수정 후 이미지 경로 초기화
    req.session.imagepath = null;

    res.redirect("/info-content/" + id);
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).send("Internal Server Error");
  }
});

// G.H.W.M. 게시판
router.get("/ghwm-content/:id", async function (req, res) {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    // Find the post by ID
    const post = await db.getDb().collection("ghwm_board").findOne({ _id: new ObjectId(id) });

    if (post) {
      // Increment view count
      await db.getDb().collection("ghwm_board").updateOne(
        { _id: new ObjectId(id) },
        { $inc: { view: 1 } }
      );
      res.render("ghwm-content", { data: post, user: req.session.user });
    } else {
      console.log("No post found with id:", id);
      res.status(404).send("게시물을 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/delete-ghwm-post/:id", async function (req, res) {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    // Find the post
    const post = await db.getDb().collection("ghwm_board").findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // Check if the logged-in user is the author of the post
    if (req.session.user.id !== post.author) {
      return res.status(403).send("삭제 권한이 없습니다.");
    }

    // Delete the post
    await db.getDb().collection("ghwm_board").deleteOne({ _id: new ObjectId(id) });

    res.status(200).send("삭제되었습니다.");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/edit-ghwm-board/:id", async function (req, res) {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const post = await db.getDb().collection("ghwm_board").findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // Check if the logged-in user is the author of the post
    if (req.session.user.id !== post.author) {
      return res.status(403).send("수정 권한이 없습니다.");
    }

    res.render("edit-ghwm-board", { data: post });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/update-ghwm-board/:id", async function (req, res) {
  const id = req.params.id;
  const { title, content } = req.body;
  let imagepath = req.session.imagepath || ''; // 세션에 저장된 imagepath 사용

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const post = await db.getDb().collection("ghwm_board").findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // Check if the logged-in user is the author of the post
    if (req.session.user.id !== post.author) {
      return res.status(403).send("수정 권한이 없습니다.");
    }

    await db.getDb().collection("ghwm_board").updateOne(
      { _id: new ObjectId(id) },
      { $set: { title: title, content: content, path: imagepath } }
    );

    // 게시물 수정 후 이미지 경로 초기화
    req.session.imagepath = null;

    res.redirect("/ghwm-content/" + id);
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/change-pw', function(req, res) {
  res.render('change-pw', { userError: null, pwError: null, message: null });
});

router.post('/change-pw', async function(req, res) {
  const { userid, username, user_new_pw, check_new_pw } = req.body;

  try {
    const user = await db.getDb().collection('User_info').findOne({ id_join: userid, name_join: username });

    if (!user) {
      return res.render('change-pw', { userError: '해당 아이디와 이름이 일치하는 사용자가 없습니다.', pwError: null, message: null });
    }

    if (user_new_pw !== check_new_pw) {
      return res.render('change-pw', { userError: null, pwError: '신규 비밀번호의 재입력이 올바르지 않습니다.', message: null });
    }

    const hashedPassword = await bcrypt.hash(user_new_pw, 12);
    await db.getDb().collection('User_info').updateOne(
      { _id: user._id },
      { $set: { pw_join: hashedPassword } }
    );

    res.send('<script>alert("비밀번호가 변경되었습니다."); window.location.href = "/login";</script>');
  } catch (error) {
    console.error('Error updating password:', error);
    res.render('change-pw', { userError: null, pwError: null, message: '비밀번호를 변경하는 도중 오류가 발생했습니다.' });
  }
});

router.post('/photo', upload.single('picture'), function(req, res) {
  if (req.file) {
    console.log(req.file.path);
    // 세션에 이미지 경로 저장
    req.session.imagepath = '/image/' + req.file.filename;
    res.status(200).send('File uploaded');
  } else {
    res.status(400).send('No file uploaded');
  }
});

module.exports = router;
