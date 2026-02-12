# Vercel Deployment Guide for Valuestor Frontend

## Quick Deploy (Recommended)

### Option 1: Import from GitHub (Easiest)

1. **Visit Vercel Dashboard**
   - Go to: https://vercel.com/new
   - Click "Add New..." → "Project"

2. **Import Repository**
   - Select `tusharojha/valuestor` from GitHub
   - Vercel will detect it's a monorepo with Turborepo

3. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: apps/frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

5. **Add Environment Variables** (After Deployment)
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_API_URL=<your-backend-url>
     NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
     NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<optional>
     ```
   - Redeploy to apply changes

---

## Option 2: Vercel CLI (Alternative)

If you prefer CLI deployment:

```bash
# From project root
vercel --prod

# When prompted:
# - Set up and deploy? Yes
# - Which scope? Choose your account
# - Link to existing project? No (or Yes if already created)
# - Project name? valuestor
# - Directory location? ./
# - Override settings? Yes
#   - Build Command? cd apps/frontend && npm run build
#   - Output Directory? apps/frontend/.next
#   - Development Command? cd apps/frontend && npm run dev
```

---

## Troubleshooting

### Build Fails with "Cannot find package"
- Ensure Root Directory is set to `apps/frontend`
- Ensure Install Command installs from the root first

### Environment Variables Not Working
- Make sure they start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding new variables

### Module Not Found Errors
- Check that workspace dependencies are installed
- Verify `package.json` includes all required packages

---

## Post-Deployment Checklist

- [ ] Frontend is live at Vercel URL
- [ ] Landing page loads correctly
- [ ] No console errors
- [ ] Static assets load (images, fonts)
- [ ] Add environment variables for backend URL
- [ ] Test wallet connection (after backend is deployed)

---

## Production URLs

- **Frontend (Vercel)**: Will be provided after deployment
- **Backend (Railway)**: To be deployed - see DEPLOY_NOW.md
- **Repository**: https://github.com/tusharojha/valuestor

---

## Cost

- **Vercel Hobby Plan**: Free
  - Unlimited deployments
  - Automatic HTTPS
  - Global CDN
  - 100GB bandwidth/month
