# Vercel Deployment Fix Guide

## 🔧 Complete Vercel Configuration

### Step 1: Project Settings in Vercel Dashboard

1. **Framework Preset**: Next.js ✅ (auto-detected)

2. **Root Directory**: 
   ```
   client
   ```

3. **Build Settings**:
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `.next` (or leave default)
   - **Install Command**: `npm install` (or leave default)

4. **Node.js Version**: 
   - 18.x or higher (Vercel uses latest by default)

---

### Step 2: Environment Variables

Go to: **Project Settings → Environment Variables**

Add this variable for **Production**, **Preview**, and **Development**:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com/api` | Production, Preview, Development |

**Important**: 
- Replace `your-backend.onrender.com` with your actual Render backend URL
- Must include `/api` at the end
- Must start with `NEXT_PUBLIC_` to be accessible in browser

---

### Step 3: Common Issues & Fixes

#### ❌ Issue 1: "Module not found" errors
**Solution**: Make sure all imports use correct paths
- Check that all component imports are correct
- Verify `@/` alias is working (it should with Next.js)

#### ❌ Issue 2: Environment variables not working
**Solution**: 
- Redeploy after adding environment variables
- Check variable name starts with `NEXT_PUBLIC_`
- Verify no typos in variable name

#### ❌ Issue 3: Build fails with TypeScript errors
**Solution**: Run locally first:
```bash
cd client
npm run build
```
Fix any errors before deploying.

#### ❌ Issue 4: "Cannot find module 'react-toastify'"
**Solution**: All dependencies are in package.json, should auto-install

#### ❌ Issue 5: API calls failing
**Solution**: 
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Ensure Render backend is deployed and running
- Test backend URL: `https://your-backend.onrender.com/api/health`

---

### Step 4: Deploy

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Fix Vercel configuration"
   git push origin main
   ```

2. **Trigger Deploy**:
   - Vercel will auto-deploy when you push to GitHub
   - Or manually: Dashboard → Deployments → Redeploy

3. **Check Deployment Logs**:
   - Click on deployment
   - View build logs for any errors
   - Check function logs for runtime errors

---

### Step 5: Verify Deployment

1. ✅ Visit your Vercel URL
2. ✅ Open browser DevTools (F12)
3. ✅ Check Console for errors
4. ✅ Check Network tab for API calls
5. ✅ Test login/register functionality

---

## 🐛 Debugging Failed Deployments

### Check Build Logs:
1. Go to Vercel Dashboard
2. Click on failed deployment
3. Read build logs from top to bottom
4. Look for:
   - `Error:` messages
   - `Module not found`
   - `Type error`
   - `Environment variable` warnings

### Common Error Messages:

**Error**: `Error: Cannot find module 'X'`
- **Fix**: Check package.json has the dependency
- Run `npm install` locally first

**Error**: `Type error: Property 'X' does not exist`
- **Fix**: TypeScript errors - fix in code before deploying

**Error**: `NEXT_PUBLIC_API_URL is not defined`
- **Fix**: Add environment variable in Vercel dashboard

---

## ✅ Final Checklist

Before deploying:
- [ ] All code pushed to GitHub
- [ ] `client` folder is in repository root
- [ ] `package.json` has all dependencies
- [ ] No TypeScript errors (`npm run build` works locally)
- [ ] Environment variable `NEXT_PUBLIC_API_URL` is set in Vercel
- [ ] Backend is deployed and running on Render
- [ ] `.gitignore` allows `.env.example` to be committed

---

## 🎯 Quick Test

After deployment, test this in browser console:

```javascript
console.log(process.env.NEXT_PUBLIC_API_URL);
// Should show: https://your-backend.onrender.com/api
```

If it shows `undefined`, the environment variable isn't set correctly.

---

## 📞 Still Having Issues?

Share the error message from Vercel build logs and I'll help you fix it!
