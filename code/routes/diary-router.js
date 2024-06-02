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

router.get("/diary", async function (req, res) {
    const user = req.session.user;
  
    if (!user) {
      res.send(
        '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
      );
      return; // return을 추가하여 이후 코드가 실행되지 않도록 합니다.
    }
  
    try {
      const userData = await db
        .getDb()
        .collection("User_info")
        .findOne({ id_join: user.id });
  
      if (userData) {
        // 목표 날짜와 현재 날짜의 차이를 계산하여 D-Day 구하기
        const currentDate = new Date();
        const goalDate = new Date(userData.goal_date_join);
        const dDay = Math.ceil((goalDate - currentDate) / (1000 * 60 * 60 * 24));
  
        res.render("diary", { user: userData, dDay: dDay });
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
      await db.getDb().collection("User_diary").insertOne({ 
        author : user.id, 
        date, 
        exercise, 
        reps, 
        sets, 
        checked: false });
      res.send("Exercise saved successfully");
    } catch (error) {
      console.error("Error saving exercise:", error);
      res.status(500).send("Error saving exercise");
    }
  });
  
  // 운동 목록 가져오기 라우트
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
  
  //운동 목록 삭제 
  router.post("/delete-exercise", async function (req, res) {
    const { date, exercise, reps, sets, checked } = req.body;
    const user = req.session.user;
    try {
      await db.getDb().collection("User_diary").deleteOne({
        author: user.id,
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
    const { weight }= req.body;
    if (!req.session.user) {
      return res.status(401).send("로그인이 필요합니다.");
    }
    
    const user = req.session.user;
    // const selectedDate = new date.getDate();
    try {
      await db.getDb().collection("User_inbody").insertOne({
        author : user.id,  
        date : selectedDate,
        weight: req.body.weight
      });
      res.redirect("/diary");
    } catch (error) {
      console.error("인바디 데이터 저장 오류:", error);
      res.status(500).send("인바디 데이터 저장 중 오류가 발생했습니다.");
    }
  });


  module.exports = router;
