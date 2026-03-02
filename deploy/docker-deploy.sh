#!/bin/bash
# ═══════════════════════════════════════════════════════
# SIGA180 — Docker deployment script
# Run from server: bash deploy/docker-deploy.sh
# ═══════════════════════════════════════════════════════

set -e

APP_DIR="/var/www/siga180"
REPO="https://github.com/joaaoazul/SIGANEXT.git"
BRANCH="main"

echo "══════════════════════════════════════"
echo "  SIGA180 — Docker Deploy"
echo "══════════════════════════════════════"

# ── 1. Pull latest code ──
echo "[1/4] Pulling latest code..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin
  git reset --hard "origin/$BRANCH"
else
  git clone -b "$BRANCH" "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 2. Check .env exists ──
if [ ! -f .env ]; then
  echo "❌ ERROR: .env file not found!"
  echo "   Copy .env.example to .env and fill in the values:"
  echo "   cp .env.example .env && nano .env"
  exit 1
fi

# ── 3. Build and start containers ──
echo "[2/4] Building Docker image..."
docker compose build --no-cache

echo "[3/4] Starting containers..."
docker compose up -d

# ── 4. Verify ──
echo "[4/4] Checking health..."
sleep 10
if docker compose ps | grep -q "healthy\|running"; then
  echo ""
  echo "══════════════════════════════════════"
  echo "  ✅ Deploy complete!"
  echo ""
  echo "  App: http://localhost:3000"
  echo "  Containers: docker compose ps"
  echo "  Logs: docker compose logs -f app"
  echo "══════════════════════════════════════"
else
  echo "⚠️  Containers may not be healthy yet."
  echo "  Check: docker compose ps"
  echo "  Logs:  docker compose logs app"
fi
