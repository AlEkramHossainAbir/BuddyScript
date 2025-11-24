# Image Upload Fix for Production

## Issues Fixed

### 1. ✅ Hardcoded localhost URLs
- **Problem**: Image URLs were hardcoded to `http://localhost:8000`
- **Solution**: Updated to use `NEXT_PUBLIC_API_URL` environment variable
- **Files Updated**: 
  - `client/components/Post.tsx`
  - `client/components/Comments.tsx`

### 2. ⚠️ Ephemeral File Storage on Render (CRITICAL)

**Problem**: Render uses ephemeral storage. Any files uploaded to the `uploads/` folder will be **deleted when the server restarts**.

**Recommended Solutions**:

#### Option A: Cloudinary (Recommended - Free tier available)

1. **Sign up for Cloudinary**: https://cloudinary.com/
2. **Install Cloudinary package**:
   ```bash
   cd server
   npm install cloudinary multer-storage-cloudinary
   ```

3. **Update `server/src/routes/posts.js`**:
   ```javascript
   const cloudinary = require('cloudinary').v2;
   const { CloudinaryStorage } = require('multer-storage-cloudinary');

   // Configure Cloudinary
   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   });

   // Update storage configuration
   const storage = new CloudinaryStorage({
     cloudinary: cloudinary,
     params: {
       folder: 'buddyscript-posts',
       allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
       transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
     }
   });
   ```

4. **Add environment variables to Render**:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

5. **Update Post model to store full URL**:
   ```javascript
   // In posts.js, change:
   image: req.file ? `/uploads/${req.file.filename}` : null
   // To:
   image: req.file ? req.file.path : null
   ```

#### Option B: AWS S3

1. **Setup AWS S3 bucket**
2. **Install AWS SDK**:
   ```bash
   npm install @aws-sdk/client-s3 multer-s3
   ```
3. Configure similar to Cloudinary

#### Option C: Keep Current Setup (Temporary Files)

If you accept that uploaded images will be lost on restart:

1. **Document this limitation** for users
2. **Add warning** in the upload UI
3. Use this only for testing/development

## Environment Variables Setup

### Vercel (Frontend)
Already configured:
```
NEXT_PUBLIC_API_URL=https://buddyscript-backend.onrender.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
```

### Render (Backend)
Required:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=https://buddy-script-opal.vercel.app
```

If using Cloudinary:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Testing

After deploying:

1. **Upload a post with image** on production
2. **Verify image displays** correctly
3. **Check network tab** to confirm image URL uses production backend URL
4. **If using Cloudinary**: Verify image persists after Render restart

## Current Status

- ✅ Image URLs now use environment variables
- ✅ Works correctly on localhost
- ⚠️ **Production needs cloud storage** to persist images
- Files currently saved to `server/uploads/` (will be deleted on Render restart)

## Next Steps

1. Choose cloud storage solution (Cloudinary recommended)
2. Set up account and get API credentials
3. Update backend code to use cloud storage
4. Add environment variables to Render
5. Test upload and display on production
6. Redeploy backend to Render
