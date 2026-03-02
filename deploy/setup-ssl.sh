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

# ── 2. Obtain certificate using webroot (nginx stays untouched) ──
echo "[2/5] Obtaining SSL certificate..."
certbot certonly --webroot \
  -w /var/www/html \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  --non-interactive \
  --agree-tos \
  --email joaomartimma@gmail.com

# ── 3. Swap to full production nginx config (with SSL) ──
echo "[3/5] Installing production Nginx config..."
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/siga180
ln -sf /etc/nginx/sites-available/siga180 /etc/nginx/sites-enabled/siga180

# Generate dhparam if not exists (required by nginx.conf)
if [ ! -f /etc/letsencrypt/ssl-dhparams.pem ]; then
  echo "  Generating Diffie-Hellman parameters (this takes a moment)..."
  openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
fi

# Create options-ssl-nginx.conf if certbot didn't
if [ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]; then
  cat > /etc/letsencrypt/options-ssl-nginx.conf << 'SSLCONF'
ssl_session_cache shared:le_nginx_SSL:10m;
ssl_session_timeout 1440m;
ssl_session_tickets off;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384";
SSLCONF
fi

nginx -t && systemctl reload nginx
echo "  ✓ Full production nginx config with HTTPS + security headers active"

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
