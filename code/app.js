const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const db = require('./data/database'); 

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/index", function (req, res) {
  res.render("index");
});

app.get("/login", function (req, res) {
  res.render("login", { message: null });
});

app.post("/login", function (req, res) {
  const { userid, userpw } = req.body;
  db.getDb()
    .collection("User_info")
    .findOne({ id_join: userid, pw_join: userpw })
    .then((user) => {
      if (user) {
        res.render("index", { user });
      } else {
        res.render("login", {
          message: "아이디 또는 비밀번호를 잘못 입력했습니다.",
        });
      }
    })
    .catch((error) => console.error("Error finding user:", error));
});

app.get("/join", function (req, res) {
  res.render("join");
});

app.post("/join", async function (req, res) {
  const userData = req.body;
  const userId = userData.id_join;
  const userPw = userData.pw_join;
  const userName = userData.name_join;
  const userBirth = userData.birth_join;
  const userTel = userData.telnumber_join;
  const userGender = userData["join-gender"];

  const hashedPassword = await bcrypt.hash(userPw, 12);

  const user_info = {
    id_join: userId,
    pw_join: hashedPassword,
    name_join: userName,
    birth_join: userBirth,
    telnumber_join: userTel,
    join_gender: userGender,
  };

  await db.getDb().collection("User_info").insertOne(user_info);

  res.redirect("complete-join");
});

app.get("/complete-join", function (req, res) {
  res.render("complete-join");
});

app.get("/looking-for-id", function (req, res) {
  res.render("looking-for-id", { error: null });
});

app.post("/looking-for-id", function (req, res) {
  const { username, usertel } = req.body;

  db.getDb()
    .collection("User_info")
    .findOne({ name_join: username, telnumber_join: usertel })
    .then((user) => {
      if (user) {
        res.render("complete-LI", { userId: user.id_join });
      } else {
        res.render("looking-for-id", {
          error: "해당 아이디 또는 이름이 일치하지 않습니다",
        });
      }
    })
    .catch((error) => console.error("아이디 찾기 오류:", error));
});


app.get("/looking-for-pw", function (req, res) {
  res.render("looking-for-pw", { error: null });
});

app.post("/looking-for-pw", function (req, res) {
  const { userid, username } = req.body;

  db.getDb()
    .collection("User_info")
    .findOne({ id_join: userid, name_join: username })
    .then((user) => {
      if (user) {
        res.render("complete-LP", { userPw: user.pw_join });
      }
      else {
        res.render("looking-for-pw", {
          error: "해당 아이디 또는 이름이 일치하지 않습니다",
        });
      }
    })
    .catch((error) => console.error("비밀번호 찾기 오류:", error));
});

app.get("/complete-LI", function (req, res) {
  res.render("complete-LI");
});

app.get("/complete-LP", function (req, res) {
  res.render("complete-LP");
});

app.get("/diary", function (req, res) {
  res.render("diary");
});

app.get("/update-free-board", function (req, res) {
  res.render("update-free-board");
});

app.get("/update-end-board", function (req, res) {
  res.render("update-end-board");
});

app.get("/update-ghwm-board", function (req, res) {
  res.render("update-ghwm-board");
});

app.get("/update-info-board", function (req, res) {
  res.render("update-info-board");
});

app.get("/update-child-board", function (req, res) {
  res.render("update-child-board");
});

app.get("/free-board", function (req, res) {
  res.render("free-board");
});

app.get("/child-board", function (req, res) {
  res.render("child-board");
});

app.get("/end-board", function (req, res) {
  res.render("end-board");
});

app.get("/info-board", function (req, res) {
  res.render("info-board");
});

app.get("/ghwm-board", function (req, res) {
  res.render("ghwm-board");
});

app.get("/main-board", function (req, res) {
  res.render("main-board");
});

app.get("/list_leg", function (req, res) {
  res.render("list_leg");
});

app.get("/list_chest", function (req, res) {
  res.render("list_chest");
});

app.get("/list_shoulder", function (req, res) {
  res.render("list_shoulder");
});

app.get("/list_abs", function (req, res) {
  res.render("list_abs");
});

app.get("/list_back", function (req, res) {
  res.render("list_back");
});

app.get("/list_arm", function (req, res) {
  res.render("list_arm");
});

app.get("/list_cardio", function (req, res) {
  res.render("list_cardio");
});

app.get("/list_weight", function (req, res) {
  res.render("list_weight");
});

app.get("/list_etc", function (req, res) {
  res.render("list_etc");
});

app.get("/my-page", function (req, res) {
  res.render("my-page");
});

app.listen(3000, function () {
  console.log("Server is running on localhost:3000");
});
