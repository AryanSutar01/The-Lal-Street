# CORS Fix for New Deployment Pair

## Problem
The new deployment pair is experiencing CORS errors:
- **Client**: `https://the-lal-street-website-client.vercel.app`
- **Server**: `https://the-lal-street-website.onrender.com`
- **Error**: `No 'Access-Control-Allow-Origin' header is present`

## Root Cause
The Render server's `ALLOWED_ORIGINS` environment variable doesn't include the new client URL.

## Solution

### Step 1: Fix Server CORS Configuration (Render)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Navigate to your service**: `the-lal-street-website` (or your server service name)
3. **Go to Environment tab**
4. **Add/Update `ALLOWED_ORIGINS` variable**:
   ```
   ALLOWED_ORIGINS=https://the-lal-street-website-client.vercel.app,http://localhost:5173,http://localhost:3000
   ```
   
   **Note**: If you have multiple client deployments, add them all separated by commas:
   ```
   ALLOWED_ORIGINS=https://the-lal-street-website-client.vercel.app,https://the-lal-street.vercel.app,http://localhost:5173,http://localhost:3000
   ```

5. **Save the environment variable**
6. **Redeploy the service** (Render will auto-redeploy when env vars change, or manually trigger a redeploy)

### Step 2: Verify Client Configuration (Vercel)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Navigate to your project**: `the-lal-street-website-client`
3. **Go to Settings → Environment Variables**
4. **Verify `VITE_API_URL` is set to**:
   ```
   https://the-lal-street-website.onrender.com/api
   ```
   Or just:
   ```
   https://the-lal-street-website.onrender.com
   ```
5. **Redeploy the client** if you made changes

### Step 3: Test the Fix

1. Open the client: `https://the-lal-street-website-client.vercel.app`
2. Check browser console - CORS errors should be gone
3. Test API calls:
   - Search for funds
   - Load suggested buckets
   - Use calculators

## For Multiple Deployment Pairs

If you have **4 deployments** (2 pairs), you need to:

### Pair 1 (Old - Working):
- Server: `the-lal-street-1.onrender.com`
- Client: `the-lal-street.vercel.app`
- Server `ALLOWED_ORIGINS`: `https://the-lal-street.vercel.app,http://localhost:5173`

### Pair 2 (New - Fixing):
- Server: `the-lal-street-website.onrender.com`
- Client: `the-lal-street-website-client.vercel.app`
- Server `ALLOWED_ORIGINS`: `https://the-lal-street-website-client.vercel.app,http://localhost:5173`

**OR** if you want both servers to accept both clients:
- Server 1 `ALLOWED_ORIGINS`: `https://the-lal-street.vercel.app,https://the-lal-street-website-client.vercel.app,http://localhost:5173`
- Server 2 `ALLOWED_ORIGINS`: `https://the-lal-street.vercel.app,https://the-lal-street-website-client.vercel.app,http://localhost:5173`

## Troubleshooting

### Still getting CORS errors?
1. **Check server logs** in Render dashboard - you should see: `CORS blocked origin: <origin>`
2. **Verify the exact URL** - Make sure there's no trailing slash mismatch
3. **Check for typos** in the environment variable
4. **Clear browser cache** and hard refresh (Ctrl+Shift+R)

### Getting 500 Internal Server Error?
- This might be a separate issue, but CORS errors can sometimes mask the real error
- Check Render server logs for actual error messages
- Verify the server is running and healthy: `https://the-lal-street-website.onrender.com/api/health`

## Quick Reference

**Environment Variables Needed:**

**Render (Server):**
```env
ALLOWED_ORIGINS=https://the-lal-street-website-client.vercel.app,http://localhost:5173
NODE_ENV=production
PORT=5000
```

**Vercel (Client):**
```env
VITE_API_URL=https://the-lal-street-website.onrender.com/api
```


