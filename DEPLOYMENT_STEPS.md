# Complete Step-by-Step Deployment Guide

## 🎯 Goal
Make your GitHub Pages frontend (`https://keithdmonte.github.io/attendpro/`) connect to a hosted backend API.

---

## 📋 Step 1: Deploy Backend to Railway

### 1.1 Sign up for Railway
1. Go to **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with **GitHub** (recommended - one-click login)
4. Authorize Railway to access your GitHub account

### 1.2 Create New Project
1. Once logged in, click **"New Project"** (top right)
2. Select **"Deploy from GitHub repo"**
3. Find and select your **`attendpro`** repository
4. Click **"Deploy Now"**

### 1.3 Configure Railway Service
1. Railway will detect it's a Python project automatically
2. Click on the service that was created
3. Go to the **"Settings"** tab
4. Scroll down to **"Deploy"** section

### 1.4 Set Start Command
1. In the **"Start Command"** field, enter:
   ```
   uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
   ```
2. Click **"Save"**

### 1.5 Set Root Directory (if needed)
1. In **"Root Directory"** field, leave it **empty** (or set to `/`)
2. Railway should auto-detect the project root

### 1.6 Add Environment Variables
1. Go to the **"Variables"** tab
2. Click **"New Variable"**
3. Add these variables one by one:

   **Variable 1:**
   - **Name:** `DATABASE_URL`
   - **Value:** Your PostgreSQL connection string
     - If you don't have one, Railway can provide a PostgreSQL database:
       - Go to **"New"** → **"Database"** → **"Add PostgreSQL"**
       - Railway will auto-create `DATABASE_URL` variable
   
   **Variable 2 (if you have other config vars):**
   - Check `backend/app/core/config.py` for any other environment variables
   - Add them with the same name and value

### 1.7 Get Your Backend URL
1. Go to the **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"** (if not already generated)
4. Copy the URL (e.g., `https://attendpro-production.up.railway.app`)
5. **Save this URL** - you'll need it in Step 2!

### 1.8 Verify Backend is Running
1. Open the Railway URL in your browser
2. You should see: `{"message":"AttendPro backend is running","origin":"none"}`
3. Try: `https://your-railway-url/docs` - you should see FastAPI docs

---

## 📋 Step 2: Add Backend URL to GitHub Secrets

### 2.1 Go to GitHub Repository Settings
1. Go to: **https://github.com/keithdmonte/attendpro**
2. Click the **"Settings"** tab (top navigation)

### 2.2 Navigate to Secrets
1. In the left sidebar, click **"Secrets and variables"**
2. Click **"Actions"**

### 2.3 Add New Secret
1. Click **"New repository secret"** button (top right)
2. **Name:** `VITE_API_URL` (exactly this, case-sensitive)
3. **Secret:** Paste your Railway backend URL (e.g., `https://attendpro-production.up.railway.app`)
   - **Important:** Include `https://` but NO trailing slash
4. Click **"Add secret"**

### 2.4 Verify Secret is Added
1. You should see `VITE_API_URL` in the secrets list
2. The value will be hidden (showing dots)

---

## 📋 Step 3: Update CORS Settings (Already Done!)

✅ The CORS settings have already been updated in `backend/app/main.py` to include:
```python
"https://keithdmonte.github.io",  # GitHub Pages deployment
```

### 3.1 Commit and Push CORS Changes
Run these commands in your terminal:

```bash
cd /Users/keithdmonte/Desktop/attendpro
git add backend/app/main.py
git commit -m "fix: Add GitHub Pages URL to CORS allowed origins"
git push origin main
```

### 3.2 Redeploy Backend on Railway
1. Go back to Railway dashboard
2. Railway will **automatically redeploy** when you push to GitHub
3. Wait for deployment to complete (green checkmark)
4. Verify backend is still accessible

---

## 📋 Step 4: Trigger Frontend Redeployment

### 4.1 Go to GitHub Actions
1. Go to: **https://github.com/keithdmonte/attendpro/actions**
2. You should see workflow runs listed

### 4.2 Run Workflow Manually
1. Click on **"Deploy to GitHub Pages"** workflow (left sidebar)
2. Click **"Run workflow"** button (top right, next to "Filter" search)
3. Select **"main"** branch from dropdown
4. Click **"Run workflow"** button

### 4.3 Wait for Deployment
1. You'll see a new workflow run appear
2. Click on it to see progress
3. Wait for both **"build"** and **"deploy"** jobs to complete (green checkmarks)
4. This usually takes 1-2 minutes

### 4.4 Verify Deployment
1. Once complete, go to: **https://keithdmonte.github.io/attendpro/**
2. Open browser Developer Tools (F12)
3. Go to **Console** tab
4. Try logging in
5. Check for any errors - should connect to your Railway backend now!

---

## 📋 Step 5: Test Everything

### 5.1 Test Login
1. Go to: **https://keithdmonte.github.io/attendpro/login**
2. Select **"Student"** or **"Teacher"**
3. Enter a valid email from your database
4. Click **"Sign In"**
5. Should work now! ✅

### 5.2 Test API Connection
1. Open browser Developer Tools (F12)
2. Go to **Network** tab
3. Try logging in
4. You should see API calls going to your Railway URL (not `127.0.0.1:8000`)

### 5.3 Verify Backend Logs
1. Go to Railway dashboard
2. Click on your service
3. Go to **"Deployments"** tab
4. Click on latest deployment
5. Check **"Logs"** - you should see API requests coming in

---

## 🔧 Troubleshooting

### Issue: "Login failed" still appears
**Solution:**
1. Check browser console (F12) for errors
2. Verify `VITE_API_URL` secret is set correctly
3. Make sure frontend was redeployed after adding secret
4. Check Railway backend logs for errors

### Issue: CORS errors in browser console
**Solution:**
1. Verify CORS includes `https://keithdmonte.github.io`
2. Make sure backend was redeployed after CORS changes
3. Check Railway backend is accessible

### Issue: Backend not starting on Railway
**Solution:**
1. Check Railway logs for errors
2. Verify start command is correct: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
3. Check all environment variables are set
4. Verify `requirements.txt` exists and is correct

### Issue: Database connection errors
**Solution:**
1. Verify `DATABASE_URL` is set in Railway
2. Check database is running (Railway dashboard)
3. Run migrations: Add a one-time command in Railway:
   ```
   alembic upgrade head
   ```

---

## ✅ Final Checklist

- [ ] Backend deployed to Railway
- [ ] Backend URL obtained and saved
- [ ] `VITE_API_URL` secret added to GitHub
- [ ] CORS updated in `backend/app/main.py`
- [ ] CORS changes committed and pushed
- [ ] Backend redeployed on Railway
- [ ] Frontend redeployed via GitHub Actions
- [ ] Tested login on hosted site
- [ ] Verified API calls go to Railway backend

---

## 🎉 Success!

Once all steps are complete, your hosted site at `https://keithdmonte.github.io/attendpro/` will work exactly like your local version!

**Your setup:**
- **Frontend:** GitHub Pages (automatic deployment)
- **Backend:** Railway (hosted API)
- **Database:** Railway PostgreSQL (or your own)

---

## 📞 Need Help?

If you get stuck at any step:
1. Check Railway logs
2. Check GitHub Actions logs
3. Check browser console for errors
4. Verify all URLs and secrets are correct
