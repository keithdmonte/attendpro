# Deploy AttendPro Backend to Render

## Quick Deploy (Blueprint)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Add Render deployment config"
   git push origin main
   ```

2. **Go to [Render Dashboard](https://dashboard.render.com)**

3. **Create Blueprint**
   - Click **New** → **Blueprint**
   - Connect your GitHub account and select the `attendpro` repository
   - Render will detect `render.yaml` and create:
     - A **PostgreSQL database** (`attendpro-db`)
     - A **Web Service** (`attendpro-api`)

4. **Deploy**
   - Click **Apply** to create the resources
   - Wait 5–10 minutes for the first deploy
   - The database is created first, then the API

5. **Get your backend URL**
   - Open the `attendpro-api` service
   - Copy the URL (e.g. `https://attendpro-api.onrender.com`)

6. **Update Vercel**
   - In your Vercel project → **Settings** → **Environment Variables**
   - Set `VITE_API_URL` = your Render URL (e.g. `https://attendpro-api.onrender.com`)
   - Redeploy the frontend

---

## Manual Deploy (without Blueprint)

If you prefer to set things up manually:

### 1. Create PostgreSQL Database

1. **New** → **PostgreSQL**
2. Name: `attendpro-db`
3. Plan: **Free**
4. Create database
5. Copy the **Internal Database URL** (for same-region) or **External Database URL**

### 2. Create Web Service

1. **New** → **Web Service**
2. Connect your `attendpro` repo
3. Configure:
   - **Name:** `attendpro-api`
   - **Region:** Same as your database (e.g. Oregon)
   - **Branch:** `main`
   - **Root Directory:** *(leave empty)*
   - **Runtime:** Python 3
   - **Build Command:**
     ```
     pip install -r backend/requirements.txt && cd backend && alembic upgrade head
     ```
   - **Start Command:**
     ```
     uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
     ```

4. **Environment Variables**
   - `DATABASE_URL` → Paste the database connection string from step 1

5. Click **Create Web Service**

### 3. Verify

- Visit your service URL
- You should see: `{"message":"AttendPro backend is running","origin":"none"}`
- API docs: `https://your-service.onrender.com/docs`

---

## Notes

- **Free tier:** The service may spin down after 15 minutes of inactivity. The first request after that can take 30–60 seconds.
- **Database:** Use the **Internal** URL if the web service and database are in the same region (faster, no egress).
- **CORS:** The backend allows `*.vercel.app` origins for your frontend.
