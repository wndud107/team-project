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

// 댓글 저장 라우트 추가
router.post('/post-free-comment', async (req, res) => {
    const { comment, postId } = req.body;
    const user = req.session.user;
  
    if (!user) {
      return res.status(401).send('로그인이 필요합니다.');
    }
  
    try {
      await db.getDb().collection('free_comment').insertOne({
        author: user.id,
        content: comment,
        date: new Date(),
        postId: new ObjectId(postId)
      });
      res.status(201).send('댓글이 등록되었습니다.');
    } catch (error) {
      console.error('Error posting comment:', error);
      res.status(500).send('댓글 등록 중 오류가 발생했습니다.');
    }
  });
  
// 댓글 불러오기 라우트 추가
router.get('/get-free-comments', async (req, res) => {
    const { postId } = req.query;
  
    try {
      const comments = await db.getDb().collection('free_comment').find({ postId: new ObjectId(postId) }).sort({ date: 1 }).toArray();
      res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).send('댓글 불러오기 중 오류가 발생했습니다.');
    }
  });
  
router.delete('/delete-free-comment/:id', async function (req, res) {
    const commentId = req.params.id;
    const user = req.session.user;
  
    if (!ObjectId.isValid(commentId)) {
      return res.status(400).send("Invalid comment ID format");
    }
  
    try {
      const comment = await db.getDb().collection('free_comment').findOne({ _id: new ObjectId(commentId) });
  
      if (!comment) {
        return res.status(404).send("댓글을 찾을 수 없습니다.");
      }
  
      if (user.id !== comment.author) {
        return res.status(403).send("삭제 권한이 없습니다.");
      }
  
      await db.getDb().collection('free_comment').deleteOne({ _id: new ObjectId(commentId) });
  
      res.status(200).send("댓글이 삭제되었습니다.");
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).send("댓글 삭제 중 오류가 발생했습니다.");
    }
  });
  
// 댓글 저장 라우트 추가
router.post('/post-child-comment', async (req, res) => {
    const { comment, postId } = req.body;
    const user = req.session.user;
  
    if (!user) {
      return res.status(401).send('로그인이 필요합니다.');
    }
  
    try {
      await db.getDb().collection('child_comment').insertOne({
        author: user.id,
        content: comment,
        date: new Date(),
        postId: new ObjectId(postId)
      });
      res.status(201).send('댓글이 등록되었습니다.');
    } catch (error) {
      console.error('Error posting comment:', error);
      res.status(500).send('댓글 등록 중 오류가 발생했습니다.');
    }
  });
  
// 댓글 불러오기 라우트 추가
router.get('/get-child-comments', async (req, res) => {
    const { postId } = req.query;
  
    try {
      const comments = await db.getDb().collection('child_comment').find({ postId: new ObjectId(postId) }).sort({ date: 1 }).toArray();
      res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).send('댓글 불러오기 중 오류가 발생했습니다.');
    }
  });
  
router.delete('/delete-child-comment/:id', async function (req, res) {
    const commentId = req.params.id;
    const user = req.session.user;
  
    if (!ObjectId.isValid(commentId)) {
      return res.status(400).send("Invalid comment ID format");
    }
  
    try {
      const comment = await db.getDb().collection('child_comment').findOne({ _id: new ObjectId(commentId) });
  
      if (!comment) {
        return res.status(404).send("댓글을 찾을 수 없습니다.");
      }
  
      if (user.id !== comment.author) {
        return res.status(403).send("삭제 권한이 없습니다.");
      }
  
      await db.getDb().collection('child_comment').deleteOne({ _id: new ObjectId(commentId) });
  
      res.status(200).send("댓글이 삭제되었습니다.");
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).send("댓글 삭제 중 오류가 발생했습니다.");
    }
  });

// 댓글 저장 라우트 추가
router.post('/post-end-comment', async (req, res) => {
    const { comment, postId } = req.body;
    const user = req.session.user;
      
    if (!user) {
        return res.status(401).send('로그인이 필요합니다.');
    }
      
    try {
        await db.getDb().collection('end_comment').insertOne({
        author: user.id,
        content: comment,
        date: new Date(),
        postId: new ObjectId(postId)
        });
        res.status(201).send('댓글이 등록되었습니다.');
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).send('댓글 등록 중 오류가 발생했습니다.');
    }
    });
      
// 댓글 불러오기 라우트 추가
router.get('/get-end-comments', async (req, res) => {
    const { postId } = req.query;
      
    try {
        const comments = await db.getDb().collection('end_comment').find({ postId: new ObjectId(postId) }).sort({ date: 1 }).toArray();
        res.status(200).json(comments);
        } catch (error) {
          console.error('Error fetching comments:', error);
          res.status(500).send('댓글 불러오기 중 오류가 발생했습니다.');
        }
    });
      
