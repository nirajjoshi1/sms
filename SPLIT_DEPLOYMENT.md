# Split Deployment Guide

Deploy the backend and frontend as two separate services.

## Backend

Deploy `server/` as a Node.js web service. Render or Railway are the easiest choices.

### Render Settings

```text
Root Directory: server
Runtime: Node
Build Command: npm install --include=dev && npm prune --omit=dev
Start Command: npm start
```

### Backend Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host/dbname?sslmode=require
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRY=7d
CLIENT_URL=https://your-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

After the backend deploys, test:

```text
https://your-backend.onrender.com/api/v1
```

## Database

Use a hosted PostgreSQL database such as Neon, Supabase, Railway, or Render PostgreSQL.

After setting `DATABASE_URL`, push the schema from your local machine:

```bash
cd server
npm run db:push
npm run db:seed
```

## Frontend

Deploy `client/` to Vercel as a separate project.

### Vercel Settings

```text
Root Directory: client
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Frontend Environment Variables

Set this in the Vercel frontend project:

```env
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

Do not use `localhost` in Vercel environment variables.

## Final Check

1. Open the frontend URL.
2. Open browser DevTools > Network.
3. Try logging in.
4. The login request must go to:

```text
https://your-backend.onrender.com/api/v1/auth/login
```

5. It must not go to:

```text
http://localhost:5000/api/v1/auth/login
```
