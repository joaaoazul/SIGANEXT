#!/bin/bash
# ═══════════════════════════════════════════════════════
# SIGA180 — Setup script for Hetzner CX22 (Ubuntu 22.04+)
# Run as root: bash deploy/setup-server.sh
# ═══════════════════════════════════════════════════════

set -e

echo "══════════════════════════════════════"
echo "  SIGA180 — Server Setup"
echo "══════════════════════════════════════"

# ── 1. System update ──
echo "[1/7] Updating system..."
apt update && apt upgrade -y

# ── 2. Install Node.js 22 LTS ──
echo "[2/7] Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# ── 3. Install PM2 ──
echo "[3/7] Installing PM2..."
npm install -g pm2

# ── 4. Install Nginx ──
echo "[4/7] Installing Nginx..."
apt install -y nginx

# ── 5. Create app directory ──
echo "[5/7] Setting up app directory..."
mkdir -p /var/www/siga180
mkdir -p /var/log/siga180
chown -R www-data:www-data /var/www/siga180

# ── 6. Firewall ──
echo "[6/7] Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ── 7. Setup swap (CX22 has 4GB RAM, add 2GB swap) ──
echo "[7/7] Setting up swap..."
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo ""
echo "══════════════════════════════════════"
echo "  ✅ Server setup complete!"
echo ""
echo "  Next steps:"
echo "  1. Copy your app to /var/www/siga180"
echo "  2. Create /var/www/siga180/.env"
echo "  3. Run: bash deploy/deploy.sh"
echo "  4. Setup SSL: bash deploy/setup-ssl.sh yourdomain.com"
echo "══════════════════════════════════════"
