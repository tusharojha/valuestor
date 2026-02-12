# Valuestor Deployment Guide 🚀

Complete guide to deploying Valuestor to production.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker (optional but recommended)
- Domain name
- SSL certificate

## Infrastructure Setup

### 1. Database (PostgreSQL)

**Option A: Managed Database (Recommended)**

Use a managed PostgreSQL service:
- **Supabase** (free tier available)
- **Neon** (generous free tier)
- **Railway** (simple setup)
- **AWS RDS**
- **Google Cloud SQL**

**Option B: Self-Hosted**

```bash
# Using Docker
docker run -d \
  --name valuestor-postgres \
  -e POSTGRES_DB=valuestor \
  -e POSTGRES_USER=valuestor \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:14-alpine
```

### 2. Redis

**Option A: Managed Redis**
- **Upstash** (serverless, generous free tier)
- **Redis Cloud** (free tier available)
- **Railway**

**Option B: Self-Hosted**

```bash
# Using Docker
docker run -d \
  --name valuestor-redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:alpine
```

## Application Deployment

### Deploy Backend API

#### Option 1: Railway (Easiest)

1. Create account at https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Configure build settings:
   ```
   Root Directory: apps/backend
   Build Command: npm run build
   Start Command: npm run start
   ```
5. Add environment variables in Railway dashboard
6. Deploy!

#### Option 2: Vercel (Serverless)

**Note:** Vercel works best for the frontend. For backend, use Railway or traditional hosting.

#### Option 3: VPS (DigitalOcean, Linode, etc.)

```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone your repo
git clone https://github.com/yourusername/valuestor.git
cd valuestor

# Install dependencies
npm install

# Build
npm run build

# Setup environment
cp .env.example .env
nano .env  # Edit with your values

# Setup database
cd apps/backend
npx prisma db push
npx prisma generate

# Start with PM2
pm2 start dist/index.js --name valuestor-backend
pm2 save
pm2 startup  # Follow instructions
```

#### Environment Variables for Backend

```bash
DATABASE_URL=postgresql://user:password@host:5432/valuestor
REDIS_URL=redis://host:6379
JWT_SECRET=generate-a-random-secure-string
BASE_RPC_URL=https://mainnet.base.org
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### Deploy Trading Bot

#### Using PM2 (Same Server as Backend)

```bash
cd apps/trader

# Setup environment
cp .env.example .env
nano .env  # Add your keys

# Start bot
pm2 start dist/index.js --name valuestor-trader
pm2 save
```

#### Using Docker

```dockerfile
# Dockerfile for trader
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY dist ./dist

CMD ["node", "dist/index.js"]
```

```bash
# Build and run
docker build -t valuestor-trader .
docker run -d \
  --name valuestor-trader \
  --env-file .env \
  --restart unless-stopped \
  valuestor-trader
```

#### Environment Variables for Trader

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
BASE_RPC_URL=https://mainnet.base.org
PRIVATE_KEY=0x...  # Bot wallet private key
REDIS_URL=redis://host:6379
DRY_RUN=false  # Set to false for live trading
MAX_SLIPPAGE=0.05
```

### Deploy Frontend

#### Option 1: Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy:
   ```bash
   cd apps/frontend
   vercel --prod
   ```
4. Add environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://api.yourbackend.com
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
   ```

#### Option 2: Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Build: `npm run build`
3. Deploy: `netlify deploy --prod`

#### Option 3: Self-Hosted with Nginx

```bash
# Build
cd apps/frontend
npm run build

# Install Nginx
sudo apt install nginx

# Copy build files
sudo cp -r .next /var/www/valuestor/

# Nginx config
sudo nano /etc/nginx/sites-available/valuestor
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/valuestor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Setup

### Using Certbot (Free)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Monitoring & Logging

### Setup Logging

```bash
# PM2 logs
pm2 logs

# Follow logs
pm2 logs --lines 200 -f
```

### Setup Monitoring

**Option 1: PM2 Plus**
```bash
pm2 link your-secret-key your-public-key
```

**Option 2: Sentry**

Add to your apps:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Backup Strategy

### Database Backups

```bash
# Create backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > /backups/valuestor_$DATE.sql
# Keep only last 7 days
find /backups -name "valuestor_*.sql" -mtime +7 -delete
EOF

chmod +x backup-db.sh

# Add to cron (daily at 2am)
crontab -e
# Add: 0 2 * * * /path/to/backup-db.sh
```

## Security Checklist

- [ ] Environment variables secured (not in code)
- [ ] Database password is strong
- [ ] JWT secret is random and secure
- [ ] Private keys stored securely
- [ ] HTTPS enabled on all domains
- [ ] Firewall configured (only necessary ports open)
- [ ] Regular backups enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Dependencies updated regularly

## Post-Deployment

### 1. Test Everything

```bash
# Backend health check
curl https://api.yourdomain.com/health

# Frontend
# Visit https://yourdomain.com and test:
# - Wallet connection
# - Profile creation
# - Token browsing
# - Dashboard
```

### 2. Monitor Bot Activity

```bash
# Check trader logs
pm2 logs valuestor-trader --lines 100

# Check Redis for active valuestors
redis-cli
> KEYS valuestor:*
> GET valuestor:0x...
```

### 3. Set Up Alerts

- Transaction failures
- API errors
- Bot stopped
- High gas prices
- Low wallet balance

## Scaling

### Horizontal Scaling

#### Load Balancer Setup

```nginx
upstream backend {
    server backend1.domain.com;
    server backend2.domain.com;
    server backend3.domain.com;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

#### Multiple Trader Instances

Don't run multiple trader instances with the same wallet - use different wallets or implement distributed locking:

```typescript
// Use Redis lock
const lock = await redis.set(
  `lock:trader:${tokenAddress}`,
  traderId,
  'EX', 60, // 60 second expiry
  'NX'  // Only if not exists
);

if (lock === 'OK') {
  // Process this token
}
```

## Cost Estimation

### Minimal Setup (Hobby/MVP)
- **Database**: Supabase Free Tier - $0
- **Redis**: Upstash Free Tier - $0
- **Backend**: Railway $5/month
- **Frontend**: Vercel Free - $0
- **Trader Bot**: Railway $5/month
- **Total**: ~$10/month

### Production Setup
- **Database**: Managed PostgreSQL $25/month
- **Redis**: Redis Cloud $30/month
- **Backend**: VPS (2GB) $12/month
- **Frontend**: Vercel Pro $20/month
- **Trader Bot**: Separate VPS $12/month
- **Monitoring**: Sentry $26/month
- **Total**: ~$125/month

### Enterprise Setup
- **Database**: AWS RDS $200/month
- **Redis**: AWS ElastiCache $100/month
- **Backend**: Multiple instances $200/month
- **Frontend**: Vercel Enterprise $150/month
- **Trader Bots**: Multiple instances $200/month
- **Monitoring & Logging**: $100/month
- **Total**: ~$950/month

## Troubleshooting

### Bot Not Trading

1. Check logs: `pm2 logs valuestor-trader`
2. Verify API key: `echo $ANTHROPIC_API_KEY`
3. Check wallet balance: Has enough ETH for gas?
4. Check Redis: Any active valuestors?
5. Verify factory address in contracts package

### API Errors

1. Check database connection
2. Check Redis connection
3. Review error logs
4. Verify environment variables
5. Check CORS settings

### Frontend Not Connecting

1. Check API_URL in frontend env
2. Verify CORS on backend
3. Check network tab in browser devtools
4. Verify wallet connection

---

**Need help?** Check the Issues or create a new one!
