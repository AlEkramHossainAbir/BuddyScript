const express = require('express');
const authMiddleware = require('../middleware/auth');
const Comment = require('../models/Comment');
const Reply = require('../models/Reply');
const Post = require('../models/Post');

const router = express.Router();

// Create comment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { postId, content } = req.body;

    if (!postId || !content) {
      return res.status(400).json({ error: 'Post ID and content are required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = new Comment({
      post: postId,
      author: req.userId,
      content
    });

    await comment.save();
    await comment.populate('author', 'firstName lastName profilePicture');

    res.status(201).json({ message: 'Comment created successfully', comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get comments for a post
router.get('/post/:postId', authMiddleware, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'firstName lastName profilePicture')
      .populate({
        path: 'likes',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'replies',
        populate: [
          { path: 'author', select: 'firstName lastName profilePicture' },
          { path: 'likes', select: 'firstName lastName profilePicture' }
        ]
      })
      .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Like/Unlike comment
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const likeIndex = comment.likes.indexOf(req.userId);

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(req.userId);
    }

    await comment.save();
    await comment.populate({
      path: 'likes',
      select: 'firstName lastName profilePicture'
    });

    res.json({ 
      message: likeIndex > -1 ? 'Comment unliked' : 'Comment liked',
      likes: comment.likes
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create reply
router.post('/:commentId/reply', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const reply = new Reply({
      comment: req.params.commentId,
      author: req.userId,
      content
    });

    await reply.save();
    await reply.populate('author', 'firstName lastName profilePicture');

    // Add reply to comment
    comment.replies.push(reply._id);
    await comment.save();

    res.status(201).json({ message: 'Reply created successfully', reply });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Like/Unlike reply
router.post('/reply/:id/like', authMiddleware, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);

    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    const likeIndex = reply.likes.indexOf(req.userId);

    if (likeIndex > -1) {
      reply.likes.splice(likeIndex, 1);
    } else {
      reply.likes.push(req.userId);
    }

    await reply.save();
    await reply.populate({
      path: 'likes',
      select: 'firstName lastName profilePicture'
    });

    res.json({ 
      message: likeIndex > -1 ? 'Reply unliked' : 'Reply liked',
      likes: reply.likes
    });
  } catch (error) {
    console.error('Like reply error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
