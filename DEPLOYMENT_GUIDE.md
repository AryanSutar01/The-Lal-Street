# Vercel Deployment Guide - The Lal Street

## 📋 Pre-Deployment Checklist

✅ **Completed:**
- Vercel serverless functions created in `/api` folder
- Frontend configured with proper API endpoints
- `vercel.json` optimized for monorepo
- Client dependencies installed

## 🚀 Deployment Steps

### 1. **Connect to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your GitHub repository: `The-Lal-Street`

### 2. **Configure Project Settings**

When Vercel detects your project:

**Framework Preset:** `Other` or `Vite`

**Build & Output Settings:**
- Build Command: `npm install && cd client && npm install && npm run build`
- Output Directory: `client/dist`
- Install Command: `npm install && cd server && npm install`

**Root Directory:** Leave as `/` (root)

### 3. **Environment Variables** (Optional)

If you need any environment variables, add them in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add: `NODE_ENV` = `production`

For frontend variables, prefix with `VITE_`:
- Example: `VITE_API_URL` (not needed - uses relative URLs)

### 4. **Deploy**

Click **Deploy** button!

Vercel will:
1. Install dependencies
2. Build your React frontend
3. Deploy serverless functions
4. Give you a live URL

## 🔍 Troubleshooting Common Issues

### Issue 1: React useContext Error / Blank Page
**THIS IS THE MOST COMMON ISSUE!**

**Symptoms:**
- Page goes blank when clicking on funds
- Console shows: "Cannot read properties of null (reading 'useContext')"

**Solution:** Clear Vercel Build Cache
1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Settings** → **General**
4. Scroll down to **Build & Development Settings**
5. Click **Clear Build Cache**
6. Go back to **Deployments** tab
7. Click the 3-dot menu on latest deployment → **Redeploy**
8. Check **"Use existing Build Cache"** is **UNCHECKED**
9. Click **Redeploy**

**Why this happens:** Vercel cached the old React versions before the fix.

### Issue 2: Build Fails - "Module not found"
**Solution:** Make sure `client/package.json` exists with all dependencies
```bash
cd client
npm install
```

### Issue 3: API Routes Return 404
**Solution:** Check `vercel.json` rewrites match your API endpoints
- `/api/funds/search` → `api/funds/search.js`
- `/api/funds/get-nav-bucket` → `api/funds/get-nav-bucket.js`

### Issue 4: Function Timeout
**Solution:** Functions have 30s timeout (configured in vercel.json)
- If NAV data fetching takes too long, optimize the backend logic
- Consider pagination for large datasets

### Issue 5: CORS Errors
**Solution:** CORS headers are already configured in API functions
- Check browser console for specific errors
- Verify API function is returning proper headers

## 📊 Post-Deployment Testing

After deployment, test these endpoints:

1. **Frontend:** `https://your-app.vercel.app`
2. **Search API:** `https://your-app.vercel.app/api/funds/search?q=hdfc`
3. **NAV API:** POST to `https://your-app.vercel.app/api/funds/get-nav-bucket`
   ```json
   {
     "schemeCodes": ["119551", "120503"]
   }
   ```

## 🌿 Branch Strategy

- **`main` branch** → Production deployment (Vercel)
- **`development` branch** → Local development (localhost)

Auto-deployment is enabled for `main` branch!

## 💡 Tips

1. **Automatic Deployments:** Every push to `main` triggers a new deployment
2. **Preview Deployments:** Pull requests get preview URLs
3. **Logs:** Check Vercel dashboard → Functions tab for logs
4. **Monitoring:** Use Vercel Analytics for performance insights

## 🐛 Debug Mode

To check Vercel build logs:
1. Go to Vercel Dashboard
2. Click on your project
3. Click on the latest deployment
4. View "Build Logs" and "Function Logs"

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Check function logs in Vercel dashboard

---

**Current Configuration:**
- Frontend: React + Vite
- Backend: Node.js Serverless Functions
- Monorepo with npm workspaces
- API: `/api/funds/*`

