# 🚀 Deployment Guide - School Management System

This guide covers deploying the School Management System to production using free-tier services.

## 📋 Prerequisites

Before deployment, ensure you have:
- [ ] Git repository set up
- [ ] All code committed and pushed
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] Cloudinary account created

---

## 1️⃣ Database Deployment (Neon PostgreSQL)

### Setup Neon Database

1. **Create Account**
   - Go to [console.neon.tech](https://console.neon.tech)
   - Sign up with GitHub/Google

2. **Create Project**
   - Click "New Project"
   - Name: `school-management-db`
   - Region: Choose closest to your users
   - Postgres Version: Latest (16+)

3. **Get Connection String**
   ```
   postgresql://username:password@ep-xxxxx.region.neon.tech/dbname?sslmode=require
   ```
   - Copy this - you'll need it for the backend

4. **Push Database Schema**
   ```bash
   cd server
   # Set DATABASE_URL in .env first
   npm run db:push
   ```

5. **Seed Initial Data** (optional)
   ```bash
   npm run db:seed
   ```

### Production Tips
- Enable connection pooling in Neon dashboard
- Set up automated backups (Settings → Backups)
- Monitor query performance in Neon console

---

## 2️⃣ Backend Deployment (Railway / Render)

### Option A: Railway (Recommended)

1. **Create Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select `server` as root directory

3. **Configure Environment Variables**
   - Go to project → Variables
   - Add all variables from `server/.env.example`:
   ```
   PORT=5000
   NODE_ENV=production
   DATABASE_URL=<your_neon_connection_string>
   JWT_SECRET=<generate_strong_random_string>
   JWT_EXPIRY=7d
   CLOUDINARY_CLOUD_NAME=<your_cloudinary_name>
   CLOUDINARY_API_KEY=<your_key>
   CLOUDINARY_API_SECRET=<your_secret>
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<your_email>
   SMTP_PASS=<your_app_password>
   CLIENT_URL=<your_vercel_url>
   ```

4. **Configure Build Settings**
   - Root Directory: `/server`
   - Install Command: `npm install`
   - Build Command: `npm run db:push` (optional)
   - Start Command: `npm start`

5. **Deploy**
   - Railway auto-deploys on git push
   - Get your backend URL: `https://your-app.railway.app`

### Option B: Render

1. **Create Account** at [render.com](https://render.com)

2. **Create Web Service**
   - New → Web Service
   - Connect GitHub repository
   - Name: `school-management-api`
   - Root Directory: `server`
   - Environment: Node
   - Build Command: `npm install && npm run db:push`
   - Start Command: `npm start`

3. **Add Environment Variables** (same as Railway)

4. **Deploy** - Auto-deploys on git push

---

## 3️⃣ Frontend Deployment (Vercel)

### Setup Vercel

1. **Create Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Framework Preset: Vite
   - Root Directory: `client`

3. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment Variables**
   - Add variables from `client/.env.example`:
   ```
   VITE_API_URL=https://your-backend.railway.app/api/v1
   VITE_CLOUDINARY_CLOUD_NAME=<your_cloudinary_name>
   ```

5. **Deploy**
   - Click "Deploy"
   - Get your URL: `https://your-app.vercel.app`

6. **Update Backend CORS**
   - Go back to Railway/Render
   - Update `CLIENT_URL` env variable with your Vercel URL
   - Redeploy backend

---

## 4️⃣ Cloudinary Setup (Image Storage)

1. **Create Account** at [cloudinary.com](https://cloudinary.com)

2. **Get Credentials**
   - Go to Dashboard
   - Copy:
     - Cloud Name
     - API Key
     - API Secret

3. **Configure Upload Presets** (Optional)
   - Settings → Upload
   - Create unsigned preset for direct client uploads
   - Set folder: `school-management`

4. **Set Transformation Defaults**
   - Settings → Upload
   - Auto-format: Enabled
   - Auto-quality: Enabled

---

## 5️⃣ Email Setup (Gmail SMTP)

1. **Enable 2-Factor Authentication**
   - Go to [myaccount.google.com](https://myaccount.google.com)
   - Security → 2-Step Verification → Turn On

2. **Generate App Password**
   - Security → App passwords
   - Select app: Mail
   - Select device: Other (Custom name)
   - Name: "School Management System"
   - Copy the 16-character password

3. **Update Backend ENV**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your.email@gmail.com
   SMTP_PASS=<16_char_app_password>
   ```

---

## 6️⃣ Post-Deployment Checklist

### Test All Features
- [ ] User login/logout
- [ ] Student admission
- [ ] Fee collection
- [ ] File uploads (images)
- [ ] PDF generation
- [ ] Email sending
- [ ] All API endpoints

### Security Checks
- [ ] HTTPS enabled (should be automatic)
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] JWT secret is strong and unique
- [ ] Database credentials secure
- [ ] No `.env` files committed

### Performance
- [ ] Check page load speed
- [ ] Test with multiple users
- [ ] Monitor database queries
- [ ] Check Cloudinary usage

### Monitoring
- [ ] Set up error tracking (optional: Sentry)
- [ ] Enable Railway/Render monitoring
- [ ] Check Neon database metrics
- [ ] Set up uptime monitoring (optional: UptimeRobot)

---

## 7️⃣ Domain Setup (Optional)

### Connect Custom Domain to Vercel

1. **Purchase Domain** (Namecheap, Google Domains, etc.)

2. **Add to Vercel**
   - Project Settings → Domains
   - Add your domain: `yourdomain.com`

3. **Update DNS Records**
   - Point A record to Vercel IP
   - Or add CNAME: `cname.vercel-dns.com`

4. **Update Backend**
   - Add custom domain to `CLIENT_URL` in backend ENV
   - Redeploy backend

---

## 8️⃣ Continuous Deployment

### Auto-Deploy on Git Push

Both Vercel and Railway auto-deploy when you push to main/master:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Deployments happen automatically!

### Branch Deployments
- Every git branch gets a preview URL
- Test before merging to main

---

## 9️⃣ Rollback Strategy

### Vercel
- Go to Deployments
- Find previous working deployment
- Click "Promote to Production"

### Railway/Render
- Go to Deployments
- Select previous deployment
- Click "Redeploy"

### Database
- Neon has automated backups
- Restore from Settings → Backups

---

## 🔟 Troubleshooting

### Common Issues

**1. CORS Error**
```
Solution: Check CLIENT_URL matches your Vercel domain exactly
Update backend ENV and redeploy
```

**2. Database Connection Failed**
```
Solution: Check DATABASE_URL format
Ensure ?sslmode=require is at the end
Verify Neon project is not suspended
```

**3. Images Not Uploading**
```
Solution: Verify Cloudinary credentials
Check upload preset configuration
Ensure CLOUDINARY_CLOUD_NAME is set on client
```

**4. Emails Not Sending**
```
Solution: Use Gmail App Password (not regular password)
Check 2FA is enabled
Verify SMTP_USER and SMTP_PASS are correct
```

**5. 502 Bad Gateway**
```
Solution: Check backend logs in Railway/Render
Verify start command is correct
Ensure all dependencies installed
```

---

## 📊 Cost Breakdown (Free Tier Limits)

| Service | Free Tier | Paid Plans Start At |
|---------|-----------|---------------------|
| **Neon** | 10 GB storage, 300 hours compute/month | $19/month |
| **Railway** | $5 credit/month (~500 hours) | Pay as you go |
| **Render** | 750 hours/month | $7/month |
| **Vercel** | Unlimited bandwidth, 100 GB/month | $20/month |
| **Cloudinary** | 25 GB storage, 25 GB bandwidth | $0.18/GB |

**Total Cost to Start: $0/month** ✅

---

## 🔒 Security Best Practices

1. **Never commit `.env` files**
2. **Use strong JWT secrets** (at least 32 random characters)
3. **Enable HTTPS** (automatic on Vercel/Railway/Render)
4. **Rate limit auth endpoints** (already configured)
5. **Validate all inputs** (middleware in place)
6. **Sanitize user data** (validation middleware added)
7. **Use httpOnly cookies** for JWT (configured)
8. **Regular dependency updates** (`npm audit fix`)

---

## 📱 Mobile Responsiveness

Before going live:
- Test on real mobile devices
- Check tablet view
- Verify sidebar collapse works
- Test all forms on mobile

---

## 🎯 Go Live Checklist

- [ ] All features tested in production
- [ ] Custom domain connected (optional)
- [ ] SSL certificate active
- [ ] Admin account created
- [ ] Sample data loaded
- [ ] Error tracking configured
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team trained on system

---

## 🆘 Support Resources

- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Cloudinary Docs**: [cloudinary.com/documentation](https://cloudinary.com/documentation)

---

## 🔄 Update Deployment

To update your production app:

```bash
# 1. Make changes locally
git add .
git commit -m "Your changes"

# 2. Push to GitHub
git push origin main

# 3. Auto-deploys in ~2 minutes
# Check deployment status in Vercel/Railway dashboards
```

---

**🎉 Congratulations! Your School Management System is now live!**

Access your app at: `https://your-app.vercel.app`
