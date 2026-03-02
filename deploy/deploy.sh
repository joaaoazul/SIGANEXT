#!/bin/bash
# ═══════════════════════════════════════════════════════
# SIGA180 — Deployment script for Hetzner CX22
# Run from the server: bash deploy/deploy.sh
# ═══════════════════════════════════════════════════════

set -e

APP_DIR="/var/www/siga180"
REPO="https://github.com/joaaoazul/SIGANEXT.git"
BRANCH="main"

echo "══════════════════════════════════════"
echo "  SIGA180 — Deploying..."
echo "══════════════════════════════════════"

# ── 1. Pull latest code ──
echo "[1/6] Pulling latest code..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin
  git reset --hard "origin/$BRANCH"
else
  echo "Cloning repository..."
  git clone -b "$BRANCH" "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 2. Install dependencies ──
echo "[2/6] Installing dependencies..."
npm ci --production=false

# ── 3. Generate Prisma client ──
echo "[3/6] Generating Prisma client..."
npx prisma generate

# ── 4. Push DB schema (safe — won't drop data) ──
echo "[4/6] Syncing database schema..."
npx prisma db push --accept-data-loss=false

# ── 5. Build ──
echo "[5/6] Building Next.js..."
npm run build

# ── 6. Restart PM2 ──
echo "[6/6] Restarting application..."
if pm2 describe siga180 > /dev/null 2>&1; then
  pm2 reload ecosystem.config.js
else
  pm2 start ecosystem.config.js
fi

pm2 save

echo ""
echo "══════════════════════════════════════"
echo "  ✅ Deploy complete!"
echo "  App running at http://localhost:3000"
echo "  PM2 status: pm2 status"
echo "  Logs: pm2 logs siga180"
echo "══════════════════════════════════════"
