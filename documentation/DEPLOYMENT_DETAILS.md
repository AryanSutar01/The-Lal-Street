## 6. Deployment Details

### 6.1 Frontend Deployment

**Platform:** Vercel

**Build Command:** `npm run build` (runs from `client` directory)

**Output Directory:** `client/dist`

**Node Version:** 18.x or higher

**Build Configuration:**
- Framework: Vite
- Build tool: Vite (configured in `client/vite.config.js`)
- TypeScript compilation: Enabled
- Environment variables: Configured in Vercel dashboard

**Environment Variables (Frontend):**
```
VITE_API_URL=https://the-lal-street-1.onrender.com/api
```

**Deployment Process:**
1. Push code to GitHub repository
2. Vercel automatically detects changes
3. Runs build command: `cd client && npm run build`
4. Deploys static files to Vercel CDN
5. Provides HTTPS URL automatically

**Vercel Configuration (`vercel.json`):**
```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Serverless Functions:**
Some API endpoints are deployed as Vercel serverless functions:
- Location: `api/` directory in root
- Runtime: Node.js
- Functions:
  - `api/funds/search.js`
  - `api/funds/get-nav-bucket.js`

**CDN Configuration:**
- Automatic CDN distribution via Vercel Edge Network
- Global edge locations for fast content delivery
- Automatic HTTPS/SSL certificates
- Custom domain support

**Build Performance:**
- Typical build time: 30-60 seconds
- Cached dependencies for faster rebuilds
- Incremental builds supported

---

### 6.2 Backend Deployment

**Platform:** Render.com

**Service Type:** Web Service

**Runtime:** Node.js 18.x or higher

**Build Command:** `cd server && npm install`

**Start Command:** `cd server && node server.js`

**Environment Variables (Backend):**
```
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
ADMIN_PASSWORD=your-secure-password-here
RAPIDAPI_KEY=your-rapidapi-key
```

**Render Configuration (`render.yaml`):**
```yaml
services:
  - type: web
    name: the-lal-street-api
    runtime: node
    buildCommand: cd server && npm install
    startCommand: cd server && node server.js
    envVars:
      - key: PORT
        value: 5000
      - key: NODE_ENV
        value: production
      - key: ALLOWED_ORIGINS
        value: https://your-vercel-app.vercel.app
```

**Server Configuration:**
- **Auto-deploy:** Enabled (deploys on git push)
- **Health check:** `/api/health` endpoint
- **Startup timeout:** 180 seconds
- **Idle timeout:** 300 seconds (for free tier)

**Scaling Options:**
- **Free Tier:** 1 instance, sleeps after 15 minutes of inactivity
- **Starter Tier:** Always-on option available
- **Standard/Pro:** Auto-scaling based on load

**Cold Start Mitigation:**
- Health check endpoint for warm-up
- Server warm-up on frontend page load
- 10-second timeout for warm-up requests

**Database/Storage:**
- JSON file storage: `server/data/suggestedBuckets.json`
- Persistent disk: Provided by Render (survives deployments)
- Backup: Version controlled in Git repository

**Logs & Monitoring:**
- Built-in log aggregation in Render dashboard
- Real-time log streaming
- Error tracking available

---

### 6.3 Database

**Storage Type:** File-based JSON storage

**Database File:** `server/data/suggestedBuckets.json`

**Location:** Persistent disk on Render.com

**Structure:**
```json
{
  "buckets": [
    {
      "id": "uuid",
      "name": "...",
      "funds": [...],
      "performance": {...},
      ...
    }
  ]
}
```

**Backup Strategy:**
1. **Git Version Control:** JSON file committed to repository
2. **Render Persistence:** File stored on persistent disk
3. **Manual Backup:** Export via admin panel (future feature)

**Migration Considerations:**
- Can migrate to MongoDB/PostgreSQL in future
- Current structure supports easy migration
- No schema changes needed for file-based approach

**Backup Process:**
1. Download `suggestedBuckets.json` from Render dashboard
2. Commit to Git repository
3. Store in separate backup location (optional)

---

### 6.4 Domain Configuration

**Custom Domain Setup:**

**Frontend (Vercel):**
1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add custom domain (e.g., `www.thelalstreet.com`)
4. Configure DNS records as instructed by Vercel:
   - A record: Points to Vercel IP
   - CNAME record: Points to Vercel domain
5. SSL certificate auto-provisioned

**Backend (Render):**
1. Go to Render service settings
2. Navigate to "Custom Domain"
3. Add domain (e.g., `api.thelalstreet.com`)
4. Update CORS `ALLOWED_ORIGINS` to include custom domain
5. SSL certificate auto-provisioned

**DNS Records Example:**
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
CNAME   api     render-service.onrender.com
```

