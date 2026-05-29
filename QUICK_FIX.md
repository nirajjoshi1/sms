# Quick Fix for "Route not found" Error

## What Changed

### 1. `vercel.json` - Fixed rewrite pattern
```json
{
  "source": "/api/:path*",       // ✅ NEW: Catches all /api/* routes
  "destination": "/api/index"    // Routes to serverless function
}
```

**Before:** `/api/v1/(.*)` ❌ (wasn't matching nested paths correctly)  
**After:** `/api/:path*` ✅ (matches all API routes including `/api/v1/auth/login`)

### 2. Added Debug Endpoint
Added `/api/v1/debug` in `server/app.js` to diagnose routing issues

### 3. Created `.vercelignore`
Excludes unnecessary files from deployment

## Deploy to Vercel

```bash
# 1. Make sure you're in the project root
cd /c/Users/Hp\ laptop/OneDrive/Desktop/school-management-system

# 2. Commit changes
git add .
git commit -m "Fix: Correct Vercel routing for API endpoints"

# 3. Push to trigger deployment (if auto-deploy is on)
git push

# OR deploy manually
vercel --prod
```

## Set Environment Variables in Vercel

**Critical** - Your app won't work without these:

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=https://your-app.vercel.app
NODE_ENV=production
```

Set these in: **Vercel Dashboard → Your Project → Settings → Environment Variables**

## Test After Deployment

```bash
# Test health
curl https://your-app.vercel.app/health

# Test API base
curl https://your-app.vercel.app/api/v1

# Test debug (shows routing info)
curl https://your-app.vercel.app/api/v1/debug

# Test login (should return proper error, not "Route not found")
curl -X POST https://your-app.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

## If Still Getting "Route not found"

1. **Check Vercel logs**: 
   ```bash
   vercel logs --follow
   ```

2. **Verify the rewrite is active**:
   - Go to Vercel Dashboard → Your Project → Settings → Rewrites
   - Should see `/api/:path*` → `/api/index`

3. **Check environment variables**:
   - Vercel Dashboard → Settings → Environment Variables
   - Make sure `DATABASE_URL` and `JWT_SECRET` are set

4. **Redeploy**:
   ```bash
   vercel --prod --force
   ```

## Success Criteria

✅ `/health` returns `{"status":"ok",...}`  
✅ `/api/v1` returns `{"success":true,"message":"School Management System API v1",...}`  
✅ `/api/v1/auth/login` returns auth error (not "Route not found")  
✅ Frontend loads and can communicate with backend

## Need More Help?

See `VERCEL_DEPLOYMENT_FIX.md` for detailed troubleshooting.
