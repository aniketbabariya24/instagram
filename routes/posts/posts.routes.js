const express = require("express");
const { addPost, likePost, sharePost, commentPost, replyComment, reReplyComment, getPostByIdController } = require("../../controllers/posts/post.controller");
const { auth } = require("../../middleware/auth");

const postRoutes = express.Router();

postRoutes.post('/add', auth, addPost)
postRoutes.post('/like', auth, likePost)
postRoutes.post('/share', auth, sharePost)
postRoutes.post('/comment', auth, commentPost)
postRoutes.post('/commentreply', auth, replyComment)
postRoutes.post('/rereply', auth, reReplyComment)
postRoutes.post('/getbyid', auth, getPostByIdController)
postRoutes.post('/getbyuser', auth, getPostByIdController)









module.exports={postRoutes};