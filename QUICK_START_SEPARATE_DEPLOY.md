# 🚀 Quick Start: Separate Deployment (5 Minutes)

## ⚡ The Fastest Way to Deploy

### **Step 1: Deploy Backend (2 minutes)**

1. Go to **[render.com](https://render.com)** and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Select repository: **"The-Lal-Street"**
4. Configure:
   - **Name:** `lal-street-api`
   - **Region:** Singapore
   - **Branch:** main
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click **"Create Web Service"**
6. **Copy the URL** (example: `https://lal-street-api.onrender.com`)

✅ **Backend is now live!**

---

### **Step 2: Update Frontend Config (30 seconds)**

In your code editor, update this file:

**File:** `client/src/config/api.ts`

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://lal-street-api.onrender.com' // 👈 Paste your Render URL here
    : 'http://localhost:5000');
```

**Commit and push:**
```bash
git add client/src/config/api.ts
git commit -m "feat: Configure backend URL for separate deployment"
git push origin main
```

---

### **Step 3: Deploy Frontend (2 minutes)**

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub
2. Click **"Add New Project"**
3. Select repository: **"The-Lal-Street"**
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Environment Variables** → Add:
   ```
   VITE_API_URL = https://lal-street-api.onrender.com
   ```
   (Use your Render URL from Step 1)
6. Click **"Deploy"**
7. Wait ~1-2 minutes
8. **Copy your Vercel URL** (example: `https://lal-street.vercel.app`)

✅ **Frontend is now live!**

---

### **Step 4: Update Backend CORS (1 minute)**

Go back to Render:

1. Click on your **"lal-street-api"** service
2. Go to **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add:
   ```
   Key: ALLOWED_ORIGINS
   Value: https://lal-street.vercel.app,http://localhost:5173
   ```
   (Use your Vercel URL from Step 3)
5. Click **"Save Changes"**
6. Service will automatically redeploy (~30 seconds)

✅ **CORS configured!**

---

## 🎉 **DONE! Your App is Live!**

**Test your deployment:**

1. Open your Vercel URL: `https://lal-street.vercel.app`
2. Search for a fund (e.g., "HDFC")
3. Add it to your bucket
4. Run a calculator
5. Everything should work! 🎊

---

## 🐛 **Troubleshooting**

### ❌ "CORS Error"
**Solution:** Make sure `ALLOWED_ORIGINS` in Render includes your exact Vercel URL

### ❌ "Cannot connect to API"
**Solution:** Check that `VITE_API_URL` in Vercel matches your Render URL

### ❌ "Backend takes 30+ seconds first time"
**This is normal!** Render free tier spins down after 15 minutes of inactivity.
- **Solution:** Upgrade to Starter plan ($7/month) for always-on backend

---

## 💰 **Cost Breakdown**

- **Backend (Render):** FREE (or $7/month for no cold starts)
- **Frontend (Vercel):** FREE
- **Total:** $0-7/month

---

## 🔄 **Automatic Deployments**

Now when you push to `main`:
- ✅ Backend auto-deploys on Render
- ✅ Frontend auto-deploys on Vercel

---

## 📊 **What You Just Did**

```
┌─────────────────────┐
│   Vercel (Free)     │
│   React Frontend    │  ← User visits here
│   Static Files      │
└──────────┬──────────┘
           │
           │ API Calls
           ↓
┌─────────────────────┐
│   Render ($0-7)     │
│   Express Backend   │
│   Full Server       │
│   /api/funds/*      │
└─────────────────────┘
```

---

## ✨ **Benefits of This Setup**

✅ No serverless complications  
✅ Full Express features available  
✅ Easier debugging with logs  
✅ Independent scaling  
✅ No React version conflicts  
✅ Production-ready  

---

## 📚 **Next Steps**

- Set up custom domain on Vercel (free)
- Enable Vercel Analytics
- Monitor Render logs for errors
- Consider upgrading Render to Starter plan

---

**Need help?** Check `DEPLOYMENT_SEPARATE.md` for detailed guide!

**Questions?** Open an issue on GitHub or ask me! 🚀