router.delete('/delete-end-comment/:id', async function (req, res) {
    const commentId = req.params.id;
    const user = req.session.user;
      
    if (!ObjectId.isValid(commentId)) {
        return res.status(400).send("Invalid comment ID format");
    }
      
    try {
        const comment = await db.getDb().collection('end_comment').findOne({ _id: new ObjectId(commentId) });
      
        if (!comment) {
            return res.status(404).send("댓글을 찾을 수 없습니다.");
        }
      
        if (user.id !== comment.author) {
            return res.status(403).send("삭제 권한이 없습니다.");
        }
      
        await db.getDb().collection('end_comment').deleteOne({ _id: new ObjectId(commentId) });
      
        res.status(200).send("댓글이 삭제되었습니다.");
        } catch (error) {
          console.error('Error deleting comment:', error);
          res.status(500).send("댓글 삭제 중 오류가 발생했습니다.");
        }
    });

// 댓글 저장 라우트 추가
router.post('/post-ghwm-comment', async (req, res) => {
    const { comment, postId } = req.body;
    const user = req.session.user;
  
    if (!user) {
      return res.status(401).send('로그인이 필요합니다.');
    }
  
    try {
      await db.getDb().collection('ghwm_comment').insertOne({
        author: user.id,
        content: comment,
        date: new Date(),
        postId: new ObjectId(postId)
      });
      res.status(201).send('댓글이 등록되었습니다.');
    } catch (error) {
      console.error('Error posting comment:', error);
      res.status(500).send('댓글 등록 중 오류가 발생했습니다.');
    }
  });
  
// 댓글 불러오기 라우트 추가
router.get('/get-ghwm-comments', async (req, res) => {
    const { postId } = req.query;
  
    try {
      const comments = await db.getDb().collection('ghwm_comment').find({ postId: new ObjectId(postId) }).sort({ date: 1 }).toArray();
      res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).send('댓글 불러오기 중 오류가 발생했습니다.');
    }
  });
  
  router.delete('/delete-ghwm-comment/:id', async function (req, res) {
    const commentId = req.params.id;
    const user = req.session.user;
  
    if (!ObjectId.isValid(commentId)) {
      return res.status(400).send("Invalid comment ID format");
    }
  
    try {
      const comment = await db.getDb().collection('ghwm_comment').findOne({ _id: new ObjectId(commentId) });
  
      if (!comment) {
        return res.status(404).send("댓글을 찾을 수 없습니다.");
      }
  
      if (user.id !== comment.author) {
        return res.status(403).send("삭제 권한이 없습니다.");
      }
  
      await db.getDb().collection('ghwm_comment').deleteOne({ _id: new ObjectId(commentId) });
  
      res.status(200).send("댓글이 삭제되었습니다.");
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).send("댓글 삭제 중 오류가 발생했습니다.");
    }
  });

// 댓글 저장 라우트 추가
router.post('/post-info-comment', async (req, res) => {
    const { comment, postId } = req.body;
    const user = req.session.user;
  
    if (!user) {
      return res.status(401).send('로그인이 필요합니다.');
    }
  
    try {
      await db.getDb().collection('info_comment').insertOne({
        author: user.id,
        content: comment,
        date: new Date(),
        postId: new ObjectId(postId)
      });
      res.status(201).send('댓글이 등록되었습니다.');
    } catch (error) {
      console.error('Error posting comment:', error);
      res.status(500).send('댓글 등록 중 오류가 발생했습니다.');
    }
  });
  
// 댓글 불러오기 라우트 추가
router.get('/get-info-comments', async (req, res) => {
    const { postId } = req.query;
  
    try {
      const comments = await db.getDb().collection('info_comment').find({ postId: new ObjectId(postId) }).sort({ date: 1 }).toArray();
      res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).send('댓글 불러오기 중 오류가 발생했습니다.');
    }
  });
  
router.delete('/delete-info-comment/:id', async function (req, res) {
    const commentId = req.params.id;
    const user = req.session.user;
  
    if (!ObjectId.isValid(commentId)) {
      return res.status(400).send("Invalid comment ID format");
    }
  
    try {
      const comment = await db.getDb().collection('info_comment').findOne({ _id: new ObjectId(commentId) });
  
      if (!comment) {
        return res.status(404).send("댓글을 찾을 수 없습니다.");
      }
  
      if (user.id !== comment.author) {
        return res.status(403).send("삭제 권한이 없습니다.");
      }
  
      await db.getDb().collection('info_comment').deleteOne({ _id: new ObjectId(commentId) });
  
      res.status(200).send("댓글이 삭제되었습니다.");
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).send("댓글 삭제 중 오류가 발생했습니다.");
    }
  });

module.exports = router;
