require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { ConnectDb } = require('./db');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'https://buddy-script-opal.vercel.app'
];

if (process.env.CLIENT_URL) {
  const clientUrls = process.env.CLIENT_URL.split(',').map(url => url.trim());
  allowedOrigins.push(...clientUrls);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://buddy_script:BUDDYSCRIPT123@cluster0.gjcdlw5.mongodb.net/?appName=Cluster0";
ConnectDb(MONGODB_URI);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Root route - Welcome page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BuddyScript API - Running</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          position: relative;
        }
        .container {
          background: rgba(255, 255, 255, 0.95);
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
          max-width: 600px;
          z-index: 10;
          animation: fadeInUp 0.8s ease-out;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        h1 {
          color: #667eea;
          font-size: 2.5rem;
          margin-bottom: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #10b981;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-weight: bold;
          margin: 1.5rem 0;
          animation: slideIn 0.5s ease-out 0.3s both;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .dot {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          animation: blink 1.5s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .info {
          margin-top: 2rem;
          color: #4b5563;
          line-height: 1.8;
        }
        .endpoint {
          background: #f3f4f6;
          padding: 0.75rem;
          border-radius: 8px;
          margin: 0.5rem 0;
          font-family: 'Courier New', monospace;
          color: #667eea;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        .endpoint:hover {
          background: #e5e7eb;
          transform: translateX(5px);
        }
        /* Rain Animation */
        .rain {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
        }
        .drop {
          position: absolute;
          bottom: 100%;
          width: 2px;
          height: 50px;
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.5));
          animation: fall linear infinite;
        }
        @keyframes fall {
          to {
            transform: translateY(100vh);
          }
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-top: 2rem;
        }
        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem;
          border-radius: 10px;
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .stat-card h3 {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-bottom: 0.5rem;
        }
        .stat-card p {
          font-size: 1.5rem;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="rain" id="rain"></div>
      <div class="container">
        <h1>🚀 BuddyScript API</h1>
        <div class="status">
          <span class="dot"></span>
          Server is Running
        </div>
        <div class="info">
          <p><strong>Backend API is live and operational!</strong></p>
          <p style="margin-top: 1rem;">Available Endpoints:</p>
          <div class="endpoint">GET /api/health</div>
          <div class="endpoint">POST /api/auth/register</div>
          <div class="endpoint">POST /api/auth/login</div>
          <div class="endpoint">GET /api/posts</div>
        </div>
        <div class="stats">
          <div class="stat-card" style="animation-delay: 0.1s;">
            <h3>Status</h3>
            <p>✅ Active</p>
          </div>
          <div class="stat-card" style="animation-delay: 0.2s;">
            <h3>Database</h3>
            <p>🟢 Connected</p>
          </div>
          <div class="stat-card" style="animation-delay: 0.3s;">
            <h3>Node.js</h3>
            <p>${process.version}</p>
          </div>
          <div class="stat-card" style="animation-delay: 0.4s;">
            <h3>Environment</h3>
            <p>${process.env.NODE_ENV || 'development'}</p>
          </div>
        </div>
      </div>
      <script>
        // Create rain drops
        function createRain() {
          const rain = document.getElementById('rain');
          const drops = 50;
          
          for (let i = 0; i < drops; i++) {
            const drop = document.createElement('div');
            drop.className = 'drop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDuration = (Math.random() * 1 + 0.5) + 's';
            drop.style.animationDelay = Math.random() * 2 + 's';
            rain.appendChild(drop);
          }
        }
        createRain();
      </script>
    </body>
    </html>
  `);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});