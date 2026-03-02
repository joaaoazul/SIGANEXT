#!/bin/bash
# ═══════════════════════════════════════════════════════
# SIGA180 — SSL Setup with Certbot (Docker version)
# Usage: bash deploy/docker-ssl.sh siga180.pt
# ═══════════════════════════════════════════════════════

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
  echo "Usage: bash deploy/docker-ssl.sh yourdomain.com"
  exit 1
fi

echo "══════════════════════════════════════"
echo "  SIGA180 — SSL Setup for $DOMAIN"
echo "══════════════════════════════════════"

# ── 1. Create certbot directories ──
mkdir -p /var/www/certbot
mkdir -p /etc/letsencrypt

# ── 2. Stop nginx temporarily to free port 80 ──
echo "[1/4] Preparing for certificate issuance..."
docker compose stop nginx 2>/dev/null || true

# ── 3. Obtain certificate ──
echo "[2/4] Obtaining SSL certificate..."
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
    --standalone \
    -d "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email privacidade@siga180.pt

# ── 3. Enable SSL in nginx config ──
echo "[3/4] Enabling SSL in nginx config..."
cd /var/www/siga180

# Uncomment the SSL lines in the nginx config
sed -i "s|# ssl_certificate /etc/letsencrypt|ssl_certificate /etc/letsencrypt|g" deploy/nginx-docker.conf
sed -i "s|# ssl_certificate_key /etc/letsencrypt|ssl_certificate_key /etc/letsencrypt|g" deploy/nginx-docker.conf
sed -i "s|# ssl_protocols|ssl_protocols|g" deploy/nginx-docker.conf
sed -i "s|# ssl_ciphers|ssl_ciphers|g" deploy/nginx-docker.conf

# ── 4. Restart nginx ──
echo "[4/4] Restarting nginx with SSL..."
docker compose up -d nginx

# ── 5. Setup auto-renewal cron ──
(crontab -l 2>/dev/null; echo "0 3 * * * docker run --rm -v /etc/letsencrypt:/etc/letsencrypt -v /var/www/certbot:/var/www/certbot certbot/certbot renew --quiet && cd /var/www/siga180 && docker compose restart nginx") | sort -u | crontab -

# Also add data retention cleanup cron (weekly, Sundays 4am)
(crontab -l 2>/dev/null; echo "0 4 * * 0 cd /var/www/siga180 && docker compose exec -T app node -e \"require('dotenv/config')\" && docker compose exec -T app npx tsx scripts/data-retention-cleanup.ts >> /var/log/siga180-cleanup.log 2>&1") | sort -u | crontab -

echo ""
echo "══════════════════════════════════════"
echo "  ✅ SSL configured for $DOMAIN"
echo "  Certificate auto-renews via cron"
echo "  Test: https://$DOMAIN"
echo "══════════════════════════════════════"
