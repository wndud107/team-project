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

let upload = multer({ storage: storage });

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

let upload = multer({ storage: storage });

router.get("/main-board", async (req, res) => {
  try {
    const boards = [
      "free_board",
      "end_board",
      "info_board",
      "child_board",
      "ghwm_board",
    ];
    const popularPostsPromises = boards.map((board) =>
      db.getDb().collection(board).find().sort({ view: -1 }).toArray()
    );
    const popularPostsData = await Promise.all(popularPostsPromises);
    const popularPosts = popularPostsData
      .flat()
      .map((post) => ({
        ...post,
        board: post.board, // board 필드 포함
      }))
      .sort((a, b) => b.view - a.view)
      .slice(0, 8);

    const freeBoardPosts = await db
      .getDb()
      .collection("free_board")
      .find()
      .sort({ date: -1 })
      .limit(8)
      .toArray();
    const endBoardPosts = await db
      .getDb()
      .collection("end_board")
      .find()
      .sort({ date: -1 })
      .limit(8)
      .toArray();
    const infoBoardPosts = await db
      .getDb()
      .collection("info_board")
      .find()
      .sort({ date: -1 })
      .limit(8)
      .toArray();
    const childBoardPosts = await db
      .getDb()
      .collection("child_board")
      .find()
      .sort({ date: -1 })
      .limit(8)
      .toArray();
    const ghwmBoardPosts = await db
      .getDb()
      .collection("ghwm_board")
      .find()
      .sort({ date: -1 })
      .limit(8)
      .toArray();

    res.render("main-board", {
      freeBoardPosts,
      endBoardPosts,
      infoBoardPosts,
      childBoardPosts,
      ghwmBoardPosts,
      popularPosts,
    });
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

  router.post("/save-free-board", async function (req, res) {
    const user = req.session.user;
    const userprofile = req.session.user.profilePhoto;
    if (!user) {
      return res.send(
        '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
      );
    }
    const currentDate = new Date();
    try {
      const result = await db
        .getDb()
        .collection("free_board")
        .insertOne({
          title: req.body.title,
          content: req.body.content,
          author: user.id,
          date: currentDate,
          path: req.session.imagepath || "",
          view: 0, // 조회수 초기화
          board: "free", // 게시판 이름 추가
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
      return res.send(
        '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
      );
    }
    const currentDate = new Date();
    try {
      const result = await db
        .getDb()
        .collection("info_board")
        .insertOne({
          title: req.body.title,
          content: req.body.content,
          author: user.id,
          date: currentDate,
          path: req.session.imagepath || "",
          view: 0, // 조회수 초기화
          board: "free", // 게시판 이름 추가
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
      return res.send(
        '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
      );
    }
    const currentDate = new Date();
    try {
      const result = await db
        .getDb()
        .collection("end_board")
        .insertOne({
          title: req.body.title,
          content: req.body.content,
          author: user.id,
          date: currentDate,
          path: req.session.imagepath || "",
          view: 0, // 조회수 초기화
          board: "free", // 게시판 이름 추가
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
      return res.send(
        '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
      );
    }
    const currentDate = new Date();
    try {
      const result = await db
        .getDb()
        .collection("child_board")
        .insertOne({
          title: req.body.title,
          content: req.body.content,
          author: user.id,
          date: currentDate,
          path: req.session.imagepath || "",
          view: 0, // 조회수 초기화
          board: "free", // 게시판 이름 추가
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
      return res.send(
        '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
      );
    }
    const currentDate = new Date();
    try {
      const result = await db
        .getDb()
        .collection("ghwm_board")
        .insertOne({
          title: req.body.title,
          content: req.body.content,
          author: user.id,
          date: currentDate,
          path: req.session.imagepath || "",
          view: 0, // 조회수 초기화
          board: "free", // 게시판 이름 추가
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

  router.get("/check-login-status", function (req, res) {
    if (req.session.user) {
      res.json({ loggedIn: true });
    } else {
      res.json({ loggedIn: false });
    }
  });

  router.get("/info-board", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 13;
    const skip = (page - 1) * limit;

    try {
        const data = await db
            .getDb()
            .collection("info_board")
            .find()
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const totalPosts = await db.getDb().collection("info_board").countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);

        const formattedData = data.map((item) => ({
            _id: item._id,
            title: item.title,
            author: item.author,
            date: formatDate(item.date),
        }));

        res.render("info-board", { data: formattedData, currentPage: page, totalPages: totalPages });
    } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        res.status(500).send("Internal Server Error");
    }
});

  router.get("/free-board", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 13;
    const skip = (page - 1) * limit;

    try {
        const data = await db
            .getDb()
            .collection("free_board")
            .find()
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const totalPosts = await db.getDb().collection("free_board").countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);

        const formattedData = data.map((item) => ({
            _id: item._id,
            title: item.title,
            author: item.author,
            date: formatDate(item.date),
        }));

        res.render("free-board", { data: formattedData, currentPage: page, totalPages: totalPages });
    } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/end-board", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 13;
    const skip = (page - 1) * limit;

    try {
        const data = await db
            .getDb()
            .collection("end_board")
            .find()
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const totalPosts = await db.getDb().collection("end_board").countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);

        const formattedData = data.map((item) => ({
            _id: item._id,
            title: item.title,
            author: item.author,
            date: formatDate(item.date),
        }));

        res.render("end-board", { data: formattedData, currentPage: page, totalPages: totalPages });
    } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/child-board", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 13;
    const skip = (page - 1) * limit;

    try {
        const data = await db
            .getDb()
            .collection("child_board")
            .find()
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const totalPosts = await db.getDb().collection("child_board").countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);

        const formattedData = data.map((item) => ({
            _id: item._id,
            title: item.title,
            author: item.author,
            date: formatDate(item.date),
        }));

        res.render("child-board", { data: formattedData, currentPage: page, totalPages: totalPages });
    } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/ghwm-board", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 13;
    const skip = (page - 1) * limit;

    try {
        const data = await db
            .getDb()
            .collection("ghwm_board")
            .find()
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const totalPosts = await db.getDb().collection("ghwm_board").countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);

        const formattedData = data.map((item) => ({
            _id: item._id,
            title: item.title,
            author: item.author,
            date: formatDate(item.date),
        }));

        res.render("ghwm-board", { data: formattedData, currentPage: page, totalPages: totalPages });
    } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        res.status(500).send("Internal Server Error");
    }
});

  // 자유게시판
  router.get("/free-content/:id", async function (req, res) {
    const id = req.params.id;

    try {
      // ID로 게시물을 찾습니다
      const post = await db
        .getDb()
        .collection("free_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        console.log("해당 ID로 게시물을 찾을 수 없습니다:", id);
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // 작성자를 ID로 찾습니다
      const author = await db
        .getDb()
        .collection("User_info")
        .findOne({ id_join: post.author });

      // 프로필 사진이 없는 경우 기본 사진 설정
      const authorProfilePhoto = author && author.profilePhoto ? author.profilePhoto : '/기본프로필.png';

      // 조회수를 증가시킵니다
      await db
        .getDb()
        .collection("free_board")
        .updateOne({ _id: new ObjectId(id) }, { $inc: { view: 1 } });

      // Fetch comments
      const comments = await db
        .getDb()
        .collection("free_comment")
        .find({ postId: new ObjectId(id) })
        .sort({ date: 1 })
        .toArray();

      // 댓글 작성자 프로필 사진 가져오기
      const commentsWithProfilePhotos = await Promise.all(
        comments.map(async (comment) => {
          const commentAuthor = await db
            .getDb()
            .collection("User_info")
            .findOne({ id_join: comment.author });
          
          const commentAuthorProfilePhoto = commentAuthor && commentAuthor.profilePhoto ? commentAuthor.profilePhoto : '기본프로필.png';
          
          return { ...comment, authorProfilePhoto: commentAuthorProfilePhoto };
        })
      );
        
      res.render("free-content", {
        data: post,
        user: req.session.user,
        authorProfilePhoto: authorProfilePhoto,
        comments
      });
    } catch (error) {
      console.error("내용을 가져오는 중 오류 발생:", error);
      res.status(500).send("서버 내부 오류");
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
      const post = await db
        .getDb()
        .collection("free_board")
        .findOne({ _id: new ObjectId(id) });

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
    let imagepath = req.session.imagepath || ""; // 세션에 저장된 imagepath 사용

    // Check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ID format");
    }

    try {
      const post = await db
        .getDb()
        .collection("free_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("수정 권한이 없습니다.");
      }

      await db
        .getDb()
        .collection("free_board")
        .updateOne(
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

  try {
    // ID로 게시물을 찾습니다
    const post = await db
      .getDb()
      .collection("end_board")
      .findOne({ _id: new ObjectId(id) });

    if (!post) {
      console.log("해당 ID로 게시물을 찾을 수 없습니다:", id);
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // 작성자를 ID로 찾습니다
    const author = await db
      .getDb()
      .collection("User_info")
      .findOne({ id_join: post.author });

    // 프로필 사진이 없는 경우 기본 사진 설정
    const authorProfilePhoto = author && author.profilePhoto ? author.profilePhoto : '기본프로필.png';

    // 조회수를 증가시킵니다
    await db
      .getDb()
      .collection("end_board")
      .updateOne({ _id: new ObjectId(id) }, { $inc: { view: 1 } });

    // Fetch comments
    const comments = await db
      .getDb()
      .collection("end_comment")
      .find({ postId: new ObjectId(id) })
      .sort({ date: 1 })
      .toArray();

    // 댓글 작성자 프로필 사진 가져오기
    const commentsWithProfilePhotos = await Promise.all(
      comments.map(async (comment) => {
        const commentAuthor = await db
          .getDb()
          .collection("User_info")
          .findOne({ id_join: comment.author });
        
        const commentAuthorProfilePhoto = commentAuthor && commentAuthor.profilePhoto ? commentAuthor.profilePhoto : '기본프로필.png';
        
        return { ...comment, authorProfilePhoto: commentAuthorProfilePhoto };
      })
    );

    res.render("end-content", {
      data: post,
      user: req.session.user,
      authorProfilePhoto: authorProfilePhoto,
      comments: commentsWithProfilePhotos
    });
    
  } catch (error) {
    console.error("내용을 가져오는 중 오류 발생:", error);
    res.status(500).send("서버 내부 오류");
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
      const post = await db
        .getDb()
        .collection("end_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("삭제 권한이 없습니다.");
      }

      // Delete the post
      await db
        .getDb()
        .collection("end_board")
        .deleteOne({ _id: new ObjectId(id) });

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
      const post = await db
        .getDb()
        .collection("end_board")
        .findOne({ _id: new ObjectId(id) });

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
    let imagepath = req.session.imagepath || ""; // 세션에 저장된 imagepath 사용

    // Check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ID format");
    }

    try {
      const post = await db
        .getDb()
        .collection("end_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("수정 권한이 없습니다.");
      }

      await db
        .getDb()
        .collection("end_board")
        .updateOne(
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

    try {
      // ID로 게시물을 찾습니다
      const post = await db
        .getDb()
        .collection("child_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        console.log("해당 ID로 게시물을 찾을 수 없습니다:", id);
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // 작성자를 ID로 찾습니다
      const author = await db
        .getDb()
        .collection("User_info")
        .findOne({ id_join: post.author });

      // 프로필 사진이 없는 경우 기본 사진 설정
      const authorProfilePhoto = author && author.profilePhoto ? author.profilePhoto : '/기본프로필.png';

      // 조회수를 증가시킵니다
      await db
        .getDb()
        .collection("child_board")
        .updateOne({ _id: new ObjectId(id) }, { $inc: { view: 1 } });

      // Fetch comments
      const comments = await db
        .getDb()
        .collection("child_comment")
        .find({ postId: new ObjectId(id) })
        .sort({ date: 1 })
        .toArray();

      // 댓글 작성자 프로필 사진 가져오기
      const commentsWithProfilePhotos = await Promise.all(
        comments.map(async (comment) => {
          const commentAuthor = await db
            .getDb()
            .collection("User_info")
            .findOne({ id_join: comment.author });
          
          const commentAuthorProfilePhoto = commentAuthor && commentAuthor.profilePhoto ? commentAuthor.profilePhoto : '기본프로필.png';
          
          return { ...comment, authorProfilePhoto: commentAuthorProfilePhoto };
        })
      );

      res.render("child-content", {
        data: post,
        user: req.session.user,
        authorProfilePhoto: authorProfilePhoto,
        comments
      });
    } catch (error) {
      console.error("내용을 가져오는 중 오류 발생:", error);
      res.status(500).send("서버 내부 오류");
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
      const post = await db
        .getDb()
        .collection("child_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("삭제 권한이 없습니다.");
      }

      // Delete the post
      await db
        .getDb()
        .collection("child_board")
        .deleteOne({ _id: new ObjectId(id) });

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
      const post = await db
        .getDb()
        .collection("child_board")
        .findOne({ _id: new ObjectId(id) });

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
    let imagepath = req.session.imagepath || ""; // 세션에 저장된 imagepath 사용

    // Check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ID format");
    }

    try {
      const post = await db
        .getDb()
        .collection("child_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("수정 권한이 없습니다.");
      }

      await db
        .getDb()
        .collection("child_board")
        .updateOne(
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

    try {
      // ID로 게시물을 찾습니다
      const post = await db
        .getDb()
        .collection("info_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        console.log("해당 ID로 게시물을 찾을 수 없습니다:", id);
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // 작성자를 ID로 찾습니다
      const author = await db
        .getDb()
        .collection("User_info")
        .findOne({ id_join: post.author });

      // 프로필 사진이 없는 경우 기본 사진 설정
      const authorProfilePhoto = author && author.profilePhoto ? author.profilePhoto : '기본프로필.png';

      // 조회수를 증가시킵니다
      await db
        .getDb()
        .collection("info_board")
        .updateOne({ _id: new ObjectId(id) }, { $inc: { view: 1 } });

      // Fetch comments
      const comments = await db
        .getDb()
        .collection("info_comment")
        .find({ postId: new ObjectId(id) })
        .sort({ date: 1 })
        .toArray();

      // 댓글 작성자 프로필 사진 가져오기
      const commentsWithProfilePhotos = await Promise.all(
        comments.map(async (comment) => {
          const commentAuthor = await db
            .getDb()
            .collection("User_info")
            .findOne({ id_join: comment.author });
          
          const commentAuthorProfilePhoto = commentAuthor && commentAuthor.profilePhoto ? commentAuthor.profilePhoto : '기본프로필.png';
          
          return { ...comment, authorProfilePhoto: commentAuthorProfilePhoto };
        })
      );

      res.render("info-content", {
        data: post,
        user: req.session.user,
        authorProfilePhoto: authorProfilePhoto,
        comments
      });
    } catch (error) {
      console.error("내용을 가져오는 중 오류 발생:", error);
      res.status(500).send("서버 내부 오류");
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
      const post = await db
        .getDb()
        .collection("info_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("삭제 권한이 없습니다.");
      }

      // Delete the post
      await db
        .getDb()
        .collection("info_board")
        .deleteOne({ _id: new ObjectId(id) });

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
      const post = await db
        .getDb()
        .collection("info_board")
        .findOne({ _id: new ObjectId(id) });

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
    let imagepath = req.session.imagepath || ""; // 세션에 저장된 imagepath 사용

    // Check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ID format");
    }

    try {
      const post = await db
        .getDb()
        .collection("info_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("수정 권한이 없습니다.");
      }

      await db
        .getDb()
        .collection("info_board")
        .updateOne(
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
    try {
      // ID로 게시물을 찾습니다
      const post = await db
        .getDb()
        .collection("ghwm_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        console.log("해당 ID로 게시물을 찾을 수 없습니다:", id);
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // 작성자를 ID로 찾습니다
      const author = await db
        .getDb()
        .collection("User_info")
        .findOne({ id_join: post.author });

      // 프로필 사진이 없는 경우 기본 사진 설정
      const authorProfilePhoto = author && author.profilePhoto ? author.profilePhoto : '기본프로필.png';

      // 조회수를 증가시킵니다
      await db
        .getDb()
        .collection("ghwm_board")
        .updateOne({ _id: new ObjectId(id) }, { $inc: { view: 1 } });

      // Fetch comments
      const comments = await db
        .getDb()
        .collection("ghwm_comment")
        .find({ postId: new ObjectId(id) })
        .sort({ date: 1 })
        .toArray();

      // 댓글 작성자 프로필 사진 가져오기
      const commentsWithProfilePhotos = await Promise.all(
        comments.map(async (comment) => {
          const commentAuthor = await db
            .getDb()
            .collection("User_info")
            .findOne({ id_join: comment.author });
          
          const commentAuthorProfilePhoto = commentAuthor && commentAuthor.profilePhoto ? commentAuthor.profilePhoto : '기본프로필.png';
          
          return { ...comment, authorProfilePhoto: commentAuthorProfilePhoto };
        })
      );
      
      res.render("ghwm-content", {
        data: post,
        user: req.session.user,
        authorProfilePhoto: authorProfilePhoto,
        comments
      });
    } catch (error) {
      console.error("내용을 가져오는 중 오류 발생:", error);
      res.status(500).send("서버 내부 오류");
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
      const post = await db
        .getDb()
        .collection("ghwm_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("삭제 권한이 없습니다.");
      }

      // Delete the post
      await db
        .getDb()
        .collection("ghwm_board")
        .deleteOne({ _id: new ObjectId(id) });

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
      const post = await db
        .getDb()
        .collection("ghwm_board")
        .findOne({ _id: new ObjectId(id) });

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
    let imagepath = req.session.imagepath || ""; // 세션에 저장된 imagepath 사용

    // Check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ID format");
    }

    try {
      const post = await db
        .getDb()
        .collection("ghwm_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("수정 권한이 없습니다.");
      }

      await db
        .getDb()
        .collection("ghwm_board")
        .updateOne(
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

  router.post("/photo", upload.single("picture"), function (req, res) {
    if (req.file) {
      console.log(req.file.path);
      // 세션에 이미지 경로 저장
      req.session.imagepath = "/image/" + req.file.filename;
      res.status(200).send("File uploaded");
    } else {
      res.status(400).send("No file uploaded");
    }
  });

  module.exports = router;


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

  router.post("/save-free-board", async function (req, res) {
    const user = req.session.user;
    const userprofile = req.session.user.profilePhoto;
    if (!user) {
      return res.send(
        '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
      );
    }
    const currentDate = new Date();
    try {
      const result = await db
        .getDb()
        .collection("free_board")
        .insertOne({
          title: req.body.title,
          content: req.body.content,
          author: user.id,
          date: currentDate,
          path: req.session.imagepath || "",
          view: 0, // 조회수 초기화
          board: "free", // 게시판 이름 추가
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
      return res.send(
        '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
      );
    }
    const currentDate = new Date();
    try {
      const result = await db
        .getDb()
        .collection("info_board")
        .insertOne({
          title: req.body.title,
          content: req.body.content,
          author: user.id,
          date: currentDate,
          path: req.session.imagepath || "",
          view: 0, // 조회수 초기화
          board: "free", // 게시판 이름 추가
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
      return res.send(
        '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
      );
    }
    const currentDate = new Date();
    try {
      const result = await db
        .getDb()
        .collection("end_board")
        .insertOne({
          title: req.body.title,
          content: req.body.content,
          author: user.id,
          date: currentDate,
          path: req.session.imagepath || "",
          view: 0, // 조회수 초기화
          board: "free", // 게시판 이름 추가
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
      return res.send(
        '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
      );
    }
    const currentDate = new Date();
    try {
      const result = await db
        .getDb()
        .collection("child_board")
        .insertOne({
          title: req.body.title,
          content: req.body.content,
          author: user.id,
          date: currentDate,
          path: req.session.imagepath || "",
          view: 0, // 조회수 초기화
          board: "free", // 게시판 이름 추가
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
      return res.send(
        '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
      );
    }
    const currentDate = new Date();
    try {
      const result = await db
        .getDb()
        .collection("ghwm_board")
        .insertOne({
          title: req.body.title,
          content: req.body.content,
          author: user.id,
          date: currentDate,
          path: req.session.imagepath || "",
          view: 0, // 조회수 초기화
          board: "free", // 게시판 이름 추가
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

  router.get("/check-login-status", function (req, res) {
    if (req.session.user) {
      res.json({ loggedIn: true });
    } else {
      res.json({ loggedIn: false });
    }
  });

  router.get("/info-board", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 13;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const searchType = req.query.searchType || 'title';

    try {
        const query = search
            ? searchType === 'author'
                ? { author: { $regex: search, $options: 'i' } }
                : { title: { $regex: search, $options: 'i' } }
            : {};

        const data = await db
            .getDb()
            .collection("info_board")
            .find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const totalPosts = await db.getDb().collection("info_board").countDocuments(query);
        const totalPages = Math.ceil(totalPosts / limit);

        const formattedData = data.map((item) => ({
            _id: item._id,
            title: item.title,
            author: item.author,
            date: formatDate(item.date),
        }));

        res.render("info-board", { data: formattedData, currentPage: page, totalPages: totalPages, search: search, searchType: searchType });
    } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/free-board", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 13;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const searchType = req.query.searchType || 'title';

  try {
      const query = search
          ? searchType === 'author'
              ? { author: { $regex: search, $options: 'i' } }
              : { title: { $regex: search, $options: 'i' } }
          : {};

      const data = await db
          .getDb()
          .collection("free_board")
          .find(query)
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();

      const totalPosts = await db.getDb().collection("free_board").countDocuments(query);
      const totalPages = Math.ceil(totalPosts / limit);

      const formattedData = data.map((item) => ({
          _id: item._id,
          title: item.title,
          author: item.author,
          date: formatDate(item.date),
      }));

      res.render("free-board", { data: formattedData, currentPage: page, totalPages: totalPages, search: search, searchType: searchType });
  } catch (error) {
      console.error("Error fetching data from MongoDB:", error);
      res.status(500).send("Internal Server Error");
  }
});

router.get("/end-board", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 13;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const searchType = req.query.searchType || 'title';

  try {
      const query = search
          ? searchType === 'author'
              ? { author: { $regex: search, $options: 'i' } }
              : { title: { $regex: search, $options: 'i' } }
          : {};

      const data = await db
          .getDb()
          .collection("end_board")
          .find(query)
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();

      const totalPosts = await db.getDb().collection("end_board").countDocuments(query);
      const totalPages = Math.ceil(totalPosts / limit);

      const formattedData = data.map((item) => ({
          _id: item._id,
          title: item.title,
          author: item.author,
          date: formatDate(item.date),
      }));

      res.render("end-board", { data: formattedData, currentPage: page, totalPages: totalPages, search: search, searchType: searchType });
  } catch (error) {
      console.error("Error fetching data from MongoDB:", error);
      res.status(500).send("Internal Server Error");
  }
});

router.get("/child-board", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 13;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const searchType = req.query.searchType || 'title';

  try {
      const query = search
          ? searchType === 'author'
              ? { author: { $regex: search, $options: 'i' } }
              : { title: { $regex: search, $options: 'i' } }
          : {};

      const data = await db
          .getDb()
          .collection("child_board")
          .find(query)
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();

      const totalPosts = await db.getDb().collection("child_board").countDocuments(query);
      const totalPages = Math.ceil(totalPosts / limit);

      const formattedData = data.map((item) => ({
          _id: item._id,
          title: item.title,
          author: item.author,
          date: formatDate(item.date),
      }));

      res.render("child-board", { data: formattedData, currentPage: page, totalPages: totalPages, search: search, searchType: searchType });
  } catch (error) {
      console.error("Error fetching data from MongoDB:", error);
      res.status(500).send("Internal Server Error");
  }
});

router.get("/ghwm-board", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 13;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const searchType = req.query.searchType || 'title';

  try {
      const query = search
          ? searchType === 'author'
              ? { author: { $regex: search, $options: 'i' } }
              : { title: { $regex: search, $options: 'i' } }
          : {};

      const data = await db
          .getDb()
          .collection("ghwm_board")
          .find(query)
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();

      const totalPosts = await db.getDb().collection("ghwm_board").countDocuments(query);
      const totalPages = Math.ceil(totalPosts / limit);

      const formattedData = data.map((item) => ({
          _id: item._id,
          title: item.title,
          author: item.author,
          date: formatDate(item.date),
      }));

      res.render("ghwm-board", { data: formattedData, currentPage: page, totalPages: totalPages, search: search, searchType: searchType });
  } catch (error) {
      console.error("Error fetching data from MongoDB:", error);
      res.status(500).send("Internal Server Error");
  }
});

  // 자유게시판
  router.get("/free-content/:id", async function (req, res) {
    const id = req.params.id;

    try {
      // ID로 게시물을 찾습니다
      const post = await db
        .getDb()
        .collection("free_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        console.log("해당 ID로 게시물을 찾을 수 없습니다:", id);
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // 작성자를 ID로 찾습니다
      const author = await db
        .getDb()
        .collection("User_info")
        .findOne({ id_join: post.author });

      // 프로필 사진이 없는 경우 기본 사진 설정
      const authorProfilePhoto = author && author.profilePhoto ? author.profilePhoto : '/기본프로필.png';

      // 조회수를 증가시킵니다
      await db
        .getDb()
        .collection("free_board")
        .updateOne({ _id: new ObjectId(id) }, { $inc: { view: 1 } });

      // Fetch comments
      const comments = await db
        .getDb()
        .collection("free_comment")
        .find({ postId: new ObjectId(id) })
        .sort({ date: 1 })
        .toArray();

      // 댓글 작성자 프로필 사진 가져오기
      const commentsWithProfilePhotos = await Promise.all(
        comments.map(async (comment) => {
          const commentAuthor = await db
            .getDb()
            .collection("User_info")
            .findOne({ id_join: comment.author });
          
          const commentAuthorProfilePhoto = commentAuthor && commentAuthor.profilePhoto ? commentAuthor.profilePhoto : '기본프로필.png';
          
          return { ...comment, authorProfilePhoto: commentAuthorProfilePhoto };
        })
      );
        
      res.render("free-content", {
        data: post,
        user: req.session.user,
        authorProfilePhoto: authorProfilePhoto,
        comments
      });
    } catch (error) {
      console.error("내용을 가져오는 중 오류 발생:", error);
      res.status(500).send("서버 내부 오류");
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
      const post = await db
        .getDb()
        .collection("free_board")
        .findOne({ _id: new ObjectId(id) });

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
    let imagepath = req.session.imagepath || ""; // 세션에 저장된 imagepath 사용

    // Check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ID format");
    }

    try {
      const post = await db
        .getDb()
        .collection("free_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("수정 권한이 없습니다.");
      }

      await db
        .getDb()
        .collection("free_board")
        .updateOne(
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

  try {
    // ID로 게시물을 찾습니다
    const post = await db
      .getDb()
      .collection("end_board")
      .findOne({ _id: new ObjectId(id) });

    if (!post) {
      console.log("해당 ID로 게시물을 찾을 수 없습니다:", id);
      return res.status(404).send("게시물을 찾을 수 없습니다.");
    }

    // 작성자를 ID로 찾습니다
    const author = await db
      .getDb()
      .collection("User_info")
      .findOne({ id_join: post.author });

    // 프로필 사진이 없는 경우 기본 사진 설정
    const authorProfilePhoto = author && author.profilePhoto ? author.profilePhoto : '기본프로필.png';

    // 조회수를 증가시킵니다
    await db
      .getDb()
      .collection("end_board")
      .updateOne({ _id: new ObjectId(id) }, { $inc: { view: 1 } });

    // Fetch comments
    const comments = await db
      .getDb()
      .collection("end_comment")
      .find({ postId: new ObjectId(id) })
      .sort({ date: 1 })
      .toArray();

    // 댓글 작성자 프로필 사진 가져오기
    const commentsWithProfilePhotos = await Promise.all(
      comments.map(async (comment) => {
        const commentAuthor = await db
          .getDb()
          .collection("User_info")
          .findOne({ id_join: comment.author });
        
        const commentAuthorProfilePhoto = commentAuthor && commentAuthor.profilePhoto ? commentAuthor.profilePhoto : '기본프로필.png';
        
        return { ...comment, authorProfilePhoto: commentAuthorProfilePhoto };
      })
    );

    res.render("end-content", {
      data: post,
      user: req.session.user,
      authorProfilePhoto: authorProfilePhoto,
      comments: commentsWithProfilePhotos
    });
    
  } catch (error) {
    console.error("내용을 가져오는 중 오류 발생:", error);
    res.status(500).send("서버 내부 오류");
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
      const post = await db
        .getDb()
        .collection("end_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("삭제 권한이 없습니다.");
      }

      // Delete the post
      await db
        .getDb()
        .collection("end_board")
        .deleteOne({ _id: new ObjectId(id) });

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
      const post = await db
        .getDb()
        .collection("end_board")
        .findOne({ _id: new ObjectId(id) });

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
    let imagepath = req.session.imagepath || ""; // 세션에 저장된 imagepath 사용

    // Check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ID format");
    }

    try {
      const post = await db
        .getDb()
        .collection("end_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("수정 권한이 없습니다.");
      }

      await db
        .getDb()
        .collection("end_board")
        .updateOne(
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

    try {
      // ID로 게시물을 찾습니다
      const post = await db
        .getDb()
        .collection("child_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        console.log("해당 ID로 게시물을 찾을 수 없습니다:", id);
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // 작성자를 ID로 찾습니다
      const author = await db
        .getDb()
        .collection("User_info")
        .findOne({ id_join: post.author });

      // 프로필 사진이 없는 경우 기본 사진 설정
      const authorProfilePhoto = author && author.profilePhoto ? author.profilePhoto : '/기본프로필.png';

      // 조회수를 증가시킵니다
      await db
        .getDb()
        .collection("child_board")
        .updateOne({ _id: new ObjectId(id) }, { $inc: { view: 1 } });

      // Fetch comments
      const comments = await db
        .getDb()
        .collection("child_comment")
        .find({ postId: new ObjectId(id) })
        .sort({ date: 1 })
        .toArray();

      // 댓글 작성자 프로필 사진 가져오기
      const commentsWithProfilePhotos = await Promise.all(
        comments.map(async (comment) => {
          const commentAuthor = await db
            .getDb()
            .collection("User_info")
            .findOne({ id_join: comment.author });
          
          const commentAuthorProfilePhoto = commentAuthor && commentAuthor.profilePhoto ? commentAuthor.profilePhoto : '기본프로필.png';
          
          return { ...comment, authorProfilePhoto: commentAuthorProfilePhoto };
        })
      );

      res.render("child-content", {
        data: post,
        user: req.session.user,
        authorProfilePhoto: authorProfilePhoto,
        comments
      });
    } catch (error) {
      console.error("내용을 가져오는 중 오류 발생:", error);
      res.status(500).send("서버 내부 오류");
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
      const post = await db
        .getDb()
        .collection("child_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("삭제 권한이 없습니다.");
      }

      // Delete the post
      await db
        .getDb()
        .collection("child_board")
        .deleteOne({ _id: new ObjectId(id) });

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
      const post = await db
        .getDb()
        .collection("child_board")
        .findOne({ _id: new ObjectId(id) });

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
    let imagepath = req.session.imagepath || ""; // 세션에 저장된 imagepath 사용

    // Check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ID format");
    }

    try {
      const post = await db
        .getDb()
        .collection("child_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("수정 권한이 없습니다.");
      }

      await db
        .getDb()
        .collection("child_board")
        .updateOne(
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

    try {
      // ID로 게시물을 찾습니다
      const post = await db
        .getDb()
        .collection("info_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        console.log("해당 ID로 게시물을 찾을 수 없습니다:", id);
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // 작성자를 ID로 찾습니다
      const author = await db
        .getDb()
        .collection("User_info")
        .findOne({ id_join: post.author });

      // 프로필 사진이 없는 경우 기본 사진 설정
      const authorProfilePhoto = author && author.profilePhoto ? author.profilePhoto : '기본프로필.png';

      // 조회수를 증가시킵니다
      await db
        .getDb()
        .collection("info_board")
        .updateOne({ _id: new ObjectId(id) }, { $inc: { view: 1 } });

      // Fetch comments
      const comments = await db
        .getDb()
        .collection("info_comment")
        .find({ postId: new ObjectId(id) })
        .sort({ date: 1 })
        .toArray();

      // 댓글 작성자 프로필 사진 가져오기
      const commentsWithProfilePhotos = await Promise.all(
        comments.map(async (comment) => {
          const commentAuthor = await db
            .getDb()
            .collection("User_info")
            .findOne({ id_join: comment.author });
          
          const commentAuthorProfilePhoto = commentAuthor && commentAuthor.profilePhoto ? commentAuthor.profilePhoto : '기본프로필.png';
          
          return { ...comment, authorProfilePhoto: commentAuthorProfilePhoto };
        })
      );

      res.render("info-content", {
        data: post,
        user: req.session.user,
        authorProfilePhoto: authorProfilePhoto,
        comments
      });
    } catch (error) {
      console.error("내용을 가져오는 중 오류 발생:", error);
      res.status(500).send("서버 내부 오류");
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
      const post = await db
        .getDb()
        .collection("info_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("삭제 권한이 없습니다.");
      }

      // Delete the post
      await db
        .getDb()
        .collection("info_board")
        .deleteOne({ _id: new ObjectId(id) });

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
      const post = await db
        .getDb()
        .collection("info_board")
        .findOne({ _id: new ObjectId(id) });

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
    let imagepath = req.session.imagepath || ""; // 세션에 저장된 imagepath 사용

    // Check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ID format");
    }

    try {
      const post = await db
        .getDb()
        .collection("info_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("수정 권한이 없습니다.");
      }

      await db
        .getDb()
        .collection("info_board")
        .updateOne(
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
    try {
      // ID로 게시물을 찾습니다
      const post = await db
        .getDb()
        .collection("ghwm_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        console.log("해당 ID로 게시물을 찾을 수 없습니다:", id);
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // 작성자를 ID로 찾습니다
      const author = await db
        .getDb()
        .collection("User_info")
        .findOne({ id_join: post.author });

      // 프로필 사진이 없는 경우 기본 사진 설정
      const authorProfilePhoto = author && author.profilePhoto ? author.profilePhoto : '기본프로필.png';

      // 조회수를 증가시킵니다
      await db
        .getDb()
        .collection("ghwm_board")
        .updateOne({ _id: new ObjectId(id) }, { $inc: { view: 1 } });

      // Fetch comments
      const comments = await db
        .getDb()
        .collection("ghwm_comment")
        .find({ postId: new ObjectId(id) })
        .sort({ date: 1 })
        .toArray();

      // 댓글 작성자 프로필 사진 가져오기
      const commentsWithProfilePhotos = await Promise.all(
        comments.map(async (comment) => {
          const commentAuthor = await db
            .getDb()
            .collection("User_info")
            .findOne({ id_join: comment.author });
          
          const commentAuthorProfilePhoto = commentAuthor && commentAuthor.profilePhoto ? commentAuthor.profilePhoto : '기본프로필.png';
          
          return { ...comment, authorProfilePhoto: commentAuthorProfilePhoto };
        })
      );
      
      res.render("ghwm-content", {
        data: post,
        user: req.session.user,
        authorProfilePhoto: authorProfilePhoto,
        comments
      });
    } catch (error) {
      console.error("내용을 가져오는 중 오류 발생:", error);
      res.status(500).send("서버 내부 오류");
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
      const post = await db
        .getDb()
        .collection("ghwm_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("삭제 권한이 없습니다.");
      }

      // Delete the post
      await db
        .getDb()
        .collection("ghwm_board")
        .deleteOne({ _id: new ObjectId(id) });

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
      const post = await db
        .getDb()
        .collection("ghwm_board")
        .findOne({ _id: new ObjectId(id) });

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
    let imagepath = req.session.imagepath || ""; // 세션에 저장된 imagepath 사용

    // Check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ID format");
    }

    try {
      const post = await db
        .getDb()
        .collection("ghwm_board")
        .findOne({ _id: new ObjectId(id) });

      if (!post) {
        return res.status(404).send("게시물을 찾을 수 없습니다.");
      }

      // Check if the logged-in user is the author of the post
      if (req.session.user.id !== post.author) {
        return res.status(403).send("수정 권한이 없습니다.");
      }

      await db
        .getDb()
        .collection("ghwm_board")
        .updateOne(
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

  router.post("/photo", upload.single("picture"), function (req, res) {
    if (req.file) {
      console.log(req.file.path);
      // 세션에 이미지 경로 저장
      req.session.imagepath = "/image/" + req.file.filename;
      res.status(200).send("File uploaded");
    } else {
      res.status(400).send("No file uploaded");
    }
  });

  module.exports = router;
