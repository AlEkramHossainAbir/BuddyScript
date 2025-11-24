# 🚀 Quick Deployment Commands

## For Your Node.js Backend on Render:

### Start Command:
```bash
npm start
```

### Build Command:
```bash
npm install
```

---

## Environment Variables for Render (Backend):

Add these in Render Dashboard → Environment:

```env
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://buddy_script:BUDDYSCRIPT123@cluster0.gjcdlw5.mongodb.net/?appName=Cluster0
JWT_SECRET=YourSuperSecretKey
CLIENT_URL=https://your-frontend-app.vercel.app
```

**Note**: Update `CLIENT_URL` after deploying to Vercel

---

## Environment Variables for Vercel (Frontend):

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

**Note**: Update with your actual Render backend URL

---

## Quick Setup Steps:

### 1. Backend (Render)
1. Push code to GitHub
2. Create new Web Service on Render
3. Set Root Directory: `server`
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`
6. Add environment variables above
7. Deploy!

### 2. Frontend (Vercel)
1. Import GitHub repo to Vercel
2. Set Root Directory: `client`
3. Framework: Next.js (auto-detected)
4. Add `NEXT_PUBLIC_API_URL` environment variable
5. Deploy!

### 3. Update CORS
- Go back to Render
- Update `CLIENT_URL` with your Vercel URL
- Redeploy

---

## That's it! 🎉

Your app should now be live and working!
