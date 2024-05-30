const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const { ObjectId } = require("mongodb");
const db = require("../data/database");

const router = express.Router();

let multer = require("multer");

let storage = multer.diskStorage({
  destination: function (req, file, done) {
    done(null, "./public/image");
  },
  filename: function (req, file, done) {
    done(null, file.originalname);
  },
});
router.get("/my-page", async function (req, res) {
  const user = req.session.user;

  if (!user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
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

      res.render("my-page", { user: userData, dDay: dDay });
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


router.post("/my-page", async function (req, res) {
  const user = req.session.user;

  if (!user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  try {
    const userData = await db
      .getDb()
      .collection("User_info")
      .findOne({ id_join: user.id });

    const freeBoardPosts = await db
      .getDb()
      .collection("free_board")
      .find({ author: user.id })
      .toArray();
    const endBoardPosts = await db
      .getDb()
      .collection("end_board")
      .find({ author: user.id })
      .toArray();
    const ghwmBoardPosts = await db
      .getDb()
      .collection("ghwm_board")
      .find({ author: user.id })
      .toArray();
    const infoBoardPosts = await db
      .getDb()
      .collection("info_board")
      .find({ author: user.id })
      .toArray();
    const childBoardPosts = await db
      .getDb()
      .collection("child_board")
      .find({ author: user.id })
      .toArray();

    const userPosts = [
      ...freeBoardPosts.map((post) => ({ ...post, board: "자유게시판" })),
      ...endBoardPosts.map((post) => ({ ...post, board: "오운완게시판" })),
      ...infoBoardPosts.map((post) => ({ ...post, board: "정보게시판" })),
      ...ghwmBoardPosts.map((post) => ({ ...post, board: "헬린이게시판" })),
      ...childBoardPosts.map((post) => ({ ...post, board: "G.H.W.M 게시판" })),
    ];

    if (userData) {
      res.render("my-page", { user: userData, posts: userPosts });
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

router.get("/my-board", async function (req, res) {
  const user = req.session.user;

  if (!user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  try {
    const freeBoardPosts = await db
      .getDb()
      .collection("free_board")
      .find({ author: user.id })
      .toArray();
    const endBoardPosts = await db
      .getDb()
      .collection("end_board")
      .find({ author: user.id })
      .toArray();
    const ghwmBoardPosts = await db
      .getDb()
      .collection("ghwm_board")
      .find({ author: user.id })
      .toArray();
    const infoBoardPosts = await db
      .getDb()
      .collection("info_board")
      .find({ author: user.id })
      .toArray();
    const childBoardPosts = await db
      .getDb()
      .collection("child_board")
      .find({ author: user.id })
      .toArray();

    const userPosts = [
      ...freeBoardPosts.map((post) => ({ ...post, board: "free" , board_name: "자유게시판"})),
      ...endBoardPosts.map((post) => ({ ...post, board: "end", board_name:"오운완게시판" })),
      ...infoBoardPosts.map((post) => ({ ...post, board: "info", board_name: "정보게시판" })),
      ...ghwmBoardPosts.map((post) => ({ ...post, board: "ghwm", board_name: "G.H.W.M 게시판" })),
      ...childBoardPosts.map((post) => ({ ...post, board: "child", board_name: "헬린이게시판" })),
    ];

    res.render("my-board", { posts: userPosts });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = router;
