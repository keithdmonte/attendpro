# Backend Setup Guide for GitHub Pages

## Current Situation

Your frontend is deployed at: **https://keithdmonte.github.io/attendpro/**

However, your backend is currently running locally at `http://127.0.0.1:8000`, which won't work with the deployed frontend.

## Step 1: Host Your Backend

You need to deploy your FastAPI backend to a cloud service. Here are the best options:

### Option A: Railway (Recommended - Easiest)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `attendpro` repository
6. Railway will detect it's a Python project
7. Set the start command: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
8. Add environment variables:
   - `DATABASE_URL` (your PostgreSQL connection string)
   - Any other env vars from `backend/app/core/config.py`
9. Railway will give you a URL like: `https://your-app.railway.app`

### Option B: Render

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" > "Web Service"
4. Connect your GitHub repository
5. Settings:
   - **Name**: attendpro-backend
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables (same as Railway)
7. Render will give you a URL like: `https://attendpro-backend.onrender.com`

### Option C: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create attendpro-backend`
4. Add PostgreSQL: `heroku addons:create heroku-postgresql:hobby-dev`
5. Set config: `heroku config:set DATABASE_URL=$(heroku config:get DATABASE_URL)`
6. Deploy: `git push heroku main`
7. Your URL: `https://attendpro-backend.herokuapp.com`

## Step 2: Add Backend URL to GitHub Secrets

Once you have your backend URL (e.g., `https://your-app.railway.app`):

1. Go to your GitHub repository: https://github.com/keithdmonte/attendpro
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** > **Actions**
4. Click **New repository secret**
5. Name: `VITE_API_URL`
6. Value: Your backend URL (e.g., `https://your-app.railway.app`)
7. Click **Add secret**

## Step 3: Redeploy Frontend

After adding the secret, trigger a new deployment:

1. Go to **Actions** tab
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button (top right)
4. Select **main** branch
5. Click **Run workflow**
6. Wait for deployment to complete

## Step 4: Update CORS Settings

Make sure your backend allows requests from your GitHub Pages domain:

In `backend/app/main.py`, update CORS:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local dev
        "https://keithdmonte.github.io",  # GitHub Pages
        # Add your backend URL if needed
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Step 5: Verify Everything Works

1. Visit: https://keithdmonte.github.io/attendpro/
2. Try logging in or accessing features
3. Check browser console (F12) for any API errors
4. Verify API calls are going to your hosted backend

## Troubleshooting

### CORS Errors
- Make sure your backend CORS settings include `https://keithdmonte.github.io`
- Check browser console for specific CORS error messages

### API Not Found (404)
- Verify `VITE_API_URL` secret is set correctly
- Check that your backend is running and accessible
- Test backend URL directly in browser: `https://your-backend-url.com/docs`

### Database Connection Issues
- Ensure your hosted database URL is correct
- Check environment variables are set in your hosting platform
- Verify database migrations have run: `alembic upgrade head`

## Quick Checklist

- [ ] Backend deployed to Railway/Render/Heroku
- [ ] Backend URL obtained (e.g., `https://your-app.railway.app`)
- [ ] `VITE_API_URL` secret added to GitHub
- [ ] Frontend redeployed with new backend URL
- [ ] CORS settings updated in backend
- [ ] Tested the live site

## Need Help?

If you encounter issues:
1. Check GitHub Actions logs for build errors
2. Check browser console (F12) for frontend errors
3. Check your backend logs in Railway/Render/Heroku dashboard
4. Verify environment variables are set correctly
