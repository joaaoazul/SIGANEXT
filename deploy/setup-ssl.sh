#!/bin/bash
# ═══════════════════════════════════════════════════════
# SIGA180 — SSL Setup with Let's Encrypt (Certbot)
# Usage: bash deploy/setup-ssl.sh siga180.pt
# ═══════════════════════════════════════════════════════

set -e

DOMAIN=${1:-"siga180.pt"}
APP_DIR="/var/www/siga180"

echo "══════════════════════════════════════"
echo "  SIGA180 — SSL Setup for $DOMAIN"
echo "══════════════════════════════════════"

# ── 1. Install Certbot ──
echo "[1/5] Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# ── 2. Obtain certificate (for domain + www) ──
echo "[2/5] Obtaining SSL certificate..."
certbot --nginx \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  --non-interactive \
  --agree-tos \
  --email privacidade@siga180.pt \
  --redirect

# ── 3. Swap to full production nginx config ──
echo "[3/5] Installing production Nginx config..."
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/siga180
nginx -t && systemctl reload nginx
echo "  ✓ Full production nginx config with security headers active"

# ── 4. Setup auto-renewal ──
echo "[4/5] Setting up auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Cron fallback for renewal
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | sort -u | crontab -

# ── 5. Data retention cleanup cron (weekly, Sundays at 4am) ──
echo "[5/5] Setting up data retention cleanup cron..."
(crontab -l 2>/dev/null; echo "0 4 * * 0 cd $APP_DIR && npx tsx scripts/data-retention-cleanup.ts >> /var/log/siga180/cleanup.log 2>&1") | sort -u | crontab -

echo ""
echo "══════════════════════════════════════"
echo "  ✅ SSL configurado para $DOMAIN + www.$DOMAIN"
echo "  Certificados renovam automaticamente (certbot timer)"
echo "  Data retention cleanup: Domingos às 4h"
echo "  Testar: https://$DOMAIN"
echo "══════════════════════════════════════"
