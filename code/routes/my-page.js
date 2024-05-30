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

module.exports = router;
