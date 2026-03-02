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
echo "[5/7] Building Next.js..."
npm run build

# ── 6. Copy assets for standalone mode ──
echo "[6/7] Preparing standalone build..."
if [ -d ".next/standalone" ]; then
  cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
  cp -r public .next/standalone/public 2>/dev/null || true
  # Copy .env to standalone dir so server.js can read it
  cp .env .next/standalone/.env 2>/dev/null || true
  echo "  ✓ Static assets + public copied to standalone"
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
echo "  App running at http://localhost:3000"
echo "  PM2 status: pm2 status"
echo "  Logs: pm2 logs siga180"
echo "══════════════════════════════════════"
