# SIGA180 — Deployment Guide (Hetzner)

## Pré-requisitos

| Item | Valor |
|------|-------|
| Servidor | Hetzner CX33 (ou superior) |
| IP | `157.90.113.98` |
| OS | Ubuntu 22.04+ |
| Domínio | `siga180.pt` |
| DNS | A record: `siga180.pt` → `157.90.113.98` |
| DNS | A record: `www.siga180.pt` → `157.90.113.98` |

**Confirmar DNS antes de começar:**
```bash
dig siga180.pt +short       # deve mostrar 157.90.113.98
dig www.siga180.pt +short   # deve mostrar 157.90.113.98
```

---

## Passo 1 — Setup do Servidor

SSH para o servidor como root:
```bash
ssh root@157.90.113.98
```

Clonar o repositório e correr o setup:
```bash
git clone https://github.com/joaaoazul/SIGANEXT.git /var/www/siga180
cd /var/www/siga180
bash deploy/setup-server.sh
```

Isto instala: Node.js 22, PM2, Nginx, Certbot, fail2ban, swap 2GB, firewall.

---

## Passo 2 — Configurar o .env

```bash
cp .env.example .env
nano .env
```

Preencher com os valores reais:
- `DATABASE_URL` — Connection string do Supabase (Transaction Pooler, port 6543)
- `DIRECT_URL` — Connection string do Supabase (Session Pooler, port 5432)
- `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto Supabase
- `SUPABASE_ANON_KEY` — Anon key do Supabase
- `SUPABASE_SERVICE_KEY` — Service role key do Supabase
- `JWT_SECRET` — Gerar com: `openssl rand -base64 32`
- `RESEND_API_KEY` — API key do Resend para emails
- `NEXT_PUBLIC_APP_URL` — `https://siga180.pt`

---

## Passo 3 — Primeiro Deploy

```bash
cd /var/www/siga180
bash deploy/deploy.sh
```

Isto faz: `npm ci` → `prisma generate` → `prisma db push` → `next build` → copia assets para standalone → PM2 start.

Verificar:
```bash
pm2 status
pm2 logs siga180
curl http://127.0.0.1:3000    # deve responder HTML
curl http://siga180.pt         # deve responder via Nginx
```

---

## Passo 4 — Configurar SSL

```bash
bash deploy/setup-ssl.sh siga180.pt
```

Isto faz:
1. Obtém certificado Let's Encrypt para `siga180.pt` + `www.siga180.pt`
2. Substitui o Nginx config inicial pelo de produção (com HTTPS, security headers, gzip, rate limiting)
3. Configura auto-renovação do certificado
4. Adiciona cron de data retention cleanup (domingos 4h)

Verificar:
```bash
curl -I https://siga180.pt                   # deve mostrar 200 + security headers
curl -I https://www.siga180.pt               # deve redirecionar para https://siga180.pt
nginx -t                                      # deve mostrar "syntax is ok"
```

---

## Deploys Seguintes

Para cada atualização:
```bash
ssh root@157.90.113.98
cd /var/www/siga180
bash deploy/deploy.sh
```

Ou se quiser ver os passos:
```bash
git pull origin main
npm ci
npx prisma generate
npx prisma db push
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
cp .env .next/standalone/.env
pm2 reload ecosystem.config.js --update-env
```

---

## Comandos Úteis

```bash
# PM2
pm2 status                    # ver estado
pm2 logs siga180              # ver logs em tempo real
pm2 logs siga180 --lines 100  # últimas 100 linhas
pm2 restart siga180           # restart forçado
pm2 reload siga180            # reload graceful (zero-downtime)
pm2 monit                     # dashboard em tempo real

# Nginx
nginx -t                      # testar configuração
systemctl reload nginx        # recarregar config
tail -f /var/log/nginx/siga180.error.log   # erros nginx
tail -f /var/log/nginx/siga180.access.log  # acessos

# SSL
certbot certificates           # ver certificados ativos
certbot renew --dry-run        # testar renovação

# Logs da app
tail -f /var/log/siga180/out.log    # stdout
tail -f /var/log/siga180/error.log  # stderr

# Base de dados
cd /var/www/siga180
npx prisma studio              # GUI da base de dados (http://localhost:5555)
npx prisma db push             # sync schema
```

---

## Estrutura de Ficheiros no Servidor

```
/var/www/siga180/              # App directory
├── .env                       # Environment variables
├── .next/standalone/          # Production build
│   ├── server.js              # Entry point (PM2 runs this)
│   ├── .next/static/          # Client-side assets
│   └── public/                # Public files
├── deploy/                    # Deployment scripts
├── ecosystem.config.js        # PM2 config
└── prisma/                    # Schema

/var/log/siga180/              # App logs
├── out.log
├── error.log
└── cleanup.log                # Data retention log

/etc/nginx/sites-available/    # Nginx configs
└── siga180

/etc/letsencrypt/live/siga180.pt/  # SSL certs
├── fullchain.pem
└── privkey.pem
```

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| App não responde | `pm2 logs siga180` — ver erros |
| Build falha | Verificar `NODE_ENV`, memória swap ativa: `free -h` |
| 502 Bad Gateway | App não está a correr: `pm2 status`, restart: `pm2 restart siga180` |
| SSL não funciona | Verificar DNS: `dig siga180.pt`, certbot: `certbot certificates` |
| Disco cheio | `df -h`, limpar logs antigos: `pm2 flush` |
| DB connection error | Verificar `DATABASE_URL` no `.env`, testar: `npx prisma db pull` |
| Rate limiting 429 | Normal — API limitada a 10 req/s por IP (ajustar em nginx.conf se necessário) |
