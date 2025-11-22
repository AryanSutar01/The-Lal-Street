# Separate Frontend & Backend Deployment Guide

## 🎯 Strategy: Deploy Frontend and Backend Independently

**Frontend:** Vercel (Static React App)  
**Backend:** Render (Express API Server)

---

## ✅ **Why Separate Deployment is Better:**

1. **No Serverless Conversion** - Keep your full Express server
2. **No Cold Starts** - Backend stays warm
3. **Easier Debugging** - Full server logs
4. **More Flexibility** - Can scale independently
5. **Simpler Setup** - No complex monorepo configuration

---

## 🚀 **PART 1: Deploy Backend (Express Server) on Render**

### Step 1: Prepare Backend for Deployment

Create a new file `server/.env.example`:
```env
PORT=5000
NODE_ENV=production
```

### Step 2: Update `server/server.js` for Production

The CORS configuration needs to allow your frontend domain:

```javascript
// Update CORS in server/server.js
const allowedOrigins = [
  'http://localhost:5173', // Local development
  'https://your-app.vercel.app', // Your Vercel frontend URL
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### Step 3: Deploy to Render

1. **Go to [render.com](https://render.com)**
2. **Sign up/Login** with GitHub
3. **Click "New +"** → **"Web Service"**
4. **Connect your repository:** `The-Lal-Street`
5. **Configure the service:**

   ```
   Name: lal-street-api
   Region: Singapore (or closest to India)
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

6. **Environment Variables:** (optional)
   - `NODE_ENV` = `production`
   - `PORT` = `5000` (Render auto-assigns, but keep for clarity)

7. **Instance Type:**
   - Free tier: Works but spins down after 15 min
   - Starter ($7/month): Always on, better performance

8. **Click "Create Web Service"**

9. **Wait for deployment** (~2-3 minutes)

10. **Copy the URL:** Something like:
    ```
    https://lal-street-api.onrender.com
    ```

### Step 4: Test Backend

Test these endpoints:

```bash
# Health check
curl https://lal-street-api.onrender.com/api/health

# Fund search
curl https://lal-street-api.onrender.com/api/funds/search?q=hdfc

# NAV data
curl -X POST https://lal-street-api.onrender.com/api/funds/get-nav-bucket \
  -H "Content-Type: application/json" \
  -d '{"schemeCodes": ["119551"]}'
```

---

## 🎨 **PART 2: Deploy Frontend (React) on Vercel**

### Step 1: Update API Configuration

Update `client/src/config/api.ts`:

```typescript
// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://lal-street-api.onrender.com' // Your Render backend URL
    : 'http://localhost:5000');

export const API_ENDPOINTS = {
  FUNDS_SEARCH: `${API_BASE_URL}/api/funds/search`,
  FUNDS_NAV: `${API_BASE_URL}/api/funds/get-nav-bucket`,
} as const;
```

### Step 2: Create Frontend-Only Vercel Config

Create `client/vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "cleanUrls": true,
  "trailingSlash": false
}
```

### Step 3: Deploy to Vercel

**Option A: Deploy from client directory**

