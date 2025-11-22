const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

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
    cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
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

// Create post
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { content, isPrivate } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const post = new Post({
      author: req.userId,
      content,
      isPrivate: isPrivate === 'true' || isPrivate === true,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });

    await post.save();
    await post.populate('author', 'firstName lastName profilePicture');

    console.log('Post created successfully:', post._id);
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Create post error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get all posts (newest first)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({
      $or: [
        { isPrivate: false },
        { author: req.userId, isPrivate: true }
      ]
    })
      .populate('author', 'firstName lastName profilePicture')
      .populate({
        path: 'likes',
        select: 'firstName lastName profilePicture'
      })
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName profilePicture')
      .populate({
        path: 'likes',
        select: 'firstName lastName profilePicture'
      });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user can view this post
    if (post.isPrivate && post.author._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to view this post' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Like/Unlike post
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.userId);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.userId);
    }

    await post.save();
    await post.populate({
      path: 'likes',
      select: 'firstName lastName profilePicture'
    });

    res.json({ 
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      likes: post.likes
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update post
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    post.content = content;
    await post.save();
    await post.populate('author', 'firstName lastName profilePicture');

    res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
