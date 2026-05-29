# Deploy Fix for https://sms-by-delta.vercel.app

## Issues Found
1. ❌ FUNCTION_INVOCATION_FAILED - Serverless function crashing
2. ❌ Missing Prisma client generation in build process
3. ❌ Incorrect Vercel build configuration

## Fixes Applied

### 1. Fixed `vercel.json` 
Changed from simple rewrites to proper builds configuration with:
- `@vercel/node` for API serverless function
- `@vercel/static-build` for client
- Included server files in the API build

### 2. Added Prisma Client Generation
Added `"postinstall": "prisma generate"` to `server/package.json` so Prisma client is generated after `npm install`

### 3. Fixed Route Configuration
Changed routes to properly map `/api/*` to the serverless function

## Deploy Steps

### Step 1: Commit Changes
```bash
cd /c/Users/Hp\ laptop/OneDrive/Desktop/school-management-system

git add .
git commit -m "Fix: Vercel serverless function configuration and Prisma generation"
git push
```

### Step 2: Check Environment Variables in Vercel Dashboard

Go to: https://vercel.com/dashboard → sms-by-delta → Settings → Environment Variables

**Required variables:**
```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=https://sms-by-delta.vercel.app
NODE_ENV=production
```

⚠️ **Critical**: If `DATABASE_URL` or `JWT_SECRET` is missing, the function will crash!

### Step 3: Trigger Redeploy

Option A - Auto (if you pushed to main):
- Vercel will auto-deploy from Git

Option B - Manual:
```bash
vercel --prod
```

### Step 4: Wait for Build

Monitor at: https://vercel.com/dashboard

Build should:
1. ✅ Install server dependencies
2. ✅ Run `postinstall` → `prisma generate`
3. ✅ Build client
4. ✅ Create serverless function for API

### Step 5: Test Deployment

```bash
# Test health (should work now)
curl https://sms-by-delta.vercel.app/health

# Test API base
curl https://sms-by-delta.vercel.app/api/v1

# Test login (should return proper error, not FUNCTION_INVOCATION_FAILED)
curl -X POST https://sms-by-delta.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"test123"}'
```

**Expected Results:**
- ✅ `/health` → `{"status":"ok",...}`
- ✅ `/api/v1` → `{"success":true,"message":"School Management System API v1",...}`
- ✅ `/api/v1/auth/login` → `{"success":false,"message":"Invalid credentials"}` (proper auth error, NOT "Route not found")

## If It Still Fails

### 1. Check Vercel Function Logs
```bash
vercel logs https://sms-by-delta.vercel.app --follow
```

Or go to: https://vercel.com/dashboard → sms-by-delta → Deployments → Latest → Functions → View Logs

### 2. Common Issues

**Issue: "Cannot find module '@prisma/client'"**
```bash
# Fix: Make sure postinstall runs
# Check vercel.com build logs for "prisma generate" output
```

**Issue: "PrismaClientInitializationError"**
```bash
# Fix: DATABASE_URL is wrong or database is unreachable
# Verify DATABASE_URL in Vercel env vars
# Test connection: psql "your-database-url"
```

**Issue: "JWT_SECRET is not defined"**
```bash
# Fix: Add JWT_SECRET in Vercel env vars
# Must be set for ALL environments (Production, Preview, Development)
```

### 3. Force Clean Redeploy

If cached build is causing issues:
```bash
# Delete .vercel cache
rm -rf .vercel

# Redeploy
vercel --prod --force
```

### 4. Check Build Output

Go to Vercel Dashboard → Your Deployment → Build Logs

Look for:
- ✅ "Installing dependencies" for server
- ✅ "Running postinstall script"
- ✅ "prisma generate"
- ✅ "Build completed"

If you see ❌ errors in any of these steps, that's your problem.

## Database Setup

If you haven't set up a database yet:

### Option 1: Neon (Recommended - Free tier)
1. Go to https://neon.tech
2. Create account and new project
3. Copy connection string
4. Add to Vercel: `DATABASE_URL=postgresql://...`
5. Run migrations:
   ```bash
   cd server
   DATABASE_URL="your-neon-url" npx prisma db push
   ```

### Option 2: Supabase
1. Go to https://supabase.com
2. Create project → Get connection string
3. Add to Vercel env vars
4. Run migrations

### Option 3: Railway
1. Go to https://railway.app
2. New Project → Add PostgreSQL
3. Copy DATABASE_URL
4. Add to Vercel

## Success Checklist

After deployment, verify:

- [ ] `/health` returns 200 OK
- [ ] `/api/v1` returns API info
- [ ] Frontend loads at https://sms-by-delta.vercel.app
- [ ] Login page is accessible
- [ ] Login endpoint responds (even if credentials wrong, should NOT be "Route not found")
- [ ] No "FUNCTION_INVOCATION_FAILED" errors

## Need Help?

1. Check Function Logs: `vercel logs https://sms-by-delta.vercel.app`
2. Check Build Logs: Vercel Dashboard → Deployments → Latest
3. Verify Environment Variables: Vercel Dashboard → Settings → Environment Variables
4. Test Database Connection: Use `psql` or database client with your DATABASE_URL

## Quick Debug Command

```bash
# Run all tests
curl -s https://sms-by-delta.vercel.app/health && echo " ✓ Health OK" || echo " ✗ Health FAIL"
curl -s https://sms-by-delta.vercel.app/api/v1 && echo " ✓ API OK" || echo " ✗ API FAIL"
curl -s -X POST https://sms-by-delta.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}' | grep -q "success" && echo " ✓ Login endpoint OK" || echo " ✗ Login endpoint FAIL"
```
