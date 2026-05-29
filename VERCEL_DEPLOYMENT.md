# 🚀 Deploy Both Frontend & Backend on Vercel

This guide shows how to deploy the entire School Management System (frontend + backend) on Vercel.

## ✅ Advantages of Vercel-Only Deployment

- ✅ **Single Platform** - Manage everything in one place
- ✅ **Auto HTTPS** - SSL certificates automatic
- ✅ **Global CDN** - Fast worldwide
- ✅ **Automatic Deployments** - Push to git = auto deploy
- ✅ **Free Tier** - Generous limits for small projects
- ✅ **Easy Environment Variables** - Simple dashboard

## ⚠️ Limitations to Know

- ⚠️ **Serverless Functions** - 10 second timeout (usually fine for school management)
- ⚠️ **Cold Starts** - First request may be slower (1-2 seconds)
- ⚠️ **File Uploads** - Limited to 4.5MB per request (Cloudinary handles this)
- ⚠️ **No WebSockets** - But not needed for this project

---

## 📋 Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Stage all changes
git add .

# Commit
git commit -m "Production-ready: Backend + Frontend on Vercel"

# Push to GitHub
git branch -M main
git remote add origin https://github.com/nirajjoshi1/sms.git
git push -u origin main
```

### 2. Setup Database (Neon PostgreSQL)

Before deploying, set up your database:

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project: `school-management-db`
3. Copy the connection string (looks like):
   ```
   postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require
   ```
4. Save it - you'll need it for Vercel environment variables

### 3. Setup Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com)
2. Get your credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 4. Setup Email (Gmail)

1. Enable 2FA: [myaccount.google.com](https://myaccount.google.com) → Security
2. Generate App Password: Security → App passwords
3. Save the 16-character password

### 5. Deploy on Vercel

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import `nirajjoshi1/sms`

3. **Configure Build Settings**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables** (Click "Environment Variables")

   ```env
   # Backend Variables
   NODE_ENV=production
   PORT=5000
   
   # Database (Neon)
   DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
   
   # JWT (Generate a strong random string)
   JWT_SECRET=your_super_long_random_secret_at_least_32_characters
   JWT_EXPIRY=7d
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email (Gmail)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your.email@gmail.com
   SMTP_PASS=your_16_char_app_password
   
   # CORS (Will be your Vercel URL after first deploy)
   CLIENT_URL=https://your-app.vercel.app
   
   # Frontend Variables
   VITE_API_URL=https://your-app.vercel.app/api/v1
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes

6. **Get Your URL**
   - After deployment: `https://sms-xxxx.vercel.app`
   - Or custom domain if configured

### 6. Update Environment Variables (Second Deploy)

After first deployment, you need to update CORS settings:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update these variables with your actual Vercel URL:
   ```
   CLIENT_URL=https://sms-xxxx.vercel.app
   VITE_API_URL=https://sms-xxxx.vercel.app/api/v1
   ```
3. Redeploy: Go to Deployments → Click "..." → Redeploy

### 7. Initialize Database

After deployment, initialize your database:

**Option A: Use Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Run migration
vercel env pull .env.local
cd server
npx prisma db push
npx prisma db seed
```

**Option B: Use Neon SQL Editor**
1. Go to Neon console → SQL Editor
2. Copy schema from `server/prisma/schema.prisma`
3. Manually create tables (not recommended, use Option A)

---

## ✅ Post-Deployment Checklist

### Test Your Application

Visit your Vercel URL and test:

- [ ] **Health Check**: `https://your-app.vercel.app/health`
- [ ] **API Status**: `https://your-app.vercel.app/api/v1`
- [ ] **Frontend Loads**: `https://your-app.vercel.app`
- [ ] **Login Works**: Try logging in
- [ ] **Image Upload**: Test photo upload (Cloudinary)
- [ ] **PDF Generation**: Test certificate/receipt generation
- [ ] **Email Sending**: Test fee reminder email
- [ ] **All CRUD Operations**: Add/Edit/Delete records

### Verify Configuration

