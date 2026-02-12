# 🚀 Quick Deployment Instructions

## Current Status
✅ Factory Address Updated: `0x07DFAEC8e182C5eF79844ADc70708C1c15aA60fb`
✅ OpenAI Integration Complete
✅ Code Ready to Deploy

## Option 1: Deploy Everything to Cloud (Recommended)

### A. Deploy Backend to Railway

1. **Go to Railway**: https://railway.app
2. **Sign up/Login** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select** your `valuestor` repository
5. **Configure**:
   - Root Directory: `apps/backend`
   - Build Command: `npm run build`
   - Start Command: `npm run start`
6. **Add Environment Variables** in Railway dashboard:
   ```
   DATABASE_URL=(Railway will provide this)
   REDIS_URL=(Add Railway Redis plugin)
   JWT_SECRET=valuestor-super-secret-jwt-2024
   BASE_RPC_URL=https://mainnet.base.org
   PORT=3001
   FRONTEND_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   ```
7. **Add Plugins**:
   - PostgreSQL (Railway will auto-provide DATABASE_URL)
   - Redis (Railway will auto-provide REDIS_URL)
8. **Deploy!** Railway URL will be: `https://valuestor-backend-production.up.railway.app`

### B. Deploy Frontend to Vercel

```bash
# Run the deployment script
./deploy-frontend.sh

# Or manually:
cd apps/frontend
npm install -g vercel
vercel --prod
```

**Environment Variables to add in Vercel:**
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=placeholder
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

### C. Deploy Trader Bot to Railway (Optional)

1. **New Project** in Railway
2. **Root Directory**: `apps/trader`
3. **Environment Variables**:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   BASE_RPC_URL=https://mainnet.base.org
   REDIS_URL=(same as backend)
   DRY_RUN=true
   MAX_SLIPPAGE=0.05
   ```

## Option 2: Local Development with Ngrok

### Prerequisites
```bash
# Install ngrok
brew install ngrok  # Mac
# or download from https://ngrok.com/download
```

### Steps

1. **Start Local Database** (if you have Docker):
```bash
docker-compose up -d
```

Or use cloud databases:
- PostgreSQL: https://supabase.com (free)
- Redis: https://upstash.com (free)

2. **Setup Backend**:
```bash
cd apps/backend

# Update .env with your database URLs
nano .env

# Install dependencies & setup database
npm install
npx prisma db push
npx prisma generate

# Start backend
npm run dev
```

3. **Start Ngrok** (in new terminal):
```bash
ngrok http 3001
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

4. **Deploy Frontend to Vercel**:
```bash
cd apps/frontend

# Set API URL
echo "NEXT_PUBLIC_API_URL=https://abc123.ngrok.io" > .env.production

# Deploy
vercel --prod
```

## Option 3: All Local (Development)

```bash
# Terminal 1 - Database
docker-compose up

# Terminal 2 - Backend
cd apps/backend
npm install
npx prisma db push
npm run dev

# Terminal 3 - Frontend
cd apps/frontend
npm install
npm run dev

# Terminal 4 - Trader (optional)
cd apps/trader
npm install
npm run dev
```

Visit: http://localhost:3000

## After Deployment

### Test Your Deployment

1. **Visit Frontend URL**
2. **Connect Wallet** (make sure you're on Base network)
3. **Create Valuestor Profile**
4. **Browse Tokens**

### Update Environment Variables

**Vercel (Frontend):**
1. Go to project settings
2. Environment Variables
3. Update `NEXT_PUBLIC_API_URL` with your Railway backend URL
4. Redeploy

**Railway (Backend):**
1. Go to project settings
2. Variables
3. Update `FRONTEND_URL` with your Vercel URL

## Estimated Costs

**Railway:**
- Hobby Plan: $5/month (includes PostgreSQL + Redis)
- Pro: $20/month (better performance)

**Vercel:**
- Hobby: Free (perfect for MVP)
- Pro: $20/month (custom domains, etc.)

**Total for MVP: $5-10/month**

## Need Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Check DEPLOYMENT.md for detailed guide

## Quick Links

After deployment, you'll have:
- **Frontend**: https://valuestor.vercel.app
- **Backend**: https://valuestor-backend.railway.app
- **API Health**: https://valuestor-backend.railway.app/health

---

**Ready to launch! 🚀**
