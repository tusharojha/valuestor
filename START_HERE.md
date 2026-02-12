# ⚡ VALUESTOR - START HERE ⚡

## ✅ What's Been Configured

Your Valuestor platform is **ready to deploy** with:

### 🔧 Factory Address
```
0x07DFAEC8e182C5eF79844ADc70708C1c15aA60fb
```
Updated in: `packages/contracts/src/addresses/base.ts`

### 🤖 AI Integration
```
OpenAI GPT-4 Turbo
API Key: sk-proj-ofsF...t1FwA (configured)
```
Updated in: `apps/trader/src/ai/decision-engine.ts`

### 📦 Project Structure
```
✅ Backend API (Express + PostgreSQL + Redis)
✅ Frontend (Next.js 14 + RainbowKit)
✅ AI Trader Bot (OpenAI + viem)
✅ Smart Contract Integration (Base network)
```

---

## 🚀 FASTEST WAY TO DEPLOY (5 Minutes)

### Step 1: Deploy Backend to Railway

1. Go to https://railway.app
2. Sign up/Login
3. **New Project** → **Deploy from GitHub repo**
4. Select your repo
5. **Settings**:
   - Root Directory: `apps/backend`
   - Build Command: `cd ../.. && npm install && npm run build`
   - Start Command: `cd apps/backend && npm run start`

6. **Add Plugins**:
   - Click **+ New** → **Database** → **PostgreSQL**
   - Click **+ New** → **Database** → **Redis**

7. **Variables** (Railway auto-adds DATABASE_URL and REDIS_URL):
   ```
   JWT_SECRET=valuestor-secret-2024
   BASE_RPC_URL=https://mainnet.base.org
   PORT=3001
   FRONTEND_URL=https://valuestor.vercel.app
   NODE_ENV=production
   ```

8. **Deploy** → Copy your backend URL (e.g., `https://backend-production.up.railway.app`)

### Step 2: Deploy Frontend to Vercel

```bash
cd apps/frontend

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

When prompted:
- Set up and deploy? **Yes**
- Project name? **valuestor**
- Directory? **./  (just press Enter)**
- Override settings? **No**

**After deployment**, add these environment variables in Vercel dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add:
   ```
   NEXT_PUBLIC_API_URL=https://backend-production.up.railway.app
   NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=placeholder
   ```
3. **Redeploy** from Vercel dashboard

### Step 3: Initialize Database

```bash
# After Railway backend is deployed, run migrations
# In Railway dashboard → your backend project → Terminal tab:

npx prisma db push
npx prisma generate
```

---

## 🎯 YOUR LIVE LINKS

After deployment you'll have:

**Frontend**: `https://valuestor-[your-id].vercel.app`
**Backend**: `https://backend-production-[your-id].up.railway.app`
**API Health**: `https://backend-production-[your-id].up.railway.app/health`

---

## 🧪 Test Your Deployment

1. **Visit your frontend URL**
2. **Connect wallet** (make sure you're on Base network)
3. **Click "Get Started"** → Create your valuestor profile
4. **Define your values**: Pick themes, set risk tolerance
5. **Browse tokens**: See tokens on RobinPump
6. **View dashboard**: See your portfolio

---

## 🤖 Optional: Deploy AI Trader Bot

The bot monitors new tokens and makes AI-powered trading decisions.

**Deploy to Railway:**

1. **New Project** → **Deploy from GitHub repo**
2. **Settings**:
   - Root Directory: `apps/trader`
   - Build Command: `cd ../.. && npm install && npm run build`
   - Start Command: `cd apps/trader && npm run start`

3. **Variables**:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   BASE_RPC_URL=https://mainnet.base.org
   REDIS_URL=(use same Redis from backend - copy from backend variables)
   DRY_RUN=true
   MAX_SLIPPAGE=0.05
   ```

4. **Deploy**

The bot will:
- Monitor RobinPump for new token launches
- Analyze each token with OpenAI
- Make trading decisions based on user values
- Execute trades automatically (if auto-trade enabled)

---

## 💰 Cost Breakdown

**Free Tier (For Testing)**:
- Railway: $5/month (includes PostgreSQL + Redis)
- Vercel: Free (hobby tier)
- **Total: $5/month**

**Production**:
- Railway Pro: $20/month
- Vercel Pro: $20/month
- **Total: $40/month**

---

## 📱 Local Development (Alternative)

If you want to run locally instead:

```bash
# 1. Install dependencies
npm install

# 2. Start database
docker-compose up -d

# 3. Setup backend
cd apps/backend
npx prisma db push
npx prisma generate

# 4. Run everything (3 terminals)
# Terminal 1:
cd apps/backend && npm run dev

# Terminal 2:
cd apps/frontend && npm run dev

# Terminal 3 (optional):
cd apps/trader && npm run dev
```

Visit: http://localhost:3000

---

## 🆘 Troubleshooting

### Backend won't start on Railway
- Check logs in Railway dashboard
- Verify DATABASE_URL and REDIS_URL are set
- Make sure Prisma migrations ran: `npx prisma db push`

### Frontend can't connect to backend
- Check NEXT_PUBLIC_API_URL in Vercel environment variables
- Make sure it points to your Railway backend URL
- Redeploy frontend after changing env vars

### Wallet connection not working
- Make sure you're on Base network in MetaMask
- Clear browser cache and try again
- Check console for errors

### Bot not making decisions
- Verify OPENAI_API_KEY is correct
- Check bot logs in Railway dashboard
- Ensure REDIS_URL is correct and accessible

---

## 📚 Documentation

- **DEPLOY_NOW.md** - Detailed deployment guide
- **README.md** - Full project documentation
- **QUICK_START.md** - Local development guide
- **DEPLOYMENT.md** - Production deployment strategies

---

## 🎉 You're Ready!

Your Valuestor platform is configured and ready to deploy. Follow the steps above and you'll have a live, working platform in **less than 10 minutes**.

**Questions?** Check the documentation or create an issue!

**Happy deploying! 🚀**

---

## 📋 Environment Variables Summary

### Backend (.env)
```bash
DATABASE_URL=postgresql://... (Railway provides)
REDIS_URL=redis://... (Railway provides)
JWT_SECRET=valuestor-secret-2024
BASE_RPC_URL=https://mainnet.base.org
PORT=3001
FRONTEND_URL=https://valuestor.vercel.app
NODE_ENV=production
```

### Frontend (Vercel Environment Variables)
```bash
NEXT_PUBLIC_API_URL=https://backend-production.up.railway.app
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=placeholder
```

### Trader (Optional)
```bash
OPENAI_API_KEY=sk-proj-ofsFyuCaEDA...
BASE_RPC_URL=https://mainnet.base.org
REDIS_URL=redis://... (same as backend)
DRY_RUN=true
MAX_SLIPPAGE=0.05
```
