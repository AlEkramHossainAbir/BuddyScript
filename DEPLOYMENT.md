# BuddyScript Deployment Guide

## 🚀 Deploying to Production

This guide will help you deploy your BuddyScript application with:
- **Backend**: Render.com
- **Frontend**: Vercel
- **Database**: MongoDB Atlas (already configured)

---

## 📋 Prerequisites

1. GitHub account (to push your code)
2. Render.com account (free tier available)
3. Vercel account (free tier available)
4. MongoDB Atlas cluster (already set up)

---

## 🔧 Backend Deployment (Render)

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

   **Basic Settings:**
   - **Name**: `buddyscript-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Set Environment Variables on Render

In the Render dashboard, add these environment variables:

```env
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://buddy_script:BUDDYSCRIPT123@cluster0.gjcdlw5.mongodb.net/?appName=Cluster0
JWT_SECRET=YourSuperSecretKey
CLIENT_URL=https://your-frontend-app.vercel.app
```

**Important**: 
- Update `CLIENT_URL` after deploying frontend (Step 4 below)
- Consider changing `JWT_SECRET` to a more secure random string

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete
3. Your backend will be live at: `https://buddyscript-backend.onrender.com`
4. Test the health endpoint: `https://your-backend.onrender.com/api/health`

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure the project:

   **Framework Preset**: Next.js (auto-detected)
   
   **Root Directory**: `client`
   
   **Build Settings:**
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

### Step 2: Set Environment Variables on Vercel

Add this environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

**Replace** `your-backend.onrender.com` with your actual Render backend URL from Step 4 above.

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Your frontend will be live at: `https://your-app.vercel.app`

### Step 4: Update Backend CORS

Go back to Render and update the `CLIENT_URL` environment variable with your Vercel URL:

```env
CLIENT_URL=https://your-app.vercel.app
```

Then trigger a manual redeploy on Render.

---

## ✅ Post-Deployment Checklist

### Backend (Render)
- [ ] Service is running without errors
- [ ] Health check endpoint works: `https://your-backend.onrender.com/api/health`
- [ ] MongoDB connection is successful (check logs)
- [ ] Environment variables are set correctly
- [ ] CORS is configured with correct frontend URL

### Frontend (Vercel)
- [ ] Application loads successfully
- [ ] API calls work (check Network tab)
- [ ] Authentication works (login/register)
- [ ] Image uploads work
- [ ] No CORS errors in console

---

## 🔍 Testing Your Deployment

1. **Open your Vercel URL**: `https://your-app.vercel.app`
2. **Register a new account**
3. **Login**
4. **Create a post with an image**
5. **Add a comment with reactions**
6. **Test all features**

---

## 📝 Important Notes

### Render Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after inactivity may take 30-60 seconds (cold start)
- 750 hours/month free (enough for one service running 24/7)

### Vercel Free Tier Limitations
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Global CDN

### File Uploads on Render
Render's ephemeral filesystem means uploaded files are lost on redeploy. For production, consider:
- **Cloudinary** (free tier: 25GB storage)
- **AWS S3** (pay as you go)
- **Vercel Blob** (integrated with Vercel)

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: "Application failed to respond"
- Check Render logs for errors
- Verify MongoDB connection string
- Ensure PORT is set to 8000

**Problem**: CORS errors
- Verify `CLIENT_URL` matches your Vercel URL exactly
- Include protocol: `https://`
- No trailing slash

### Frontend Issues

**Problem**: API calls failing
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check Network tab for actual URL being called
- Ensure backend is running on Render

**Problem**: Environment variables not working
- Must start with `NEXT_PUBLIC_` to be accessible in browser
- Redeploy after adding environment variables

---

## 🔐 Security Recommendations

Before going to production:

1. **Change JWT Secret**: Generate a strong random string
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Environment Variables**: Never commit `.env` files
   - Already in `.gitignore`
   - Use Render/Vercel dashboards for sensitive data

3. **MongoDB**: Consider updating credentials and restricting IP access

4. **Rate Limiting**: Add rate limiting middleware to prevent abuse

---

## 📞 Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → Logs
3. Check browser console for frontend errors
4. Check Network tab for API request/response details

---

## 🎉 Success!

Your application should now be live! 

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

Share your deployed URL and enjoy your social media app!
