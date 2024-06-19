  const express = require("express");
  const bcrypt = require("bcryptjs");
  const fs = require("fs");
  const path = require("path");
  const formidable = require("formidable");
  const { ObjectId } = require("mongodb");
  const db = require("../data/database");

  const router = express.Router();

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
      const user = await db.getDb().collection("User_info").findOne({ id_join: userid });
  
      if (!user || !(await bcrypt.compare(userpw, user.pw_join))) {
        return res.render("login", {
          error: true,
          message: "아이디 또는 비밀번호를 잘못 입력했습니다.",
        });
      }
  
      req.session.user = {
        id: user.id_join,
        name_join: user.name_join,
        profilePhoto: user.profilePhoto // 프로필 사진 세션에 저장
      };
      res.redirect("/main-board");
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
    nickname_join,
  } = req.body;

  try {
    const existingUser = await db.getDb().collection("User_info").findOne({ id_join });
    if (existingUser) {
      return res.status(400).json({ error: "이미 존재하는 아이디입니다. 다른 아이디를 입력하세요." });
    }

    const hashedPassword = await bcrypt.hash(pw_join, 12);

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
      nickname_join,
      profilePhoto: "" // 프로필 사진 필드 추가
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error inserting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
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

  router.get("/change-pw", function (req, res) {
    res.render("change-pw", { userError: null, pwError: null, message: null });
  });

  router.post("/change-pw", async function (req, res) {
    const { userid, username, user_new_pw, check_new_pw } = req.body;

    try {
      const user = await db
        .getDb()
        .collection("User_info")
        .findOne({ id_join: userid, name_join: username });

      if (!user) {
        return res.render("change-pw", {
          userError: "해당 아이디와 이름이 일치하는 사용자가 없습니다.",
          pwError: null,
          message: null,
        });
      }

      if (user_new_pw !== check_new_pw) {
        return res.render("change-pw", {
          userError: null,
          pwError: "신규 비밀번호의 재입력이 올바르지 않습니다.",
          message: null,
        });
      }

      const hashedPassword = await bcrypt.hash(user_new_pw, 12);
      await db
        .getDb()
        .collection("User_info")
        .updateOne({ _id: user._id }, { $set: { pw_join: hashedPassword } });

      res.send(
        '<script>alert("비밀번호가 변경되었습니다."); window.location.href = "/login";</script>'
      );
    } catch (error) {
      console.error("Error updating password:", error);
      res.render("change-pw", {
        userError: null,
        pwError: null,
        message: "비밀번호를 변경하는 도중 오류가 발생했습니다.",
      });
    }
  });


  module.exports = router;
