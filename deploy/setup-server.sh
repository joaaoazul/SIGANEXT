#!/bin/bash
# ═══════════════════════════════════════════════════════
# SIGA180 — Setup script for Hetzner (Ubuntu 22.04+)
# Run as root: bash deploy/setup-server.sh
#
# Pré-requisitos:
#   - DNS A records: siga180.pt → 157.90.113.98
#                    www.siga180.pt → 157.90.113.98
#   - Acesso root SSH ao servidor
# ═══════════════════════════════════════════════════════

set -euo pipefail

APP_DIR="/var/www/siga180"
LOG_DIR="/var/log/siga180"
DOMAIN="siga180.pt"
REPO="https://github.com/joaaoazul/SIGANEXT.git"

echo "══════════════════════════════════════"
echo "  SIGA180 — Server Setup"
echo "  IP: 157.90.113.98"
echo "  Domínio: $DOMAIN"
echo "══════════════════════════════════════"

# ── 1. System update ──
echo "[1/9] Updating system..."
apt update && apt upgrade -y

# ── 2. Install Node.js 22 LTS ──
echo "[2/9] Installing Node.js 22..."
if command -v node &>/dev/null && [[ "$(node -v)" == v22* ]]; then
  echo "  Node.js $(node -v) already installed — skipping."
else
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt install -y nodejs
fi
echo "  Node $(node -v) | npm $(npm -v)"

# ── 3. Install PM2 ──
echo "[3/9] Installing PM2..."
if command -v pm2 &>/dev/null; then
  echo "  PM2 already installed — skipping."
else
  npm install -g pm2
fi

# ── 4. Install Nginx + Certbot + fail2ban ──
echo "[4/9] Installing Nginx, Certbot, fail2ban..."
apt install -y nginx certbot python3-certbot-nginx fail2ban

# ── 5. Create app directory ──
echo "[5/9] Setting up app directory..."
mkdir -p "$APP_DIR" "$LOG_DIR"

# ── 6. Clone repository ──
echo "[6/9] Cloning/updating repository..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git pull origin main
else
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 7. Firewall ──
echo "[7/9] Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status

# ── 8. Setup swap (2GB) ──
echo "[8/9] Setting up swap..."
if swapon --show | grep -q '/swapfile'; then
  echo "  Swap already active — skipping."
else
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl vm.swappiness=10
  echo 'vm.swappiness=10' >> /etc/sysctl.conf
fi
echo "  Swap: $(free -h | grep Swap | awk '{print $2}')"

# ── 9. Setup Nginx (HTTP only — SSL comes after) ──
echo "[9/9] Configuring Nginx..."
cp "$APP_DIR/deploy/nginx-initial.conf" /etc/nginx/sites-available/siga180
ln -sf /etc/nginx/sites-available/siga180 /etc/nginx/sites-enabled/siga180
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Enable fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# PM2 auto-start on reboot
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo ""
echo "══════════════════════════════════════"
echo "  ✅ Server setup complete!"
echo ""
echo "  Próximos passos:"
echo ""
echo "  1. Criar o ficheiro .env:"
echo "     cp $APP_DIR/.env.example $APP_DIR/.env"
echo "     nano $APP_DIR/.env"
echo ""
echo "  2. Deploy da app:"
echo "     cd $APP_DIR && bash deploy/deploy.sh"
echo ""
echo "  3. SSL (depois de confirmar que HTTP funciona):"
echo "     bash deploy/setup-ssl.sh siga180.pt"
echo "══════════════════════════════════════"
