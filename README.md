# BuddyScript - Social Media Platform

A full-stack social media application built with Next.js and Node.js, featuring Facebook-style reactions, real-time interactions, and modern UI/UX.

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features Implemented](#features-implemented)
- [Architecture & Design Decisions](#architecture--design-decisions)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Documentation](#api-documentation)

---

## 🎯 Project Overview

BuddyScript is a modern social media platform that transforms a static HTML template into a fully functional, interactive web application. The project implements core social networking features including user authentication, post creation, commenting, and a sophisticated reaction system similar to Facebook.

### Original Template Modifications

**Base Template**: Static HTML/CSS social media interface
**Transformations Made**:
- Converted static HTML to dynamic React/Next.js components
- Replaced hardcoded content with data from MongoDB database
- Implemented user authentication with JWT and Google OAuth
- Added real-time state management and API integrations
- Enhanced UI with modern interaction patterns (hover effects, modals, toast notifications)
- Implemented file upload functionality for images
- Created responsive mobile navigation

---

## 🛠 Tech Stack

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| **next** | 16.0.3 | React framework for server-side rendering, routing, and optimized performance |
| **react** | 19.2.0 | Core UI library for building component-based interfaces |
| **react-dom** | 19.2.0 | React rendering for web browsers |
| **typescript** | ^5 | Type safety and improved developer experience |
| **@charkour/react-reactions** | ^0.11.0 | Pre-built reaction picker component (Facebook-style) |
| **@react-oauth/google** | ^0.12.2 | Google OAuth integration for social login |
| **axios** | ^1.13.2 | HTTP client for API requests with interceptors |
| **react-toastify** | ^11.0.5 | Toast notifications for user feedback |
| **tailwindcss** | ^4 | Utility-first CSS framework (with existing custom CSS) |

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| **express** | ^5.1.0 | Web application framework for building REST APIs |
| **mongoose** | ^9.0.0 | MongoDB ODM for schema modeling and database operations |
| **jsonwebtoken** | ^9.0.2 | JWT-based authentication token generation/validation |
| **bcryptjs** | ^3.0.3 | Password hashing for secure user authentication |
| **passport** | ^0.7.0 | Authentication middleware framework |
| **passport-google-oauth20** | ^2.0.0 | Google OAuth 2.0 strategy for Passport |
| **multer** | ^2.0.2 | Multipart form data handling for file uploads |
| **cors** | ^2.8.5 | Cross-origin resource sharing middleware |
| **dotenv** | ^17.2.3 | Environment variable management |
| **express-session** | ^1.18.2 | Session management for authentication |
| **google-auth-library** | ^10.5.0 | Google authentication library |
| **nodemon** | ^3.1.11 | Development server with auto-restart |

---

## ✨ Features Implemented

### 1. **Authentication System**
- **JWT-based Authentication**: Secure token-based auth with automatic token refresh
- **Google OAuth Integration**: One-click social login
- **Protected Routes**: Client and server-side route protection
- **Session Management**: Persistent login with localStorage and HTTP-only considerations
- **Password Security**: Bcrypt hashing with salt rounds

**Implementation Highlights**:
```javascript
// Auth context for global state management
// JWT tokens stored in localStorage
// Axios interceptors for automatic token attachment
// Protected API routes with middleware
```

### 2. **Post Management**
- **Create Posts**: Text and image posts with preview
- **Edit Posts**: In-place editing for post authors
- **Delete Posts**: Author-only deletion with confirmation
- **Privacy Settings**: Public/Private post visibility
- **Image Uploads**: Multer-based file handling with preview
- **Timestamp Display**: Human-readable relative timestamps

**Design Decision**: Posts use `isPrivate` boolean flag instead of multiple privacy levels to keep the MVP simple while maintaining the option to expand later.

### 3. **Facebook-Style Reaction System**
- **6 Reaction Types**: Like, Love, Haha, Wow, Sad, Angry
- **Hover Picker**: Smooth reaction selector on hover (500ms delay)
- **Visual Feedback**: Emoji display and color changes for active reactions
- **Reaction Summary**: Shows top 3 reaction types with counts
- **User Reaction Tracking**: One reaction per user, can be changed
- **Reactors List Modal**: Click to see who reacted and with what

**Technical Approach**:
```javascript
// Reactions stored as embedded subdocuments in Post/Comment models
reactions: [{
  user: ObjectId,
  type: enum['like', 'love', 'haha', 'wow', 'sad', 'angry']
}]

// State management prevents picker from disappearing during mouse movement
// Wrapper div with coordinated mouse events ensures smooth UX
```

**UX Improvements Made**:
- Initial implementation had picker disappearing when mouse moved toward it
- **Solution**: Wrapped button and picker in container with shared hover state
- Added 500ms timeout before hiding picker for natural interaction
- Preserved original CSS classnames to maintain design consistency

### 4. **Comments & Replies System**
- **Nested Comments**: Two-level comment structure (comments → replies)
- **Image Support**: Upload images with comments and replies
- **Reaction Support**: Full reaction system on comments
- **Reply Threading**: Click "Reply" to expand reply box
- **Auto-focus**: Reply box focuses automatically when opened
- **Input Reset Fix**: File input resets after selection to allow re-upload

**Bug Fixed**:
```javascript
// Problem: After removing image preview, couldn't select new image
// Root Cause: File input value not reset, browser prevents same file selection
// Solution: e.target.value = '' after file processing
```

### 5. **Image Preview & Upload**
- **Modern Preview UI**: Circular X button overlay (replaced old below-image button)
- **Instant Preview**: FileReader API for immediate visual feedback
- **Remove Functionality**: Clear selection before upload
- **Responsive Sizing**: Max-width constraints for consistent display
- **Format Support**: Standard image formats (jpg, png, gif, etc.)

**Design Evolution**:
```
Before: [Image Preview]
        [Remove Image Button]

After:  [Image Preview with ⊗ overlay]
```

### 6. **Reactors List Modal**
- **Who Reacted**: Shows all users who reacted to post/comment
- **Reaction Breakdown**: Tabs showing counts by reaction type
- **Profile Display**: User avatars and names
- **Interactive UI**: Hover effects, smooth animations
- **Accessibility**: Escape key and click-outside to close

**Implementation**:
- Reusable `ReactorsModal` component
- Click on reaction summary (post/comment) to open
- Grouped display: "All 15" | "👍 8" | "❤️ 5" | "😂 2"

### 7. **UI/UX Enhancements**
- **Toast Notifications**: Success/error feedback for all actions
- **Loading States**: User feedback during async operations
- **Error Handling**: Graceful error messages for API failures
- **Responsive Design**: Mobile-friendly with preserved template styles
- **Smooth Animations**: CSS transitions for modals and dropdowns
- **Hydration Error Fixes**: Removed nested `<a>` tags causing React warnings

---

## 🏗 Architecture & Design Decisions

### 1. **Monorepo Structure**
```
BuddyScript/
├── client/          # Next.js frontend
│   ├── app/         # App router pages
│   ├── components/  # React components
│   ├── contexts/    # React context providers
│   └── lib/         # Utilities (API client)
└── server/          # Express backend
    └── src/
        ├── models/      # Mongoose schemas
        ├── routes/      # API endpoints
        ├── middleware/  # Auth, validation
        └── config/      # DB, OAuth config
```

**Why This Structure?**
- Separation of concerns between frontend and backend
- Independent deployment possible
- Clear boundaries for team collaboration
- Easier to scale each part independently

### 2. **State Management Approach**
- **React Context**: Global auth state (user, token)
- **Component State**: Local UI state (forms, modals, dropdowns)
- **No Redux**: Project scope didn't justify additional complexity

**Reasoning**: React Context + hooks sufficient for this scale. Avoids boilerplate while maintaining clear data flow.

### 3. **Database Schema Design**

**Posts & Comments**: 
- Used embedded reactions array instead of separate collection
- **Trade-off**: Slightly larger document size vs. faster reads (no joins)
- **Justification**: Reactions are always fetched with post/comment, embedding is more efficient

**User References**:
- Used `ObjectId` references with `.populate()` for user data
- Prevents data duplication and enables profile updates to reflect everywhere

### 4. **Image Storage**
**Current**: Local file system (`/uploads` directory)
**Consideration**: For production deployment on ephemeral platforms (Render, Railway, Heroku):
- Implemented Cloudinary integration path
- Env variable detection for automatic cloud upload
- **Note**: Images will be lost on server restart if using local storage in production

### 5. **Authentication Flow**
```
1. User logs in → Server validates credentials
2. Server generates JWT token with user ID
3. Token sent to client, stored in localStorage
4. Client attaches token to all API requests (Authorization header)
5. Server middleware verifies token on protected routes
6. Token expiry handled with auto-logout
```

**Security Considerations**:
- Passwords never stored in plain text (bcrypt hashing)
- JWT secret in environment variables
- CORS configured to allow specific origins
- Protected routes check authentication on both client and server

### 6. **Component Hierarchy**
```
Page (app/page.tsx)
├── Header (nav, auth status)
├── LeftSidebar (navigation)
├── CreatePost (new post form)
├── Post (repeating)
│   ├── Comments (nested)
│   │   └── Reply (nested)
│   └── ReactorsModal (conditional)
└── RightSidebar (suggestions)
```

**Preservation of Original Design**:
- Kept all original CSS classes from template
- Modified only inner content, not structure
- Added inline styles only when necessary for new features
- Result: New functionality with familiar UI

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or cloud instance)
- Google OAuth credentials (optional, for social login)

### 1. Clone Repository
```bash
git clone <repository-url>
cd BuddyScript
```

### 2. Server Setup
```bash
cd server
npm install
```

Create `.env` file in `server/` directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/buddyscript
# or MongoDB Atlas connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/buddyscript

# JWT Secret (use strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=8000
NODE_ENV=development

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback

# Session Secret
SESSION_SECRET=your-session-secret-key

# Cloudinary (optional, for cloud image storage)
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Client Setup
```bash
cd ../client
npm install
```

Create `.env.local` file in `client/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
Server runs on `http://localhost:8000`

**Terminal 2 - Frontend Client:**
```bash
cd client
npm run dev
```
Client runs on `http://localhost:3000`

### Production Build

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm start
```

### First Time Setup
1. Start both servers
2. Navigate to `http://localhost:3000`
3. Click "Register" to create an account
4. Or use "Sign in with Google" if configured

---

## 🧪 Testing

### Local Testing Checklist

#### Authentication
- [ ] Register new user with email/password
- [ ] Login with created credentials
- [ ] Login with Google OAuth
- [ ] Logout functionality
- [ ] Protected routes redirect to login

#### Posts
- [ ] Create text-only post
- [ ] Create post with image
- [ ] Edit own post
- [ ] Delete own post
- [ ] Cannot edit/delete others' posts
- [ ] Posts display with correct timestamps

#### Reactions
- [ ] Hover over Like button shows reaction picker
- [ ] Select each reaction type (like, love, haha, wow, sad, angry)
- [ ] Change reaction from one type to another
- [ ] Click reaction summary shows reactors modal
- [ ] Modal displays all users who reacted with correct reaction types

#### Comments & Replies
- [ ] Add text comment to post
- [ ] Add comment with image
- [ ] Upload image, remove it, upload different image (tests input reset fix)
- [ ] Click Reply button opens reply box
- [ ] Add reply to comment
- [ ] Reply box auto-focuses
- [ ] React to comments with different reaction types
- [ ] Click comment reaction summary shows reactors modal

#### UI/UX
- [ ] Toast notifications appear for actions (success/error)
- [ ] Image preview shows X button overlay
- [ ] Remove image before posting works
- [ ] Dropdowns close when clicking outside
- [ ] Modals close with X button, click outside, or Escape key
- [ ] No hydration errors in browser console
- [ ] Mobile responsive behavior

### Hosted Site Testing

**Backend Deployment** (Render/Railway/Heroku):
1. Set all environment variables in platform dashboard
2. Deploy from GitHub repository
3. Note the deployed URL (e.g., `https://your-app.onrender.com`)

**Frontend Deployment** (Vercel/Netlify):
1. Set `NEXT_PUBLIC_API_URL` to deployed backend URL
2. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` if using OAuth
3. Deploy from GitHub repository
4. Update Google OAuth redirect URIs to include production URL

**Testing on Hosted Site**:
```bash
# Test API health
curl https://your-backend-url.com/api/health

# Test authentication
curl -X POST https://your-backend-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'
```

**Common Hosted Environment Issues**:
1. **Images disappear after server restart**: 
   - Cause: Ephemeral file system
   - Solution: Configure Cloudinary environment variables
   
2. **CORS errors**: 
   - Check backend CORS configuration includes frontend URL
   - Verify `NEXT_PUBLIC_API_URL` is correct

3. **Google OAuth fails**:
   - Add production URL to Google Console authorized origins
   - Update `GOOGLE_CALLBACK_URL` to production backend URL

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}

Response: { "token": "jwt-token", "user": {...} }
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response: { "token": "jwt-token", "user": {...} }
```

### Post Endpoints

#### Get All Posts
```http
GET /api/posts
Authorization: Bearer <token>

Response: { "posts": [...] }
```

#### Create Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData: {
  content: "Post content",
  image: File (optional),
  isPrivate: boolean
}

