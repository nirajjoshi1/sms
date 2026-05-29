# ⚠️ SERVER RESTART REQUIRED

## Issue
You're getting the error: `Cannot read properties of undefined (reading 'findFirst')`

## Cause
The Prisma client was regenerated with new models (GeneralSetting, NotificationSetting, etc.), but the **server hasn't been restarted** to load the new client.

## ✅ Solution

### Step 1: Stop the Running Server
If your server is running, stop it:
- Press `Ctrl + C` in the terminal where the server is running
- Or close the terminal

### Step 2: Start the Server Again

```bash
# Navigate to server directory
cd server

# Start the server
npm start
# OR
node server.js
# OR
nodemon server.js
```

### Step 3: Test the Settings API

Once the server restarts, test any settings endpoint:

```bash
# Test General Settings
curl http://localhost:5000/api/v1/settings/general

# Or open in browser (if logged in)
http://localhost:5000/api/v1/settings/general
```

## What Happened

1. ✅ We added 7 new Prisma models to the schema
2. ✅ We pushed the schema to the database (`npx prisma db push`)
3. ✅ We regenerated the Prisma client (`npx prisma generate`)
4. ❌ The **server is still using the OLD Prisma client** from memory

## Why Restart is Needed

Node.js caches `require()` imports. When you:
```javascript
const prisma = require('./src/config/prisma');
```

The server loads the Prisma client **once** and keeps it in memory. After regenerating the client, the server needs to restart to load the new version.

## Verification

After restarting, you can verify the models are available by checking in the server logs or testing the API endpoints:

### Available Settings Endpoints:

1. **General Settings**
   - GET  `/api/v1/settings/general`
   - PUT  `/api/v1/settings/general`

2. **Sessions**
   - GET  `/api/v1/settings/sessions`
   - POST `/api/v1/settings/sessions`
   - PUT  `/api/v1/settings/sessions/:id`
   - DELETE `/api/v1/settings/sessions/:id`

3. **Notifications**
   - GET `/api/v1/settings/notifications`
   - PUT `/api/v1/settings/notifications`

4. **SMS**
   - GET `/api/v1/settings/sms`
   - PUT `/api/v1/settings/sms`
   - POST `/api/v1/settings/sms/test`

5. **Email**
   - GET `/api/v1/settings/email`
   - PUT `/api/v1/settings/email`
   - POST `/api/v1/settings/email/test`

6. **Payment**
   - GET `/api/v1/settings/payment`
   - PUT `/api/v1/settings/payment`

7. **Print**
   - GET `/api/v1/settings/print`
   - PUT `/api/v1/settings/print`

8. **Backups**
   - GET `/api/v1/settings/backups`
   - POST `/api/v1/settings/backups`
   - DELETE `/api/v1/settings/backups/:id`
   - GET `/api/v1/settings/backups/:id/download`
   - POST `/api/v1/settings/backups/:id/restore`

## Still Having Issues?

If restarting doesn't work, run these commands:

```bash
cd server

# Clean node_modules and regenerate
rm -rf node_modules/.prisma
npm install

# Regenerate Prisma client
npx prisma generate

# Restart server
npm start
```

---

**Status:** ✅ All settings pages and APIs are complete
**Action Needed:** 🔄 Restart your server!
