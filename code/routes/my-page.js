const express = require("express");
const multer = require("multer");
const path = require("path");
const { ObjectId } = require("mongodb");
const db = require("../data/database");
const fs = require('fs');

const router = express.Router();

// Multer 저장소 설정
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/image"); // 경로를 './public/images'로 설정
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// 파일 형식 제한 (JPG만 허용)
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpg|jpeg/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only .jpg files are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// 프로필 사진 업로드 처리 라우트
router.post("/upload-profile-photo", upload.single('profilePhoto'), async function (req, res) {
  const user = req.session.user;

  if (!user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  if (!req.file) {
    return res.send(
      '<script>alert("파일이 업로드되지 않았습니다. 다시 시도해 주세요."); window.location.href = "/my-page";</script>'
    );
  }

  try {
    const userInfo = await db.getDb().collection("User_info").findOne({ id_join: user.id });
    const oldProfilePhoto = userInfo.profilePhoto;

    const profilePhotoUrl = `/image/${req.file.filename}`;
    await db.getDb().collection("User_info").updateOne(
      { id_join: user.id },
      { $set: { profilePhoto: profilePhotoUrl } }
    );

    // 이전 사진 삭제
    if (oldProfilePhoto && oldProfilePhoto !== "/image/default-placeholder.png") {
      fs.unlink(path.join(__dirname, "..", "public", oldProfilePhoto), (err) => {
        if (err) {
          console.error("Error deleting old profile photo:", err);
        }
      });
    }

    res.redirect("/my-page");
  } catch (error) {
    console.error("Error updating profile photo:", error);
    res.status(500).send("Internal Server Error");
  }
});


// 프로필 페이지 렌더링 라우트
router.get("/my-page", async function (req, res) {
  const user = req.session.user;

  if (!user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  try {
    const userData = await db.getDb().collection("User_info").findOne({ id_join: user.id });

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

// 나머지 라우트
router.post("/my-page", async function (req, res) {
  const user = req.session.user;

  if (!user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  try {
    const userData = await db.getDb().collection("User_info").findOne({ id_join: user.id });

    const freeBoardPosts = await db.getDb().collection("free_board").find({ author: user.id }).toArray();
    const endBoardPosts = await db.getDb().collection("end_board").find({ author: user.id }).toArray();
    const ghwmBoardPosts = await db.getDb().collection("ghwm_board").find({ author: user.id }).toArray();
    const infoBoardPosts = await db.getDb().collection("info_board").find({ author: user.id }).toArray();
    const childBoardPosts = await db.getDb().collection("child_board").find({ author: user.id }).toArray();

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
    const freeBoardPosts = await db.getDb().collection("free_board").find({ author: user.id }).toArray();
    const endBoardPosts = await db.getDb().collection("end_board").find({ author: user.id }).toArray();
    const ghwmBoardPosts = await db.getDb().collection("ghwm_board").find({ author: user.id }).toArray();
    const infoBoardPosts = await db.getDb().collection("info_board").find({ author: user.id }).toArray();
    const childBoardPosts = await db.getDb().collection("child_board").find({ author: user.id }).toArray();

    const userPosts = [
      ...freeBoardPosts.map((post) => ({ ...post, board: "free", board_name: "자유게시판" })),
      ...endBoardPosts.map((post) => ({ ...post, board: "end", board_name: "오운완게시판" })),
      ...infoBoardPosts.map((post) => ({ ...post, board: "info", board_name: "정보게시판" })),
      ...ghwmBoardPosts.map((post) => ({ ...post, board: "ghwm", board_name: "G.H.W.M 게시판" })),
      ...childBoardPosts.map((post) => ({ ...post, board: "child", board_name: "헬린이게시판" })),
    ];

    // 각 게시물의 댓글 수를 가져오는 부분 추가
    const userPostsWithComments = await Promise.all(userPosts.map(async (post) => {
      const commentCount = await db.getDb().collection('free_comment').countDocuments({ postId: new ObjectId(post._id) });
      return { ...post, commentCount };
    }));

    res.render("my-board", { posts: userPostsWithComments });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
