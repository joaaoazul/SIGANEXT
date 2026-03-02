#!/bin/bash
# ═══════════════════════════════════════════════════════
# SIGA180 — SSL Setup with Cloudflare Origin Certificate
# Usage: bash deploy/setup-cloudflare-ssl.sh
# ═══════════════════════════════════════════════════════

set -e

APP_DIR="/var/www/siga180"
CERT_DIR="/etc/ssl/cloudflare"

echo "══════════════════════════════════════"
echo "  SIGA180 — Cloudflare SSL Setup"
echo "══════════════════════════════════════"

# ── 1. Check certificates exist ──
echo "[1/4] Checking certificates..."
mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_DIR/cert.pem" ] || [ ! -f "$CERT_DIR/key.pem" ]; then
  echo "❌ Certificate files not found!"
  echo "   Place your Cloudflare Origin Certificate at:"
  echo "   $CERT_DIR/cert.pem  (Certificate PEM)"
  echo "   $CERT_DIR/key.pem   (Private Key)"
  echo ""
  echo "   You can paste them with:"
  echo "   nano $CERT_DIR/cert.pem"
  echo "   nano $CERT_DIR/key.pem"
  exit 1
fi

# Secure permissions
chmod 600 "$CERT_DIR/key.pem"
chmod 644 "$CERT_DIR/cert.pem"
echo "  ✓ Certificates found and permissions set"

# ── 2. Install production nginx config ──
echo "[2/4] Installing Cloudflare nginx config..."
cp "$APP_DIR/deploy/nginx-cloudflare.conf" /etc/nginx/sites-available/siga180
ln -sf /etc/nginx/sites-available/siga180 /etc/nginx/sites-enabled/siga180

# Remove default site if present
rm -f /etc/nginx/sites-enabled/default

nginx -t
if [ $? -ne 0 ]; then
  echo "❌ Nginx config test failed! Reverting..."
  cp "$APP_DIR/deploy/nginx-initial.conf" /etc/nginx/sites-available/siga180
  nginx -t && systemctl reload nginx
  exit 1
fi

systemctl reload nginx
echo "  ✓ Nginx config with HTTPS + security headers active"

# ── 3. Setup crons ──
echo "[3/4] Setting up cron jobs..."

# Data retention cleanup (weekly, Sundays at 4am)
(crontab -l 2>/dev/null; echo "0 4 * * 0 cd $APP_DIR && npx tsx scripts/data-retention-cleanup.ts >> /var/log/siga180/cleanup.log 2>&1") | sort -u | crontab -
echo "  ✓ Data retention cleanup: Sundays 4am"

# ── 4. Verify ──
echo "[4/4] Verifying..."
sleep 2

# Test HTTPS locally (self-signed from server perspective)
HTTP_CODE=$(curl -sk -o /dev/null -w '%{http_code}' https://127.0.0.1 -H 'Host: siga180.pt')
if [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "  ✓ HTTPS responding ($HTTP_CODE)"
else
  echo "  ⚠ HTTPS returned $HTTP_CODE (may still be starting)"
fi

echo ""
echo "══════════════════════════════════════"
echo "  ✅ Cloudflare SSL configurado!"
echo ""
echo "  Certifica-te que no Cloudflare Dashboard:"
echo "  - SSL/TLS mode: Full (Strict)"
echo "  - DNS: A records com proxy ON (nuvem laranja)"
echo ""
echo "  Testar: https://siga180.pt"
echo "══════════════════════════════════════"
