const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const Comment = require('../models/Comment');
const Reply = require('../models/Reply');
const Post = require('../models/Post');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'comment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  }
});

// Create comment
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { postId, content } = req.body;

    if (!postId || (!content && !req.file)) {
      return res.status(400).json({ error: 'Post ID and content or image are required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const commentData = {
      post: postId,
      author: req.userId,
      content: content || ''
    };

    if (req.file) {
      commentData.image = '/uploads/' + req.file.filename;
    }

    const comment = new Comment(commentData);

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
    const limit = parseInt(req.query.limit) || 50; // Default 50 comments
    
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'firstName lastName profilePicture')
      .populate({
        path: 'likes',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'reactions.user',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'replies',
        populate: [
          { path: 'author', select: 'firstName lastName profilePicture' },
          { path: 'likes', select: 'firstName lastName profilePicture' }
        ]
      })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean(); // Use lean() for better performance

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Like/React to comment
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const { reactionType } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Remove existing reaction from this user
    comment.reactions = comment.reactions.filter(
      reaction => reaction.user.toString() !== req.userId.toString()
    );

    // Add new reaction if provided
    if (reactionType) {
      comment.reactions.push({
        user: req.userId,
        type: reactionType
      });
    }

    // Also handle legacy likes
    const likeIndex = comment.likes.indexOf(req.userId);
    if (reactionType === 'like') {
      if (likeIndex === -1) {
        comment.likes.push(req.userId);
      }
    } else {
      if (likeIndex > -1) {
        comment.likes.splice(likeIndex, 1);
      }
    }

    await comment.save();
    await comment.populate([
      {
        path: 'likes',
        select: 'firstName lastName profilePicture'
      },
      {
        path: 'reactions.user',
        select: 'firstName lastName profilePicture'
      }
    ]);

    res.json({ 
      message: 'Comment reaction updated',
      likes: comment.likes,
      reactions: comment.reactions
    });
  } catch (error) {
    console.error('React to comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create reply
router.post('/:commentId/reply', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;

    if (!content && !req.file) {
      return res.status(400).json({ error: 'Content or image is required' });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const replyData = {
      comment: req.params.commentId,
      author: req.userId,
      content: content || ''
    };

    if (req.file) {
      replyData.image = '/uploads/' + req.file.filename;
    }

    const reply = new Reply(replyData);

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
