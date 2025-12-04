# Deployment Guide - Meeting Management Dashboard

Your application is now ready for deployment! Here are multiple deployment options.

## 🚀 Quick Deployment Options

### Option 1: Render.com (Recommended - FREE)

**Why Render?**
- Free tier available
- Auto-detects Python apps
- Built-in SSL certificates
- Persistent storage for SQLite

**Steps:**

1. **Go to Render.com**
   - Visit: https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `Akshit7103/Client_Tracker_Yugal`

3. **Configure Service**
   - **Name**: meeting-dashboard (or your choice)
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

4. **Deploy**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Your app will be live at: `https://meeting-dashboard-xxxx.onrender.com`

5. **Important Notes**
   - Free tier sleeps after 15 min of inactivity
   - First request after sleep takes ~30 seconds
   - SQLite database persists on disk

---

### Option 2: Railway (Very Easy - FREE)

**Why Railway?**
- Extremely easy deployment
- Auto-detects everything
- No config needed
- Free tier: 500 hours/month

**Steps:**

1. **Go to Railway.app**
   - Visit: https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `Akshit7103/Client_Tracker_Yugal`

3. **That's it!**
   - Railway auto-detects FastAPI
   - Deploys automatically
   - Provides a URL: `https://your-app.railway.app`

---

### Option 3: Heroku (Classic Option)

**Why Heroku?**
- Industry standard
- Easy to use
- Good documentation
- Free tier available (with credit card verification)

**Steps:**

1. **Install Heroku CLI**
   ```bash
   # Download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   cd meeting-dashboard
   heroku create your-app-name
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Open Your App**
   ```bash
   heroku open
   ```

**Note:** Heroku uses the `Procfile` already included in your repo.

---

### Option 4: Vercel (Serverless)

**Why Vercel?**
- Instant deployment
- Great for frontend
- Serverless functions
- Free tier generous

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd meeting-dashboard
   vercel deploy
   ```

3. **Production Deploy**
   ```bash
   vercel --prod
   ```

**Note:** Vercel uses the `vercel.json` already included in your repo.

---

### Option 5: Google Cloud Run

**Why Cloud Run?**
- Scales to zero (no cost when idle)
- Scales automatically
- Enterprise-grade
- Pay per use

**Steps:**

1. **Create Dockerfile** (already included if needed)

2. **Build & Deploy**
   ```bash
   gcloud run deploy meeting-dashboard \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

---

### Option 6: AWS (EC2 or Elastic Beanstalk)

**For EC2:**
1. Launch Ubuntu instance
2. Install Python 3.11
3. Clone your repo
4. Install dependencies: `pip install -r requirements.txt`
5. Run with: `uvicorn main:app --host 0.0.0.0 --port 80`

**For Elastic Beanstalk:**
1. Install EB CLI
2. Run: `eb init` and `eb create`
3. Deploy: `eb deploy`

---

## 🔧 Post-Deployment Configuration

### 1. Database Persistence

**For Production (Render, Railway, Heroku):**

The app uses SQLite by default, which works but has limitations. For better reliability:

**Option A: Keep SQLite** (Good for small teams)
- Data persists on disk
- No additional setup
- Limited to single instance

**Option B: Use PostgreSQL** (Recommended for production)

1. **Add PostgreSQL to your platform:**
   - Render: Add PostgreSQL database (free)
   - Railway: Add PostgreSQL plugin (free)
   - Heroku: Add Heroku Postgres addon

2. **Update `database.py`:**
   ```python
   import os

   DATABASE_URL = os.getenv(
       "DATABASE_URL",
       "sqlite:///./meetings.db"
   ).replace("postgres://", "postgresql://")  # Fix for some platforms

   engine = create_engine(DATABASE_URL)
   ```

3. **Add to requirements.txt:**
   ```
   psycopg2-binary==2.9.9
   ```

4. **Push changes:**
   ```bash
   git add .
   git commit -m "Add PostgreSQL support"
   git push origin main
   ```

### 2. Environment Variables

Set these on your deployment platform if needed:

- `DATABASE_URL` - PostgreSQL connection string (auto-set by platform)
- `PORT` - Port to run on (auto-set by platform)
- `PYTHON_VERSION` - 3.11.0 (set in `runtime.txt`)

### 3. Custom Domain

**On Render:**
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records as shown

**On Railway:**
1. Click Settings → Domains
2. Add custom domain
3. Update DNS

**On Heroku:**
```bash
heroku domains:add yourdomain.com
```

### 4. HTTPS/SSL

All modern platforms (Render, Railway, Heroku, Vercel) provide **FREE automatic SSL certificates**. Your app will be served over HTTPS automatically.

---

## 🔒 Security Best Practices

### Before Going to Production:

1. **Add Authentication** (if handling sensitive data)
   - Consider adding user login
   - JWT tokens for API
   - Role-based access control

2. **Environment Variables**
   - Never commit sensitive data
   - Use `.env` files locally
   - Use platform's environment variable settings for production

3. **CORS Configuration** (if needed for external APIs)
   ```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://yourdomain.com"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

