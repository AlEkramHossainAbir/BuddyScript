const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
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

// Create comment - Now embedded in Post
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
      author: req.userId,
      content: content || '',
      replies: [],
      likes: [],
      reactions: []
    };

    if (req.file) {
      commentData.image = '/uploads/' + req.file.filename;
    }

    // Push comment into post's comments array
    post.comments.push(commentData);
    await post.save();
    
    // Populate the comment author and return fully populated comment
    await post.populate({
      path: 'comments.author',
      select: 'firstName lastName profilePicture'
    });

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({ 
      message: 'Comment created successfully', 
      comment: newComment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get comments for a post (no need for separate API - get from post object)
router.get('/post/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('comments.author', 'firstName lastName profilePicture')
      .populate('comments.likes', 'firstName lastName profilePicture')
      .populate('comments.reactions.user', 'firstName lastName profilePicture')
      .populate('comments.replies.author', 'firstName lastName profilePicture')
      .populate('comments.replies.likes', 'firstName lastName profilePicture')
      .populate('comments.replies.reactions.user', 'firstName lastName profilePicture')
      .lean();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comments = post.comments || [];
    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Like/React to comment (embedded)
router.post('/:commentId/like', authMiddleware, async (req, res) => {
  try {
    const { postId, reactionType } = req.body;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Find comment by ID
    const comment = post.comments.id(req.params.commentId);
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

    await post.save();
    await post.populate([
      {
        path: 'comments.likes',
        select: 'firstName lastName profilePicture'
      },
      {
        path: 'comments.reactions.user',
        select: 'firstName lastName profilePicture'
      }
    ]);

    res.json({ 
      message: 'Comment reaction updated',
      comment,
      likes: comment.likes,
      reactions: comment.reactions
    });
  } catch (error) {
    console.error('React to comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create reply (embedded in comment)
router.post('/:commentId/reply', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { postId, content } = req.body;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    if (!content && !req.file) {
      return res.status(400).json({ error: 'Content or image is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const replyData = {
      author: req.userId,
      content: content || '',
      likes: [],
      reactions: []
    };

    if (req.file) {
      replyData.image = '/uploads/' + req.file.filename;
    }

    // Push reply into comment's replies array
    comment.replies.push(replyData);
    await post.save();

    // Populate reply author
    await post.populate({
      path: 'comments.replies.author',
      select: 'firstName lastName profilePicture'
    });

    const newReply = comment.replies[comment.replies.length - 1];

    res.status(201).json({ 
      message: 'Reply created successfully', 
      reply: newReply 
    });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Like/Unlike reply (embedded)
router.post('/reply/:replyId/like', authMiddleware, async (req, res) => {
  try {
    const { postId, commentId } = req.body;

    if (!postId || !commentId) {
      return res.status(400).json({ error: 'Post ID and Comment ID are required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    const likeIndex = reply.likes.indexOf(req.userId);

    if (likeIndex > -1) {
      reply.likes.splice(likeIndex, 1);
    } else {
      reply.likes.push(req.userId);
    }

    await post.save();
    await post.populate({
      path: 'comments.replies.likes',
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
