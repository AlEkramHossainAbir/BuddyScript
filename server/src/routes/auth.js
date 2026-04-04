const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const { validateEmail } = require('../utils/validators');

const router = express.Router();

// Verify JWT_SECRET is configured
if (!process.env.JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET is not configured. Server will not start.');
}

// Helper function to generate JWT token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Google OAuth Login/Register  
 * Supports both authorization code flow and token-based flow
 * Uses server-side validation for enhanced security
 */
router.post('/google', async (req, res) => {
  try {
    const { code, token } = req.body;
    let googleUserData;

    // Try authorization code flow first (recommended)
    if (code) {
      try {
        // Exchange code for tokens using Google's backend
        const tokenResponse = await axios.post(
          'https://oauth2.googleapis.com/token',
          {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: 'postmessage',
            grant_type: 'authorization_code'
          }
        );

        const { access_token } = tokenResponse.data;

        // Get user info using the access token
        const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        });

        googleUserData = googleResponse.data;
      } catch (codeError) {
        console.error('Code exchange failed:', codeError.response?.data || codeError.message);
        // Fall through to token validation if code exchange fails
        if (!token) {
          return res.status(401).json({ error: 'Code exchange failed and no token provided' });
        }
      }
    }

    // Fall back to token-based validation if code flow failed or code not provided
    if (!googleUserData && token) {
      try {
        // Validate token by calling Google's userinfo endpoint
        const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        googleUserData = googleResponse.data;
      } catch (tokenError) {
        console.error('Token validation failed:', tokenError.response?.data || tokenError.message);
        return res.status(401).json({ error: 'Invalid Google token' });
      }
    }

    if (!googleUserData) {
      return res.status(400).json({ error: 'Either code or token is required' });
    }

    const { sub: googleId, email, given_name, family_name, picture } = googleUserData;

    // Validate email format
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email from Google' });
    }

    // Check if user exists
    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (user) {
      // User exists - update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.isEmailVerified = true;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        firstName: given_name || 'User',
        lastName: family_name || '',
        email: email.toLowerCase(),
        googleId,
        authProvider: 'google',
        isEmailVerified: true,
        profilePicture: picture || `/assets/images/people${Math.floor(Math.random() * 3) + 1}.png`
      });

      await user.save();
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    res.json({
      message: 'Google authentication successful',
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});



// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format - SERVER SIDE VALIDATION
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength (minimum 8 chars, uppercase, lowercase, number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Validate names (prevent XSS)
    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      return res.status(400).json({ error: 'Invalid first or last name' });
    }

    // Hash password with bcryptjs (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      authProvider: 'local',
      isEmailVerified: false, // Require email verification
      profilePicture: `/assets/images/people${Math.floor(Math.random() * 3) + 1}.png`
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user has a password (local auth)
    if (!user.password) {
      return res.status(401).json({ error: 'Please use Google OAuth to login' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
