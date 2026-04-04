const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const fileType = require('file-type');
const authMiddleware = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

// Constants for validation
const MAX_CONTENT_LENGTH = 10000;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
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

// Validate uploaded file using magic number detection
const validateFileType = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    const type = await fileType.fileTypeFromBuffer(buffer);
    if (!type) {
      console.error('Could not detect file type');
      return false;
    }
    const isValid = ALLOWED_MIME_TYPES.includes(type.mime);
    if (!isValid) {
      console.error(`Invalid MIME type detected: ${type.mime}`);
    }
    return isValid;
  } catch (error) {
    console.error('File type validation error:', error);
    return false;
  }
};

// Middleware to handle multer errors gracefully
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({ 
        error: 'File too large. Maximum file size is 5MB' 
      });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: 'File too large. Maximum file size is 5MB' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Only one file can be uploaded' 
      });
    }
  }
  
  if (err && err.message) {
    if (err.message.includes('Only images')) {
      return res.status(400).json({ error: err.message });
    }
  }
  
  next(err);
};

// Create post
router.post('/', authMiddleware, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    handleMulterError(err, req, res, next);
  });
}, async (req, res) => {
  try {
    
    const { content, isPrivate } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Validate content length to prevent DoS
    if (content.length > MAX_CONTENT_LENGTH) {
      // Clean up uploaded file if it exists
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('File cleanup error:', err));
      }
      return res.status(400).json({ error: `Content too long (max ${MAX_CONTENT_LENGTH} characters)` });
    }

    // Validate file type using magic numbers if file is uploaded
    if (req.file) {
      const isValidFile = await validateFileType(req.file.path);
      if (!isValidFile) {
        await fs.unlink(req.file.path).catch(err => console.error('File cleanup error:', err));
        return res.status(400).json({ error: 'Invalid image file. Only JPEG, PNG, and GIF are allowed' });
      }
    }

    const post = new Post({
      author: req.userId,
      content: content.trim(),
      isPrivate: isPrivate === 'true' || isPrivate === true,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      comments: []
    });

    await post.save();
    await post.populate('author', 'firstName lastName profilePicture');

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Create post error:', error);
    console.error('Error stack:', error.stack);
    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error('File cleanup error:', err));
    }
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get all posts (newest first) with pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { isPrivate: false },
        { author: req.userId, isPrivate: true }
      ]
    };

    // Get total count for pagination info
    const totalPosts = await Post.countDocuments(query);
    
    const posts = await Post.find(query)
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
        path: 'comments.author',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'comments.likes',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'comments.reactions.user',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'comments.replies.author',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'comments.replies.likes',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'comments.replies.reactions.user',
        select: 'firstName lastName profilePicture'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    res.json({ 
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasMore: skip + posts.length < totalPosts
      }
    });
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
      })
      .populate({
        path: 'reactions.user',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'comments.author',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'comments.likes',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'comments.reactions.user',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'comments.replies.author',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'comments.replies.likes',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'comments.replies.reactions.user',
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
    const { reactionType = 'like' } = req.body; // Default to 'like' if not specified
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Find existing reaction from this user
    const existingReactionIndex = post.reactions.findIndex(
      r => r.user.toString() === req.userId
    );

    if (existingReactionIndex > -1) {
      // If same reaction type, remove it (toggle off)
      if (post.reactions[existingReactionIndex].type === reactionType) {
        post.reactions.splice(existingReactionIndex, 1);
        // Also remove from likes array for backward compatibility
        const likeIndex = post.likes.indexOf(req.userId);
        if (likeIndex > -1) {
          post.likes.splice(likeIndex, 1);
        }
      } else {
        // Update to new reaction type
        post.reactions[existingReactionIndex].type = reactionType;
      }
    } else {
      // Add new reaction
      post.reactions.push({
        user: req.userId,
        type: reactionType
      });
      // Also add to likes array for backward compatibility
      if (!post.likes.includes(req.userId)) {
        post.likes.push(req.userId);
      }
    }

    await post.save();
    
    // Populate all post data including author and nested reactions
    await post.populate('author', 'firstName lastName profilePicture');
    await post.populate({
      path: 'likes',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'reactions.user',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.author',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.likes',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.reactions.user',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.replies.author',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.replies.likes',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.replies.reactions.user',
      select: 'firstName lastName profilePicture'
    });

    res.json({ 
      message: 'Reaction updated',
      post
    });
  } catch (error) {
    console.error('React to post error:', error);
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

    // Validate content length to prevent DoS
    if (content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({ error: `Content too long (max ${MAX_CONTENT_LENGTH} characters)` });
    }

    post.content = content.trim();
    await post.save();
    await post.populate('author', 'firstName lastName profilePicture');
    await post.populate({
      path: 'likes',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'reactions.user',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.author',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.likes',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.reactions.user',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.replies.author',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.replies.likes',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.replies.reactions.user',
      select: 'firstName lastName profilePicture'
    });

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

    // Delete associated image file if it exists
    if (post.image) {
      const filePath = path.join(uploadsDir, path.basename(post.image));
      await fs.unlink(filePath).catch(err => {
        // Log error but don't fail the deletion if file cleanup fails
        console.error('File cleanup error:', err);
      });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add comment to post
router.post('/:id/comment', authMiddleware, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    handleMulterError(err, req, res, next);
  });
}, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!content && !req.file) {
      return res.status(400).json({ error: 'Comment content or image is required' });
    }

    // Validate content length if provided
    if (content && content.length > MAX_CONTENT_LENGTH) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('File cleanup error:', err));
      }
      return res.status(400).json({ error: `Content too long (max ${MAX_CONTENT_LENGTH} characters)` });
    }

    // Validate file type using magic numbers if file is uploaded
    if (req.file) {
      const isValidFile = await validateFileType(req.file.path);
      if (!isValidFile) {
        await fs.unlink(req.file.path).catch(err => console.error('File cleanup error:', err));
        return res.status(400).json({ error: 'Invalid image file. Only JPEG, PNG, and GIF are allowed' });
      }
    }

    const commentData = {
      author: req.userId,
      content: content ? content.trim() : '',
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

    // Populate all comment data
    await post.populate('author', 'firstName lastName profilePicture');
    await post.populate({
      path: 'comments.author',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.likes',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.reactions.user',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.replies.author',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.replies.likes',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.replies.reactions.user',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'likes',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'reactions.user',
      select: 'firstName lastName profilePicture'
    });

    res.status(201).json({ 
      message: 'Comment added successfully', 
      post 
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add reply to comment in post
router.post('/:id/comment/:commentId/reply', authMiddleware, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    handleMulterError(err, req, res, next);
  });
}, async (req, res) => {
  try {
    const { content } = req.body;
    const { id: postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!content && !req.file) {
      return res.status(400).json({ error: 'Reply content or image is required' });
    }

    // Validate content length if provided
    if (content && content.length > MAX_CONTENT_LENGTH) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('File cleanup error:', err));
      }
      return res.status(400).json({ error: `Content too long (max ${MAX_CONTENT_LENGTH} characters)` });
    }

    // Validate file type using magic numbers if file is uploaded
    if (req.file) {
      const isValidFile = await validateFileType(req.file.path);
      if (!isValidFile) {
        await fs.unlink(req.file.path).catch(err => console.error('File cleanup error:', err));
        return res.status(400).json({ error: 'Invalid image file. Only JPEG, PNG, and GIF are allowed' });
      }
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const replyData = {
      author: req.userId,
      content: content ? content.trim() : '',
      likes: [],
      reactions: []
    };

    if (req.file) {
      replyData.image = '/uploads/' + req.file.filename;
    }

    // Push reply into comment's replies array
    comment.replies.push(replyData);
    await post.save();

    // Populate all data
    await post.populate('author', 'firstName lastName profilePicture');
    await post.populate({
      path: 'comments.author',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.likes',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.reactions.user',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.replies.author',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.replies.likes',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.replies.reactions.user',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'likes',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'reactions.user',
      select: 'firstName lastName profilePicture'
    });

    res.status(201).json({ 
      message: 'Reply added successfully', 
      post 
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// React to comment in post
router.post('/:id/comment/:commentId/react', authMiddleware, async (req, res) => {
  try {
    const { reactionType } = req.body;
    const { id: postId, commentId } = req.params;

    if (!reactionType) {
      return res.status(400).json({ error: 'Reaction type is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
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
    await post.populate('author', 'firstName lastName profilePicture');
    await post.populate({
      path: 'comments.author',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.likes',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.reactions.user',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.replies.author',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.replies.likes',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'comments.replies.reactions.user',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'likes',
      select: 'firstName lastName profilePicture'
    });
    await post.populate({
      path: 'reactions.user',
      select: 'firstName lastName profilePicture'
    });

    res.json({ 
      message: 'Comment reaction updated',
      post
    });
  } catch (error) {
    console.error('React to comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
