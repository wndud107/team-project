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
    cb(null, "./public/image");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

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
    if (oldProfilePhoto && oldProfilePhoto !== "기본프로필.png") {
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

// 프로필 사진 삭제
router.post("/delete-profile-photo", async function (req, res) {
  const user = req.session.user;

  if (!user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  try {
    const userInfo = await db.getDb().collection("User_info").findOne({ id_join: user.id });
    const oldProfilePhoto = userInfo.profilePhoto;

    await db.getDb().collection("User_info").updateOne(
      { id_join: user.id },
      { $set: { profilePhoto: null } }
    );

    // 이전 사진 삭제
    if (oldProfilePhoto && oldProfilePhoto !== "기본프로필.png") {
      fs.unlink(path.join(__dirname, "..", "public", oldProfilePhoto), (err) => {
        if (err) {
          console.error("Error deleting old profile photo:", err);
        }
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting profile photo:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
    const inbodyData = await db.getDb().collection("User_inbody").find({ id_join: user.id }).sort({ date: -1 }).limit(1).toArray();
    const latestInbody = inbodyData.length ? inbodyData[0] : { SMM: 0, weight: 0, BFM: 0, BMI: 0, BFP: 0 };

    if (userData) {
      // 목표 날짜와 현재 날짜의 차이를 계산하여 D-Day 구하기
      const currentDate = new Date();
      const goalDate = new Date(userData.goal_date_join);
      const dDay = Math.ceil((goalDate - currentDate) / (1000 * 60 * 60 * 24));

      res.render("my-page", { user: userData, dDay: dDay, inbody: latestInbody });
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

// D-DAY 업데이트
router.post('/change-dday', async (req, res) => {
  const userId = req.session.user.id;
  const newDday = req.body.newDday;

  if (!userId || !newDday) {
    return res.status(400).json({ success: false, message: '잘못된 요청입니다.' });
  }

  try {
    const result = await db.getDb().collection('User_info').updateOne(
      { id_join: userId },
      { $set: { goal_date_join: newDday } }
    );

    if (result.modifiedCount === 1) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'D-DAY 업데이트에 실패했습니다.' });
    }
  } catch (error) {
    console.error("Error updating D-DAY:", error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 나머지 라우트
router.post('/change-id', async function(req, res) {
  const user = req.session.user;
  const { newId } = req.body;

  if (!user) {
    return res.json({ success: false, message: '로그인이 필요합니다.' });
  }

  try {
    const userData = await db.getDb().collection('User_info').findOne({ id_join: newId });

    if (userData) {
      return res.json({ success: false, message: '이미 사용 중인 아이디입니다.' });
    }

    const updateResult = await db.getDb().collection('User_info').updateOne(
      { id_join: user.id },
      { $set: { id_join: newId } }
    );

    if (updateResult.modifiedCount === 1) {
      req.session.user.id = newId;
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: '아이디 변경에 실패했습니다.' });
    }
  } catch (error) {
    console.error('Error changing ID:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/change-name', async function(req, res) {
  const user = req.session.user;
  const { newName } = req.body;

  if (!user) {
    return res.json({ success: false, message: '로그인이 필요합니다.' });
  }

  try {
    const updateResult = await db.getDb().collection('User_info').updateOne(
      { id_join: user.id },
      { $set: { name_join: newName } }
    );

    if (updateResult.modifiedCount === 1) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: '이름 변경에 실패했습니다.' });
    }
  } catch (error) {
    console.error('Error changing name:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/change-nickname', async function(req, res) {
  const user = req.session.user;
  const { newNickname } = req.body;

  if (!user) {
    return res.json({ success: false, message: '로그인이 필요합니다.' });
  }

  try {
    const updateResult = await db.getDb().collection('User_info').updateOne(
      { id_join: user.id },
      { $set: { nickname_join: newNickname } }
    );

    if (updateResult.modifiedCount === 1) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: '닉네임 변경에 실패했습니다.' });
    }
  } catch (error) {
    console.error('Error changing nickname:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/change-birth', async function(req, res) {
  const user = req.session.user;
  const { newBirth } = req.body;

  if (!user) {
    return res.json({ success: false, message: '로그인이 필요합니다.' });
  }

  try {
    const updateResult = await db.getDb().collection('User_info').updateOne(
      { id_join: user.id },
      { $set: { birth_join: newBirth } }
    );

    if (updateResult.modifiedCount === 1) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: '생일 변경에 실패했습니다.' });
    }
  } catch (error) {
    console.error('Error changing birth:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/change-tel', async function(req, res) {
  const user = req.session.user;
  const { newTel } = req.body;

  if (!user) {
    return res.json({ success: false, message: '로그인이 필요합니다.' });
  }

  try {
    const updateResult = await db.getDb().collection('User_info').updateOne(
      { id_join: user.id },
      { $set: { telnumber_join: newTel } }
    );

    if (updateResult.modifiedCount === 1) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: '전화번호 변경에 실패했습니다.' });
    }
  } catch (error) {
    console.error('Error changing telephone number:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/change-height', async function(req, res) {
  const user = req.session.user;
  const { newHeight } = req.body;

  if (!user) {
    return res.json({ success: false, message: '로그인이 필요합니다.' });
  }

  try {
    const updateResult = await db.getDb().collection('User_info').updateOne(
      { id_join: user.id },
      { $set: { height_join: newHeight } }
    );

    if (updateResult.modifiedCount === 1) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: '키 변경에 실패했습니다.' });
    }
  } catch (error) {
    console.error('Error changing height:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/change-weight', async function(req, res) {
  const user = req.session.user;
  const { newWeight } = req.body;

  if (!user) {
    return res.json({ success: false, message: '로그인이 필요합니다.' });
  }

  try {
    const updateResult = await db.getDb().collection('User_info').updateOne(
      { id_join: user.id },
      { $set: { weight_join: newWeight } }
    );

    if (updateResult.modifiedCount === 1) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: '몸무게 변경에 실패했습니다.' });
    }
  } catch (error) {
    console.error('Error changing weight:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

function formatDate(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// 인바디 데이터 저장 라우트
router.post('/save-inbody', async function (req, res) {
  const user = req.session.user;
  const { weight, SMM, BFM, BMI, BFP } = req.body;

  if (!user) {
    return res.json({ success: false, message: '로그인이 필요합니다.' });
  }

  const currentDate = new Date();
  const inbodyData = {
    id_join: user.id,
    date: formatDate(currentDate),
    weight: weight,
    SMM: SMM,
    BFM: BFM,
    BMI: BMI,
    BFP: BFP
  };

  try {
    await db.getDb().collection('User_inbody').insertOne(inbodyData);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving inbody data:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.get("/my-board", async function (req, res) {
  const user = req.session.user;

  if (!user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const freeBoardPosts = await db.getDb().collection("free_board").find({ author: user.id }).toArray();
    const endBoardPosts = await db.getDb().collection("end_board").find({ author: user.id }).toArray();
    const ghwmBoardPosts = await db.getDb().collection("ghwm_board").find({ author: user.id }).toArray();
    const infoBoardPosts = await db.getDb().collection("info_board").find({ author: user.id }).toArray();
    const childBoardPosts = await db.getDb().collection("child_board").find({ author: user.id }).toArray();

    let userPosts = [
      ...freeBoardPosts.map((post) => ({ ...post, board: "free", board_name: "자유게시판" })),
      ...endBoardPosts.map((post) => ({ ...post, board: "end", board_name: "오운완게시판" })),
      ...infoBoardPosts.map((post) => ({ ...post, board: "info", board_name: "정보게시판" })),
      ...ghwmBoardPosts.map((post) => ({ ...post, board: "ghwm", board_name: "G.H.W.M 게시판" })),
      ...childBoardPosts.map((post) => ({ ...post, board: "child", board_name: "헬린이게시판" })),
    ];

    // Sort posts by date in descending order
    userPosts = userPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 각 게시물의 댓글 수를 가져오는 부분 추가
    const userPostsWithComments = await Promise.all(userPosts.map(async (post) => {
      const commentCount = await db.getDb().collection('free_comment').countDocuments({ postId: new ObjectId(post._id) });
      return { ...post, commentCount };
    }));

    const totalPosts = userPostsWithComments.length;
    const totalPages = Math.ceil(totalPosts / limit);
    const paginatedPosts = userPostsWithComments.slice(skip, skip + limit);

    res.render("my-board", { 
      posts: paginatedPosts, 
      currentPage: page, 
      totalPages 
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/my-comment", async function (req, res) {
  const user = req.session.user;

  if (!user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const freeBoardComments = await db.getDb().collection("free_comment").find({ author: user.id }).toArray();
    const endBoardComments = await db.getDb().collection("end_comment").find({ author: user.id }).toArray();
    const ghwmBoardComments = await db.getDb().collection("ghwm_comment").find({ author: user.id }).toArray();
    const infoBoardComments = await db.getDb().collection("info_comment").find({ author: user.id }).toArray();
    const childBoardComments = await db.getDb().collection("child_comment").find({ author: user.id }).toArray();

    const userComments = [
      ...freeBoardComments.map(comment => ({ ...comment, boardType: 'free' })),
      ...endBoardComments.map(comment => ({ ...comment, boardType: 'end' })),
      ...ghwmBoardComments.map(comment => ({ ...comment, boardType: 'ghwm' })),
      ...infoBoardComments.map(comment => ({ ...comment, boardType: 'info' })),
      ...childBoardComments.map(comment => ({ ...comment, boardType: 'child' }))
    ];

    // Sort comments by date in descending order
    const userCommentsSorted = userComments.sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalComments = userCommentsSorted.length;
    const totalPages = Math.ceil(totalComments / limit);
    const paginatedComments = userCommentsSorted.slice(skip, skip + limit);

    res.render("my-comment", { 
      comments: paginatedComments, 
      currentPage: page, 
      totalPages 
    });
  } catch (error) {
    console.error("Error fetching user comments:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