---

### 6.5 Continuous Deployment

**GitHub Integration:**

**Frontend (Vercel):**
- Connected to GitHub repository
- Auto-deploys on push to `main` branch
- Preview deployments for pull requests
- Branch-based deployments available

**Backend (Render):**
- Connected to GitHub repository
- Auto-deploys on push to `main` branch
- Manual deploy option available
- Rollback to previous deployment supported

**Deployment Workflow:**
1. Developer pushes code to GitHub
2. Vercel automatically builds and deploys frontend
3. Render automatically builds and deploys backend
4. Both deployments complete in parallel
5. Health checks verify successful deployment

**Rollback Process:**
1. **Vercel:** Go to Deployments → Select previous deployment → Promote to Production
2. **Render:** Go to Deployments → Select previous deployment → Rollback

---

### 6.6 Environment-Specific Configuration

**Development:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API URL: `http://localhost:5000/api`

**Staging (Optional):**
- Create separate Vercel and Render services
- Use branch-based deployments
- Test before production merge

**Production:**
- Frontend: Vercel production URL
- Backend: Render production URL
- All environment variables configured

---

### 6.7 Performance Optimization

**Frontend:**
- Code splitting via Vite
- Lazy loading for routes
- Image optimization (if added)
- Minification and compression

**Backend:**
- Response caching (NAV data)
- Connection pooling (if database added)
- Rate limiting to prevent abuse
- Chunked processing for large calculations

**CDN:**
- Vercel Edge Network
- Global distribution
- Automatic compression
- HTTP/2 support

---

### 6.8 Monitoring & Alerts

**Health Checks:**
- Endpoint: `/api/health`
- Monitors: Server status, memory usage, uptime
- Alert threshold: Configured in Render dashboard

**Error Tracking:**
- Render built-in error logs
- Vercel function logs
- Browser console errors (client-side)

**Uptime Monitoring:**
- Render provides basic uptime metrics
- Third-party services (UptimeRobot, Pingdom) can be added
- Alert on downtime via email/SMS

---

### 6.9 Troubleshooting Deployment

**Issue: Frontend Build Fails**
- Check Node.js version compatibility
- Verify all dependencies in `package.json`
- Check build logs in Vercel dashboard
- Test build locally: `cd client && npm run build`

**Issue: Backend Deployment Fails**
- Check environment variables are set
- Verify `startCommand` is correct
- Check server logs in Render dashboard
- Test locally: `cd server && node server.js`

**Issue: API Connection Errors**
- Verify `VITE_API_URL` matches backend URL
- Check CORS configuration in backend
- Verify `ALLOWED_ORIGINS` includes frontend URL
- Check network tab in browser DevTools

**Issue: Environment Variables Not Working**
- Verify variables are set in platform dashboard
- Check variable names match code exactly
- Restart service after adding variables
- Check for typos in variable values

---

### 6.10 Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing (if test suite exists)
- [ ] Environment variables configured
- [ ] API URLs updated
- [ ] CORS origins updated
- [ ] Admin password set
- [ ] Build commands verified

**Deployment:**
- [ ] Push code to GitHub
- [ ] Verify Vercel build succeeds
- [ ] Verify Render deployment succeeds
- [ ] Check health endpoint responds
- [ ] Test frontend loads correctly

**Post-Deployment:**
- [ ] Test all major features
- [ ] Verify API endpoints work
- [ ] Check admin panel access
- [ ] Test on mobile devices
- [ ] Monitor error logs
- [ ] Check performance metrics

---

### 6.11 Scaling Considerations

**Current Limits:**
- Free tier: 1 instance, sleep after inactivity
- File-based storage: Suitable for small-medium data
- No database: Limits concurrent writes

**Future Scaling Options:**

**Backend:**
- Upgrade Render tier for always-on
- Add database (MongoDB Atlas, PostgreSQL)
- Implement connection pooling
- Add Redis for caching

**Frontend:**
- Vercel automatically scales
- Edge functions for API routes
- Image optimization service

**Database Migration:**
- Migrate from JSON to MongoDB/PostgreSQL
- Maintain backward compatibility
- Implement proper indexes
- Add database connection pooling


