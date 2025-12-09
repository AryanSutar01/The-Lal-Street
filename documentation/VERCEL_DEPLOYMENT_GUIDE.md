# 🚀 Vercel Deployment Guide - The Lal Street

## Quick Deployment Steps

### Method 1: Deploy via Vercel CLI (Fastest)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Deploy
```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No
- **Project name?** → the-lal-street (or your preferred name)
- **In which directory is your code located?** → ./
- **Want to override settings?** → No

#### 4. Deploy to Production
```bash
vercel --prod
```

---

### Method 2: Deploy via Vercel Dashboard (Easiest)

#### 1. Push Code to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### 2. Go to Vercel
- Visit: https://vercel.com/
- Click **"Add New Project"**
- **Import Git Repository** → Select your GitHub repo

#### 3. Configure Project
**Build & Development Settings:**
- **Framework Preset:** Other
- **Root Directory:** `./`
- **Build Command:** `npm run vercel-build`
- **Output Directory:** `client/dist`
- **Install Command:** `npm install`

**Environment Variables:** (if needed)
- Add any required environment variables here

#### 4. Deploy
- Click **"Deploy"**
- Wait for deployment to complete (2-5 minutes)
- Your site will be live at: `https://your-project-name.vercel.app`

---

## 📁 What I've Set Up For You

### 1. `vercel.json` - Vercel Configuration
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "client/dist"
      }
    }
  ],
  "routes": [...]
}
```

This tells Vercel:
- Build the Node.js backend (Express API)
- Build the React frontend (Vite)
- Route `/api/*` requests to the backend
- Serve frontend static files for all other routes

### 2. Updated Scripts in `package.json`
```json
{
  "scripts": {
    "build": "npm run build --workspace=client",
    "vercel-build": "npm run build --workspace=client"
  }
}
```

### 3. Updated `server/package.json`
```json
{
  "scripts": {
    "start": "node server.js",  // Production
    "dev": "nodemon server.js"  // Development
  }
}
```

### 4. API Configuration (`client/src/config/api.ts`)
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? '' // Use relative URLs in production
    : 'http://localhost:5000');
```

This automatically:
- Uses `localhost:5000` in development
- Uses relative URLs (same domain) in production on Vercel

### 5. Updated `navService.ts`
- Now uses `API_ENDPOINTS` from config
- Automatically adapts to development/production environment

---

## 🔧 Post-Deployment Steps

### 1. Test Your Deployed Site
After deployment, test:
- ✅ Fund search functionality
- ✅ SIP calculator
- ✅ Lumpsum calculator
- ✅ Rolling returns calculator
- ✅ NAV data fetching

### 2. Set Up Custom Domain (Optional)
1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

### 3. Environment Variables (If Needed)
If you need to add environment variables:
1. Go to **"Settings"** → **"Environment Variables"**
2. Add variables like:
   - `NODE_ENV=production`
   - Any API keys (if you use external services)

---

## 🐛 Troubleshooting

### Issue: API Routes Not Working
**Solution:** Check that your `vercel.json` routes are correct:
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/server.js"
    }
  ]
}
```

### Issue: Build Fails
**Solutions:**
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json` (not devDependencies if needed in production)
3. Test local build: `npm run build`

### Issue: "Cannot find module" errors
**Solution:** Make sure all imports use correct paths and all dependencies are installed

### Issue: CORS Errors
**Solution:** Your backend already has CORS enabled:
```javascript
app.use(cors());
```

If specific origins are needed in production, update to:
```javascript
app.use(cors({
  origin: ['https://your-domain.vercel.app'],
  credentials: true
}));
```

---

## 📊 Performance Optimization (Post-Launch)

### 1. Enable Caching
Your app already has:
- ✅ Frontend caching in `navService.ts` (1-hour TTL)
- ✅ Backend caching in `navApi.service.js`

### 2. Monitor Performance
- Use Vercel Analytics (free tier available)
- Check API response times
- Monitor cache hit rates

### 3. Optimize Bundle Size
```bash
# Analyze bundle
cd client
npm run build -- --mode production

# Check dist folder size
```

---

## 🎯 Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev2` | Run locally (frontend + backend) |
| `npm run build` | Build production frontend |
| `vercel` | Deploy to preview |
| `vercel --prod` | Deploy to production |
| `vercel logs` | View deployment logs |
| `vercel domains` | Manage domains |

---

## ✅ Pre-Deployment Checklist

- [x] `vercel.json` created
- [x] Build scripts configured
- [x] API endpoints use environment-aware URLs
- [x] Server uses `node` instead of `nodemon` for production
- [x] `.vercelignore` excludes unnecessary files
- [ ] Test build locally: `npm run build`
- [ ] Push code to GitHub
- [ ] Deploy to Vercel
- [ ] Test deployed site
- [ ] (Optional) Set up custom domain

---

## 🎉 You're Ready to Deploy!

Choose your preferred method above and follow the steps.

**Estimated deployment time:** 3-5 minutes ⚡

**Need help?** 
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support

---

Good luck with your deployment! 🚀

