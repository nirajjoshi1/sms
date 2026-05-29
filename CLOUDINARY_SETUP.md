# 📸 Cloudinary Setup Guide

## What is Cloudinary?
Cloudinary is a cloud service that allows you to upload, store, manage, and deliver images and videos. We use it to store:
- Student photos
- Birth certificates
- Staff photos
- ID card images
- Any other media files

## Why Cloudinary?
- ✅ **Free Plan**: 25 GB storage + 25 GB bandwidth per month
- ✅ **Fast**: Global CDN for quick image delivery
- ✅ **Automatic Optimization**: Images are automatically compressed
- ✅ **Secure**: Files stored securely in the cloud
- ✅ **Easy Integration**: Works seamlessly with Node.js

---

## 🚀 Step-by-Step Setup

### Step 1: Create Free Account

1. Go to **https://cloudinary.com/**
2. Click **"Sign Up for Free"**
3. Fill in the form:
   ```
   Email: your-email@example.com
   Password: YourSecurePassword123
   Role: Developer
   ```
4. Click **"Create Account"**
5. Check your email and verify your account

---

### Step 2: Get Your Credentials

1. After login, you'll land on the **Dashboard**
2. You'll see a section called **"Account Details"** or **"Product Environment Credentials"**
3. Copy these three values:

   ```
   Cloud Name: abc123xyz (example)
   API Key: 123456789012345 (example)
   API Secret: AbCdEfGhIjKlMnOpQrStUvWx (example)
   ```

**Screenshot Reference:**
```
┌─────────────────────────────────────────┐
│  Product Environment Credentials        │
├─────────────────────────────────────────┤
│  Cloud name:    abc123xyz               │
│  API Key:       123456789012345         │
│  API Secret:    ••••••••••••••••        │  ← Click eye icon to reveal
└─────────────────────────────────────────┘
```

---

### Step 3: Add Credentials to .env File

1. Open your project folder: `school-management-system/server`
2. Open the `.env` file
3. Replace the placeholder values with your actual Cloudinary credentials:

   ```env
   # Replace these with your actual values from Cloudinary Dashboard
   CLOUDINARY_CLOUD_NAME=abc123xyz
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWx
   ```

4. **Save the file** (Ctrl+S or Cmd+S)

---

### Step 4: Restart Your Server

After adding the credentials, restart your backend server:

```bash
# Stop the current server (Ctrl+C in terminal)

# Start again
cd server
npm start
```

---

### Step 5: Test Upload

1. Run both frontend and backend:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

2. Go to **Student Admission** page
3. Upload a student photo and birth certificate
4. Submit the form
5. If successful, you'll see the images stored in Cloudinary!

---

## 🔍 How to Verify It's Working

### Method 1: Check Cloudinary Dashboard
1. Go to https://console.cloudinary.com/
2. Click **"Media Library"** in the left sidebar
3. You should see a folder called **"gradex-sms"**
4. Inside, you'll find uploaded images

### Method 2: Check Student Profile
1. After admitting a student with photo
2. Go to the student's profile page
3. The photo should display correctly
4. If you see the image → Upload is working! ✅

---

## 📁 Folder Structure in Cloudinary

All files are uploaded to: **gradex-sms/**

```
gradex-sms/
├── student_photo_1.jpg
├── birth_certificate_1.pdf
├── student_photo_2.jpg
├── birth_certificate_2.jpg
└── ...
```

---

## ⚙️ Current Configuration

### File Types Supported:
- **Images**: JPG, PNG, JPEG, WEBP
- **Documents**: PDF (for birth certificates)

### File Size Limits:
- **Max size**: 5 MB per file
- **Images**: Automatically resized to max 500x500px for optimization

### Security:
- All uploads require JWT authentication
- Only authorized roles can upload (SUPER_ADMIN, ADMIN, RECEPTIONIST)

---

## ❓ Troubleshooting

### Problem 1: "Invalid API credentials"
**Solution:**
- Double-check your `.env` file
- Make sure there are no extra spaces
- Verify credentials from Cloudinary dashboard
- Restart your server after changing `.env`

### Problem 2: Upload fails silently
**Solution:**
- Check browser console for errors (F12)
- Check server terminal for error messages
- Verify internet connection
- Check if Cloudinary account is active

### Problem 3: Images not displaying
**Solution:**
- Open the image URL directly in browser
- Check if Cloudinary storage limit is reached (25GB free)
- Verify the URL format is correct

---

## 🎯 Free Plan Limits

✅ **Storage**: 25 GB
✅ **Bandwidth**: 25 GB per month
✅ **Transformations**: 25,000 per month
✅ **API Requests**: Unlimited

**For a school with 500 students:**
- Average photo: ~500 KB
- Total storage needed: ~250 MB
- Well within free limits! 🎉

---

## 🔐 Security Best Practices

1. ❌ **NEVER** commit `.env` file to Git
2. ✅ Keep API Secret confidential
3. ✅ Use environment variables for all sensitive data
4. ✅ Enable 2FA on Cloudinary account
5. ✅ Regularly review uploaded files in Media Library

---

## 📞 Need Help?

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Support**: https://support.cloudinary.com/
- **Community**: https://community.cloudinary.com/

---

## ✅ Checklist

- [ ] Created Cloudinary account
- [ ] Verified email
- [ ] Copied Cloud Name from dashboard
- [ ] Copied API Key from dashboard
- [ ] Copied API Secret from dashboard
- [ ] Updated `.env` file with all three values
- [ ] Restarted backend server
- [ ] Tested upload on Student Admission page
- [ ] Verified images appear in Cloudinary Media Library
- [ ] Confirmed images display on Student Profile page

**Once all checkboxes are ticked, your Cloudinary setup is complete!** 🎉