```bash
# Check health endpoint
curl https://your-app.vercel.app/health

# Should return:
{
  "status": "ok",
  "timestamp": "2026-05-29T...",
  "uptime": 123,
  "environment": "production",
  "database": "connected"
}
```

---

## 🔧 Troubleshooting

### Issue: "Database connection failed"

**Solution:**
1. Check `DATABASE_URL` format in Vercel env vars
2. Ensure `?sslmode=require` is at the end
3. Verify Neon project is active (not suspended)

### Issue: "CORS error"

**Solution:**
1. Check `CLIENT_URL` matches your Vercel domain exactly
2. No trailing slash in `CLIENT_URL`
3. Redeploy after updating env vars

### Issue: "Cannot find module 'xyz'"

**Solution:**
1. Check dependencies in `server/package.json`
2. Redeploy: Deployments → Redeploy

### Issue: "Function timeout (10s)"

**Solution:**
1. Optimize slow database queries
2. Add indexes to frequently queried fields
3. Use Prisma select to fetch only needed fields

### Issue: "Images not uploading"

**Solution:**
1. Verify Cloudinary credentials
2. Check `CLOUDINARY_CLOUD_NAME` in both client and server env vars
3. Test Cloudinary independently

---

## 📊 Monitoring Your App

### Vercel Dashboard

Check these regularly:
- **Analytics**: Page views, performance
- **Functions**: Backend function logs
- **Logs**: Real-time logs for debugging
- **Speed Insights**: Performance metrics

### Check Health Endpoint

Set up monitoring with:
- [UptimeRobot](https://uptimerobot.com) - Free uptime monitoring
- [Better Uptime](https://betteruptime.com) - Status pages

Monitor URL: `https://your-app.vercel.app/health`

---

## 🚀 Custom Domain (Optional)

### Add Custom Domain

1. **Buy Domain** (Namecheap, Google Domains, etc.)

2. **Add to Vercel**
   - Project Settings → Domains
   - Add domain: `yourdomain.com`

3. **Update DNS**
   - Add A record or CNAME as instructed by Vercel
   - Wait 24-48 hours for propagation

4. **Update Environment Variables**
   ```
   CLIENT_URL=https://yourdomain.com
   VITE_API_URL=https://yourdomain.com/api/v1
   ```

5. **Redeploy**

---

## 💰 Vercel Pricing (As of 2026)

### Free Tier (Hobby)
- ✅ Unlimited projects
- ✅ 100 GB bandwidth/month
- ✅ 100 GB-hours serverless function execution
- ✅ 6,000 build minutes/month
- ✅ SSL certificates
- ✅ Auto scaling
- ✅ Perfect for school projects!

### Pro Tier ($20/month) - Only if needed
- Advanced analytics
- More bandwidth
- Team features
- Priority support

**Your school management system should run fine on free tier!**

---

## 🔄 Update/Redeploy

Every time you push to GitHub, Vercel auto-deploys:

```bash
# Make changes
git add .
git commit -m "Update student module"
git push

# Vercel automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys
# 4. Takes ~2 minutes
```

View deployment progress in Vercel dashboard.

---

## 📝 Environment Variables Quick Reference

### Required for Backend (Production)

| Variable | Example | Where to Get |
|----------|---------|--------------|
| `DATABASE_URL` | `postgresql://...` | Neon console |
| `JWT_SECRET` | Random 32+ chars | Generate online |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud` | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | `123456789` | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | `abc123xyz` | Cloudinary dashboard |
| `SMTP_USER` | `your@gmail.com` | Your Gmail |
| `SMTP_PASS` | 16-char password | Google App Password |
| `CLIENT_URL` | `https://sms.vercel.app` | Your Vercel URL |

### Required for Frontend

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://sms.vercel.app/api/v1` |
| `VITE_CLOUDINARY_CLOUD_NAME` | `your_cloud` |

---

## 🎉 Success!

Your School Management System is now live on Vercel!

- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-app.vercel.app/api/v1`
- **Health Check**: `https://your-app.vercel.app/health`

**Next Steps:**
1. Create admin account
2. Add sample data
3. Train users
4. Share with school!

---

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)

---

**Happy Deploying! 🚀**
