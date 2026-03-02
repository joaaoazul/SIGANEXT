#!/bin/bash
# ═══════════════════════════════════════════════════════
# SIGA180 — Deployment script for Hetzner
# Run from the server: bash deploy/deploy.sh
# ═══════════════════════════════════════════════════════

set -e

APP_DIR="/var/www/siga180"
REPO="https://github.com/joaaoazul/SIGANEXT.git"
BRANCH="main"

echo "══════════════════════════════════════"
echo "  SIGA180 — Deploying..."
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "══════════════════════════════════════"

# ── Pre-flight checks ──
cd "$APP_DIR"

if [ ! -f ".env" ]; then
  echo "❌ .env file not found! Create it first:"
  echo "   cp .env.example .env && nano .env"
  exit 1
fi

# Verify critical env vars
source <(grep -E '^(DATABASE_URL|JWT_SECRET|NEXT_PUBLIC_APP_URL)=' .env)
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set in .env"
  exit 1
fi
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-jwt-secret-here" ]; then
  echo "❌ JWT_SECRET not configured in .env"
  exit 1
fi

echo "  ✓ Pre-flight checks passed"

# ── 1. Pull latest code ──
echo "[1/7] Pulling latest code..."
if [ -d "$APP_DIR/.git" ]; then
  git fetch origin
  git reset --hard "origin/$BRANCH"
else
  echo "Cloning repository..."
  git clone -b "$BRANCH" "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 2. Install dependencies ──
echo "[2/7] Installing dependencies..."
npm ci

# ── 3. Generate Prisma client ──
echo "[3/7] Generating Prisma client..."
npx prisma generate

# ── 4. Push DB schema (safe — won't drop data) ──
echo "[4/7] Syncing database schema..."
npx prisma db push --accept-data-loss=false

# ── 5. Build ──
echo "[5/7] Building Next.js..."
npm run build

# ── 6. Copy assets for standalone mode ──
echo "[6/7] Preparing standalone build..."
if [ -d ".next/standalone" ]; then
  cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
  cp -r public .next/standalone/public 2>/dev/null || true
  cp .env .next/standalone/.env 2>/dev/null || true
  echo "  ✓ Static assets + public + .env copied to standalone"
else
  echo "  ⚠ No standalone output found — check next.config.ts has output: 'standalone'"
  exit 1
fi

# ── 7. Restart PM2 ──
echo "[7/7] Restarting application..."
if pm2 describe siga180 > /dev/null 2>&1; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
fi

pm2 save

# Verify
sleep 3
if curl -sf -o /dev/null http://127.0.0.1:3000; then
  echo "  ✓ App responding at http://127.0.0.1:3000"
else
  echo "  ⚠ App may still be starting. Check: pm2 logs siga180"
fi

echo ""
echo "══════════════════════════════════════"
echo "  ✅ Deploy complete!"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "  PM2 status: pm2 status"
echo "  Logs: pm2 logs siga180"
echo "══════════════════════════════════════"
