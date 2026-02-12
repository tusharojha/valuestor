#!/bin/bash

echo "🚀 Deploying Valuestor Frontend to Vercel"
echo "=========================================="
echo ""

cd apps/frontend

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🔐 Setting up Vercel project..."
echo ""
echo "When prompted:"
echo "  - Set up and deploy? Yes"
echo "  - Which scope? Choose your account"
echo "  - Link to existing project? No"
echo "  - Project name? valuestor"
echo "  - Directory? ./"
echo "  - Override settings? No"
echo ""
read -p "Press Enter to continue..."

# Deploy to Vercel
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next: Update the API_URL in Vercel dashboard:"
echo "1. Go to your Vercel project settings"
echo "2. Navigate to Environment Variables"
echo "3. Add: NEXT_PUBLIC_API_URL=<your-backend-url>"
echo "4. Redeploy"
