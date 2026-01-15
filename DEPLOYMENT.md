# GitHub Pages Deployment Guide

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Repository name: `attendpro` (or your preferred name)
5. Description: "Attendance Management System"
6. Choose **Public** (required for free GitHub Pages)
7. **DO NOT** initialize with README, .gitignore, or license (we already have these)
8. Click "Create repository"

## Step 2: Update Repository Name in Config

If your repository name is different from "attendpro", update these files:

1. **`.github/workflows/deploy.yml`** - Line 40:
   ```yaml
   VITE_BASE_PATH: /your-repo-name/
   ```

2. **`attendpro-frontend/vite.config.js`** - Update the default base path:
   ```js
   base: process.env.NODE_ENV === 'production' 
     ? (process.env.VITE_BASE_PATH || '/your-repo-name/') 
     : '/',
   ```

## Step 3: Push to GitHub

Run these commands (replace `YOUR_USERNAME` with your GitHub username):

```bash
cd /Users/keithdmonte/Desktop/attendpro

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/attendpro.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select **"GitHub Actions"**
5. Save the settings

## Step 5: Configure GitHub Actions

The deployment workflow will run automatically when you push to `main` branch.

1. Go to **Actions** tab in your repository
2. You should see "Deploy to GitHub Pages" workflow
3. Click on it to see the deployment progress
4. Wait for it to complete (usually 2-3 minutes)

## Step 6: Access Your Site

Once deployment is complete:
- Your site will be available at: `https://YOUR_USERNAME.github.io/attendpro/`
- The URL will be shown in the repository Settings > Pages section

## Important Notes

### Backend API Configuration

Since GitHub Pages only hosts static files, your backend API needs to be hosted separately:

1. **Option 1**: Host backend on services like:
   - Railway
   - Render
   - Heroku
   - DigitalOcean
   - AWS

2. **Option 2**: Update API URL in GitHub Actions:
   - Go to repository Settings > Secrets and variables > Actions
   - Add a secret named `VITE_API_URL` with your backend URL
   - Update `.github/workflows/deploy.yml` to use the secret:
     ```yaml
     env:
       NODE_ENV: production
       VITE_BASE_PATH: /attendpro/
       VITE_API_URL: ${{ secrets.VITE_API_URL }}
     ```

### Local Development

For local development, create `.env` file in `attendpro-frontend/`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Troubleshooting

### Build Fails
- Check GitHub Actions logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### 404 Errors
- Verify `base` path in `vite.config.js` matches repository name
- Check that `VITE_BASE_PATH` in workflow matches repository name
- Ensure React Router is configured correctly

### API Not Working
- Check CORS settings on your backend
- Verify API URL is correct
- Check browser console for errors

## Updating the Site

Simply push changes to `main` branch:

```bash
git add .
git commit -m "Your commit message"
git push
```

GitHub Actions will automatically rebuild and redeploy!