4. **Rate Limiting** (prevent abuse)
   ```bash
   pip install slowapi
   ```

---

## 📊 Monitoring & Logs

### View Logs:

**Render:**
- Dashboard → Logs tab (real-time)

**Railway:**
- Click on deployment → View Logs

**Heroku:**
```bash
heroku logs --tail
```

### Monitoring:

Consider adding:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Uptime Robot** - Uptime monitoring (free)

---

## 🔄 Continuous Deployment

All platforms support **automatic deployment** on git push:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Automatic Deploy:**
   - Render: Auto-deploys on push
   - Railway: Auto-deploys on push
   - Heroku: Auto-deploys if connected to GitHub
   - Vercel: Auto-deploys on push

---

## 📱 Progressive Web App (PWA)

To make your app installable on mobile/desktop:

1. **Add manifest.json** (we can add this if needed)
2. **Add service worker** (for offline support)
3. **Test on mobile** - users can "Add to Home Screen"

---

## 🐛 Troubleshooting Deployment

### Common Issues:

**1. Build Fails - Python Version**
- Ensure `runtime.txt` has: `python-3.11.0`
- Some platforms use `python-3.11.x` format

**2. App Crashes - Port Binding**
- Make sure `main.py` uses: `port=int(os.getenv("PORT", 8000))`

**3. Database Not Persisting**
- Check if platform provides persistent storage
- Consider PostgreSQL for production

**4. Import Errors**
- Verify all dependencies in `requirements.txt`
- Check Python version compatibility

**5. Static Files Not Loading**
- Ensure `static/` directory is committed to git
- Check file paths are relative

---

## ✅ Deployment Checklist

Before going live:

- [ ] Code pushed to GitHub
- [ ] `.gitignore` excludes `meetings.db` and sensitive files
- [ ] `requirements.txt` is up to date
- [ ] App runs locally without errors
- [ ] Choose deployment platform
- [ ] Deploy and test all features
- [ ] Set up custom domain (optional)
- [ ] Enable SSL/HTTPS (automatic on most platforms)
- [ ] Set up monitoring and logging
- [ ] Configure backups for database
- [ ] Test on mobile devices
- [ ] Share app URL with team

---

## 🎉 Your App is Deployed!

**Current Repository:** https://github.com/Akshit7103/Client_Tracker_Yugal

**Recommended Next Steps:**

1. Deploy to **Render.com** (easiest, free)
2. Test all features on live URL
3. Share with your team
4. Set up PostgreSQL if handling lots of data
5. Monitor logs for any issues

---

## Need Help?

- **Render Docs:** https://render.com/docs
- **Railway Docs:** https://docs.railway.app
- **Heroku Docs:** https://devcenter.heroku.com
- **FastAPI Docs:** https://fastapi.tiangolo.com

---

Ready to deploy! Choose your platform and follow the steps above. Render.com is recommended for the easiest free deployment.
