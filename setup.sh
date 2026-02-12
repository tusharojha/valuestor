#!/bin/bash

# Valuestor Setup Script
# This script helps you get Valuestor running locally

set -e

echo "=================================="
echo "Valuestor Setup"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18 or higher from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Check if Docker is installed (optional)
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker detected${NC}"
    DOCKER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠ Docker not found (optional but recommended)${NC}"
    DOCKER_AVAILABLE=false
fi

echo ""
echo "=================================="
echo "Step 1: Install Dependencies"
echo "=================================="
npm install

echo ""
echo "=================================="
echo "Step 2: Setup Environment Files"
echo "=================================="

# Root .env
if [ ! -f .env ]; then
    echo "Creating root .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit .env and add your API keys${NC}"
fi

# Backend .env
if [ ! -f apps/backend/.env ]; then
    echo "Creating backend .env file..."
    cp apps/backend/.env.example apps/backend/.env
    echo -e "${YELLOW}⚠ Please edit apps/backend/.env${NC}"
fi

# Trader .env
if [ ! -f apps/trader/.env ]; then
    echo "Creating trader .env file..."
    cp apps/trader/.env.example apps/trader/.env
    echo -e "${YELLOW}⚠ Please edit apps/trader/.env and add ANTHROPIC_API_KEY${NC}"
fi

# Frontend .env.local
if [ ! -f apps/frontend/.env.local ]; then
    echo "Creating frontend .env.local file..."
    cp apps/frontend/.env.example apps/frontend/.env.local
fi

echo ""
echo "=================================="
echo "Step 3: Start Database Services"
echo "=================================="

if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "Starting PostgreSQL and Redis with Docker..."
    docker-compose up -d

    # Wait for postgres to be ready
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5

    echo -e "${GREEN}✓ Database services started${NC}"
else
    echo -e "${YELLOW}⚠ Docker not available. Please install PostgreSQL and Redis manually:${NC}"
    echo "  - PostgreSQL: https://www.postgresql.org/download/"
    echo "  - Redis: https://redis.io/download"
    echo ""
    echo "Or install Docker: https://www.docker.com/get-started"
    echo ""
    read -p "Press enter when PostgreSQL and Redis are running..."
fi

echo ""
echo "=================================="
echo "Step 4: Setup Database Schema"
echo "=================================="

cd apps/backend
echo "Pushing Prisma schema to database..."
npx prisma db push
npx prisma generate
cd ../..

echo -e "${GREEN}✓ Database schema created${NC}"

echo ""
echo "=================================="
echo "Step 5: Build All Packages"
echo "=================================="

npm run build

echo -e "${GREEN}✓ Build complete${NC}"

echo ""
echo "=================================="
echo "Setup Complete! 🎉"
echo "=================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Update RobinPump Factory Address:"
echo "   Edit: packages/contracts/src/addresses/base.ts"
echo "   Replace 0x0000... with actual factory address"
echo ""
echo "2. Add your Anthropic API key:"
echo "   Edit: apps/trader/.env"
echo "   Add: ANTHROPIC_API_KEY=sk-ant-api03-..."
echo ""
echo "3. Start the applications:"
echo ""
echo "   Terminal 1 - Backend:"
echo "   $ cd apps/backend && npm run dev"
echo ""
echo "   Terminal 2 - Frontend:"
echo "   $ cd apps/frontend && npm run dev"
echo ""
echo "   Terminal 3 - Trader (optional):"
echo "   $ cd apps/trader && npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "For detailed instructions, see:"
echo "  - README.md - Full documentation"
echo "  - QUICK_START.md - Quick start guide"
echo "  - DEPLOYMENT.md - Production deployment"
echo ""
echo -e "${GREEN}Happy trading! 🚀${NC}"
