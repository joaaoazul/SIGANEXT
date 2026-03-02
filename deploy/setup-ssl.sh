#!/bin/bash
# ═══════════════════════════════════════════════════════
# SIGA180 — SSL Setup with Let's Encrypt (Certbot)
# Usage: bash deploy/setup-ssl.sh yourdomain.com
# ═══════════════════════════════════════════════════════

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
  echo "Usage: bash deploy/setup-ssl.sh yourdomain.com"
  exit 1
fi

echo "══════════════════════════════════════"
echo "  SIGA180 — SSL Setup for $DOMAIN"
echo "══════════════════════════════════════"

# ── 1. Install Certbot ──
echo "[1/3] Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# ── 2. Obtain certificate ──
echo "[2/3] Obtaining SSL certificate..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email privacidade@siga180.pt --redirect

# ── 3. Setup auto-renewal ──
echo "[3/3] Setting up auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Cron fallback for renewal
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | sort -u | crontab -

# Also add data retention cleanup cron (weekly, Sundays at 4am)
(crontab -l 2>/dev/null; echo "0 4 * * 0 cd /var/www/siga180 && npx tsx scripts/data-retention-cleanup.ts >> /var/log/siga180/cleanup.log 2>&1") | sort -u | crontab -

echo ""
echo "══════════════════════════════════════"
echo "  ✅ SSL configured for $DOMAIN"
echo "  Certificate auto-renews via certbot timer"
echo "  Data retention cleanup runs weekly (Sun 4am)"
echo "  Test: https://$DOMAIN"
echo "══════════════════════════════════════"