Response: { "post": {...} }
```

#### React to Post
```http
POST /api/posts/:postId/like
Authorization: Bearer <token>
Content-Type: application/json

{
  "reactionType": "love"  // like|love|haha|wow|sad|angry
}

Response: { "post": {...} }
```

### Comment Endpoints

#### Get Post Comments
```http
GET /api/comments/post/:postId
Authorization: Bearer <token>

Response: { "comments": [...] }
```

#### Add Comment
```http
POST /api/comments
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData: {
  postId: "post-id",
  content: "Comment text",
  image: File (optional)
}

Response: { "comment": {...} }
```

#### React to Comment
```http
POST /api/comments/:commentId/like
Authorization: Bearer <token>
Content-Type: application/json

{
  "reactionType": "haha"
}

Response: { "comment": {...} }
```

---

## 🎨 Design Decisions Summary

### What Worked Well
✅ **Component Reusability**: ReactorsModal used for both posts and comments  
✅ **Type Safety**: TypeScript caught many bugs during development  
✅ **User Experience**: Smooth hover interactions, instant feedback with toasts  
✅ **Code Organization**: Clear separation between frontend components and backend routes  
✅ **Template Preservation**: Successfully kept original design while adding dynamic features

### Challenges Overcome
🔧 **Reaction Picker UX**: Initial implementation had picker disappearing on mouse movement
- **Solution**: Wrapper container with coordinated mouse events

🔧 **File Input Reset**: Couldn't re-select same image after removal
- **Solution**: Reset input value after processing

🔧 **Hydration Errors**: Nested anchor tags in comments
- **Solution**: Removed wrapper anchor, kept only name link

🔧 **Image Persistence**: Images lost on hosted platform restarts
- **Solution**: Prepared Cloudinary integration with environment-based detection

### Future Enhancements
🚀 Real-time updates with WebSockets  
🚀 Friend system and friend-only posts  
🚀 Notifications for reactions, comments, and replies  
🚀 Image optimization and CDN integration  
🚀 Search functionality for users and posts  
🚀 Hashtag support  
🚀 Stories feature  
🚀 Chat/messaging system

---

## 📄 License

This project was built as a demonstration of full-stack development capabilities, transforming a static template into a functional social media platform.

---

## 👨‍💻 Development Notes

**Time Investment**: Iterative development with focus on UX refinement  
**Key Learning**: Small UX details (like hover delays) significantly impact user satisfaction  
**Best Practice Applied**: Test edge cases (like file input reset) that users will encounter  
**Architecture Choice**: Kept simple patterns that scale well without over-engineering

For questions or issues, please refer to the codebase documentation or create an issue in the repository.
