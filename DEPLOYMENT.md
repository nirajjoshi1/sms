# Vercel Deployment

This repo deploys as one Vercel project:

- Frontend: Vite builds to `client/dist`
- Backend: Express is exported from `api/index.js` as a Vercel Function
- API path: frontend calls `/api/v1`, which is routed to the backend function

## Required Environment Variables

Add these in Vercel Project Settings > Environment Variables for Production and Preview:

```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host/dbname?sslmode=require
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRY=7d
CLIENT_URL=https://your-vercel-app.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

Do not set `VITE_API_URL` in Vercel unless the backend is hosted somewhere else. Leaving it unset makes the frontend use `/api/v1` on the same domain.

## Vercel Settings

When importing from GitHub, keep the project root as the repository root.

Use these settings if Vercel asks:

```text
Framework Preset: Other
Build Command: npm run vercel-build
Output Directory: client/dist
Install Command: npm install
```

## Deploy Steps

1. Push this repo to GitHub.
2. Open Vercel and import the GitHub repository.
3. Set the project root to the repository root.
4. Add the environment variables listed above.
5. Deploy.
6. After deployment, open `https://your-vercel-app.vercel.app/api/v1`.
7. If the API works, update `CLIENT_URL` to the exact Vercel domain and redeploy.

## Database Setup

Use a hosted PostgreSQL database such as Neon, Supabase, Railway, or Vercel Postgres.

After setting `DATABASE_URL`, run this locally against the production database only when you are ready:

```bash
cd server
npm run db:push
npm run db:seed
```

## Local Checks

```bash
npm run vercel-build
```

For a closer local Vercel test:

```bash
npm i -g vercel
vercel dev
```
