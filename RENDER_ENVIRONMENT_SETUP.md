# Render Environment Variables Setup

## Required Environment Variables

To fix the "Admin authentication not configured" error, you need to add the `ADMIN_PASSWORD` environment variable on Render.

### Steps to Add Environment Variable on Render:

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign in to your account

2. **Select Your Backend Service**
   - Click on your backend service (e.g., "lal-street-api" or "the-lal-street-1")

3. **Go to Environment Tab**
   - Click on the "Environment" tab in the left sidebar

4. **Add ADMIN_PASSWORD**
   - Click "Add Environment Variable"
   - **Key**: `ADMIN_PASSWORD`
   - **Value**: Your desired admin password (e.g., `mySecurePassword123`)
   - Click "Save Changes"

5. **Service Will Auto-Redeploy**
   - Render will automatically redeploy your service (~30 seconds)
   - Wait for deployment to complete

6. **Verify It Works**
   - Try accessing the admin panel again
   - The error should be gone!

### Complete Environment Variables List:

For your Render backend service, you should have:

```
NODE_ENV=production
PORT=5000
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
ADMIN_PASSWORD=your_secure_password_here
```

### Important Notes:

- ⚠️ **Never commit passwords to git** - Always set them in Render dashboard
- 🔒 Use a strong password for `ADMIN_PASSWORD`
- 📝 The password must match what you use when logging into the admin panel on the frontend

### Troubleshooting:

**Error: "Admin authentication not configured"**
- ✅ Solution: Add `ADMIN_PASSWORD` environment variable on Render (see steps above)

**Error: "Unauthorized: Invalid admin token"**
- ✅ Solution: Make sure the password you're using to login matches the `ADMIN_PASSWORD` on Render