1. **Go to [vercel.com](https://vercel.com)**
2. **New Project** → Import `The-Lal-Street`
3. **Configure:**
   ```
   Framework Preset: Vite
   Root Directory: client
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables:**
   ```
   VITE_API_URL = https://lal-street-api.onrender.com
   ```

5. **Deploy**

**Option B: Use Vercel CLI (from project root)**

```bash
# Install Vercel CLI
npm install -g vercel

# Go to client directory
cd client

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set root directory: ./
# - Build command: npm run build
# - Output directory: dist

# For production
vercel --prod
```

### Step 4: Update Backend CORS

After getting your Vercel URL (e.g., `https://lal-street.vercel.app`), update backend CORS:

1. Go to Render dashboard
2. Click your service
3. Go to "Environment" tab
4. Add environment variable:
   ```
   ALLOWED_ORIGINS=https://lal-street.vercel.app,http://localhost:5173
   ```

5. Update `server/server.js`:
   ```javascript
   const allowedOrigins = process.env.ALLOWED_ORIGINS 
     ? process.env.ALLOWED_ORIGINS.split(',')
     : ['http://localhost:5173'];
   ```

6. Redeploy backend (Render auto-deploys on code changes)

---

## 🔄 **PART 3: Alternative Backend Hosting Options**

### Option B: Railway (Easier than Render)

1. Go to [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub**
3. Select repository
4. Railway auto-detects Node.js
5. Set root directory: `server`
6. Deploy automatically

**Pros:** Simpler setup, good free credits  
**Cons:** Free credits run out (~500 hours/month)

### Option C: Fly.io (Global Edge Network)

1. Install Fly CLI:
   ```bash
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. Create `server/fly.toml`:
   ```toml
   app = "lal-street-api"
   
   [build]
     builder = "heroku/buildpacks:20"
   
   [[services]]
     internal_port = 5000
     protocol = "tcp"
   
     [[services.ports]]
       port = 80
       handlers = ["http"]
   
     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]
   ```

3. Deploy:
   ```bash
   cd server
   fly launch
   fly deploy
   ```

**Pros:** Fast, global CDN, always-on free tier  
**Cons:** More complex setup

---

## 📊 **Comparison Table**

| Platform | Cost | Setup | Performance | Cold Starts |
|----------|------|-------|-------------|-------------|
| **Render** | $7/mo or Free | Easy | Good | On free tier |
| **Railway** | Credits/$5 | Easiest | Great | No |
| **Fly.io** | Free/$2 | Medium | Excellent | No |
| **Heroku** | $5/mo | Easy | Good | No |

---

## 🎯 **Recommended Approach:**

### **Best Overall: Render + Vercel**

**Backend:** Render ($7/month for always-on, or free with cold starts)  
**Frontend:** Vercel (Free tier)

**Total Cost:** $7/month or FREE

**Why?**
- ✅ Easiest to set up
- ✅ Great documentation
- ✅ Automatic deployments
- ✅ Good performance
- ✅ Separate scaling

---

## 🔒 **Environment Variables**

### Backend (Render)
```
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
PORT=5000
```

### Frontend (Vercel)
```
VITE_API_URL=https://lal-street-api.onrender.com
```

---

## 🧪 **Testing After Deployment**

1. **Test Backend Health:**
   ```
   https://lal-street-api.onrender.com/api/health
   ```

2. **Test Frontend:**
   ```
   https://lal-street.vercel.app
   ```

3. **Test Integration:**
   - Search for funds
   - Add to bucket
   - Run calculator
   - Check browser console for errors

---

## 🐛 **Troubleshooting**

### Issue: CORS Error
**Solution:** Check `ALLOWED_ORIGINS` includes your Vercel URL

### Issue: Backend Timeout
**Solution:** Render free tier spins down after 15 min. First request takes ~30s

### Issue: Cannot Connect to API
**Solution:** Verify `VITE_API_URL` in Vercel environment variables

### Issue: 404 on API Routes
**Solution:** Check backend is running on Render dashboard

---

## 📝 **Deployment Checklist**

### Backend (Render)
- [ ] Repository connected
- [ ] `server` directory selected as root
- [ ] Environment variables set
- [ ] Service deployed and running
- [ ] Health endpoint responding
- [ ] API endpoints tested

### Frontend (Vercel)
- [ ] Repository connected
- [ ] `client` directory selected as root
- [ ] `VITE_API_URL` environment variable set
- [ ] Build successful
- [ ] Site accessible
- [ ] API calls working
- [ ] No CORS errors

---

## 🔄 **Automatic Deployments**

Both Render and Vercel support automatic deployments:

- **Push to `main`** → Both redeploy automatically
- **Pull Requests** → Vercel creates preview deployments
- **Branch deploys** → Can deploy different branches

---

## 💡 **Pro Tips**

1. **Use Render's Free Tier** for testing, upgrade if needed
2. **Set up custom domain** on Vercel (free)
3. **Enable Analytics** on Vercel dashboard
4. **Monitor logs** on Render for errors
5. **Add health check endpoint** to keep backend warm

---

**This setup is production-ready and much simpler than serverless!** 🚀









