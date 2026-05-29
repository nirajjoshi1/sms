# Vercel Deployment Fix for "Route not found" Error

## Problem
Getting `{"success": false, "message": "Route not found", "path": "/api/v1/auth/login"}` in production.

## Root Cause
The issue is with how Vercel handles serverless functions and route rewrites. The Express app expects routes at `/api/v1/*` but Vercel's rewrite configuration wasn't properly mapping the requests.

## Solution Applied

### 1. Fixed `vercel.json` Configuration
Changed the rewrite pattern from `/api/v1/(.*)` to `/api/:path*` which catches ALL `/api/*` routes including nested paths like `/api/v1/auth/login`.

**Key change:**
```json
{
  "source": "/api/:path*",
  "destination": "/api/index"
}
```

### 2. Verified Serverless Function Structure
- The `/api/index.js` correctly exports the Express app
- Express routes are mounted at `/api/v1/auth`, `/api/v1/students`, etc.
- Vercel rewrites ALL `/api/*` requests to the serverless function

### 3. Added Debug Endpoint
Added `/api/v1/debug` endpoint in `server/app.js` to diagnose routing issues in production.

## Deployment Checklist

Before deploying to Vercel, ensure:

### ✅ Environment Variables (Critical!)
Set these in Vercel dashboard (Settings → Environment Variables):

```bash
# Database
DATABASE_URL="your-postgres-connection-string"

# JWT
JWT_SECRET="your-secret-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (if using)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# CORS
CLIENT_URL="https://your-vercel-app.vercel.app"

# Environment
NODE_ENV="production"
```

### ✅ Build Settings in Vercel
- **Framework Preset**: Other
- **Build Command**: `cd client && npm install && npm run build`
- **Output Directory**: `client/dist`
- **Install Command**: `npm install --prefix server --legacy-peer-deps`

### ✅ File Structure
```
project-root/
├── api/
│   └── index.js          # Serverless function entry
├── server/
│   ├── app.js            # Express app
│   ├── server.js         # Local dev server
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Controllers
│   │   └── middleware/   # Middleware
│   └── package.json
├── client/
│   ├── dist/             # Built frontend (generated)
│   └── package.json
└── vercel.json           # Vercel configuration
```

## Testing After Deployment

### 1. Test Health Endpoint
```bash
curl https://your-app.vercel.app/health
```
Expected: `{"status":"ok","timestamp":"...","uptime":...}`

### 2. Test API Base
```bash
curl https://your-app.vercel.app/api/v1
```
Expected: `{"success":true,"message":"School Management System API v1",...}`

### 3. Test Debug Endpoint
```bash
curl https://your-app.vercel.app/api/v1/debug
```
Expected: `{"url":"/api/v1/debug","originalUrl":"/api/v1/debug",...}`

### 4. Test Login Endpoint
```bash
curl -X POST https://your-app.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

## Common Issues & Fixes

### Issue: "Route not found"
**Cause**: Vercel rewrite not matching the request path
**Fix**: Ensure `vercel.json` has `/api/:path*` pattern (not `/api/v1/(.*)`)

### Issue: "Internal Server Error"
**Cause**: Missing environment variables or database connection failure
**Fix**: 
1. Check Vercel logs: `vercel logs your-deployment-url`
2. Verify all environment variables are set in Vercel dashboard
3. Ensure `DATABASE_URL` is accessible from Vercel's region

### Issue: CORS errors
**Cause**: `CLIENT_URL` environment variable not set correctly
**Fix**: Set `CLIENT_URL=https://your-vercel-app.vercel.app` in Vercel env vars

### Issue: Rate limiting blocks all requests
**Cause**: Vercel's IP forwarding not configured
**Fix**: Ensure `app.set("trust proxy", 1)` is in `server/app.js` (already added)

## Database Setup for Production

If using a managed Postgres (like Neon, Supabase, or Railway):

1. **Get connection string** from your database provider
2. **Set in Vercel**: `DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"`
3. **Run migrations**: 
   ```bash
   cd server
   npx prisma db push
   ```
4. **Seed database** (if needed):
   ```bash
   npm run db:seed
   ```

## Monitoring

### View Deployment Logs
```bash
vercel logs --follow
```

### Check Function Errors
Go to Vercel Dashboard → Your Project → Functions → View Logs

### Monitor Performance
Vercel Dashboard → Analytics → Function Performance

## Rollback (if needed)

```bash
vercel rollback your-deployment-url
```

## Local Testing Before Deploy

Test the production build locally:

```bash
# Build client
cd client && npm run build

# Start server in production mode
cd ../server && NODE_ENV=production npm start
```

Then test endpoints:
- http://localhost:5000/health
- http://localhost:5000/api/v1
- http://localhost:5000/api/v1/auth/login

## Support

If issues persist:
1. Check Vercel deployment logs
2. Test the `/api/v1/debug` endpoint to see request details
3. Verify environment variables are set correctly
4. Ensure database is accessible from Vercel's network
