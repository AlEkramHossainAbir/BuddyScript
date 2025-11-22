# BuddyScript - Social Network Platform

A full-stack social media application built with Next.js, Express.js, and MongoDB.

## Features

### Authentication & Authorization
- ✅ JWT-based authentication system
- ✅ User registration with first name, last name, email, and password
- ✅ Secure login system
- ✅ Protected routes

### Feed & Posts
- ✅ Create posts with text and images
- ✅ Public and Private post visibility
- ✅ Posts displayed in reverse chronological order (newest first)
- ✅ Like/unlike posts
- ✅ View who liked each post
- ✅ Delete own posts

### Comments & Replies
- ✅ Comment on posts
- ✅ Reply to comments
- ✅ Like/unlike comments and replies
- ✅ View who liked comments and replies
- ✅ Nested comment display

## Tech Stack

### Frontend
- **Next.js 16** - React framework for production
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **Bootstrap 5** - UI styling (from original design)

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Bcrypt.js** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (already created):
```
PORT=8000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
MONGODB_URI=mongodb://127.0.0.1:27017/buddyScript
```

4. Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod
```

5. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file (already created):
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm run dev
```

Client will run on `http://localhost:3000`

## Usage

1. **Register**: Navigate to `/register` or click "Create New Account" from login page
2. **Login**: Use your credentials at `/login`
3. **Feed**: After login, you'll be redirected to `/feed` where you can:
   - Create new posts (with optional images)
   - Toggle private/public visibility
   - Like/unlike posts
   - Comment on posts
   - Reply to comments
   - View who liked posts, comments, and replies

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Posts
- `POST /api/posts` - Create new post (with image upload)
- `GET /api/posts` - Get all posts (filtered by visibility)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts/:id/like` - Like/unlike post
- `DELETE /api/posts/:id` - Delete post

### Comments
- `POST /api/comments` - Create comment
- `GET /api/comments/post/:postId` - Get comments for post
- `POST /api/comments/:id/like` - Like/unlike comment
- `POST /api/comments/:commentId/reply` - Create reply
- `POST /api/comments/reply/:id/like` - Like/unlike reply

## Project Structure

```
BuddyScript/
├── client/                    # Next.js frontend
│   ├── app/
│   │   ├── feed/             # Feed page
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   ├── CreatePost.tsx    # Create post component
│   │   └── Post.tsx          # Post display component
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication context
│   ├── lib/
│   │   └── api.ts            # API client
│   └── public/
│       └── assets/           # Static assets (CSS, images, fonts)
│
└── server/                    # Express.js backend
    ├── src/
    │   ├── models/           # Mongoose models
    │   │   ├── User.js
    │   │   ├── Post.js
    │   │   ├── Comment.js
    │   │   └── Reply.js
    │   ├── routes/           # API routes
    │   │   ├── auth.js
    │   │   ├── posts.js
    │   │   └── comments.js
    │   ├── middleware/
    │   │   └── auth.js       # JWT middleware
    │   ├── db.js             # Database connection
    │   └── index.js          # Server entry point
    └── uploads/              # Uploaded images

```

## Design Notes

The frontend maintains the original HTML/CSS design from the provided templates. All custom CSS classes and styling have been preserved to match the exact design specifications.

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- CORS configuration
- Input validation
- Private/public post visibility control

## Future Enhancements (Not Implemented)

- Password reset functionality
- Email verification
- User profile pages
- Friend system
- Real-time notifications
- Post sharing
- Search functionality
- Image optimization

## License

This project was created as part of a technical assessment for Appifylab.

## Author

Created by AlEkramHossainAbir
