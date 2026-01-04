# 🚀 VPS Deploy Qo'llanmasi - Bilimdon Platform

## 📋 Talablar

- **VPS**: Ubuntu 20.04/22.04 LTS (minimum 2GB RAM, 20GB SSD)
- **Domain**: bilimdon-ai.uz (DNS A record VPS IP ga yo'naltirilgan)
- **Subdomain**: api.bilimdon-ai.uz (DNS A record VPS IP ga yo'naltirilgan)

## 🔧 Tez Deploy (1 qadam)

```bash
# 1. VPS ga SSH orqali ulaning
ssh root@YOUR_VPS_IP

# 2. Reponi clone qiling
git clone https://github.com/Bekmuhammad-Devoloper/Bilimdon_ai.git /var/www/bilimdon
cd /var/www/bilimdon

# 3. Deploy scriptini ishga tushiring
chmod +x deploy.sh
./deploy.sh
```

## 📝 Qo'lda Deploy (qadam-qadam)

### 1. VPS ga ulaning
```bash
ssh root@YOUR_VPS_IP
```

### 2. Tizimni yangilang
```bash
apt update && apt upgrade -y
```

### 3. Node.js 20.x o'rnating
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v  # v20.x ko'rsatishi kerak
```

### 4. PM2 o'rnating
```bash
npm install -g pm2
```

### 5. PostgreSQL o'rnating va sozlang
```bash
apt install -y postgresql postgresql-contrib

# PostgreSQL ga kiring
sudo -u postgres psql

# Database va user yarating
CREATE DATABASE bilimdon;
CREATE USER bilimdon_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE bilimdon TO bilimdon_user;
\q
```

### 6. Redis o'rnating
```bash
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server
```

### 7. Nginx o'rnating
```bash
apt install -y nginx
```

### 8. Repo clone qiling
```bash
mkdir -p /var/www/bilimdon
cd /var/www/bilimdon
git clone https://github.com/Bekmuhammad-Devoloper/Bilimdon_ai.git .
```

### 9. Backend sozlang
```bash
cd /var/www/bilimdon/backend

# Dependencies o'rnating
npm install --production

# .env yarating
nano .env
```

**.env** fayl mazmuni:
```env
DATABASE_URL="postgresql://bilimdon_user:your_secure_password@localhost:5432/bilimdon?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
APP_DOMAIN=https://bilimdon-ai.uz
GEMINI_API_KEY=AIzaSyBbqPJKtk-vgzkfge7Ov-gDxGx-AFsCfsY
TELEGRAM_BOT_TOKEN=8587660548:AAHLSxk3aVyGhhQULFMTCtb_-yhRRb52-UY
TELEGRAM_BOT_USERNAME=Bilimdon_aibot
TELEGRAM_ADMIN_CHAT_ID=1235162999
WEBAPP_URL=https://bilimdon-ai.uz
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=bekmuhammad.devoloper@gmail.com
SMTP_PASS=mdpyuetdialjgxlb
SMTP_FROM_NAME=Bilimdon Platform
SMTP_FROM_EMAIL=bekmuhammad.devoloper@gmail.com
BACKEND_URL=https://api.bilimdon-ai.uz
CORS_ORIGIN=https://bilimdon-ai.uz
```

```bash
# Prisma generate va migrate
npx prisma generate
npx prisma migrate deploy

# Build
npm run build
```

### 10. Frontend sozlang
```bash
cd /var/www/bilimdon/frontend

# Dependencies o'rnating
npm install --production

# .env.production tekshiring (allaqachon mavjud)
cat .env.production

# Build
npm run build
```

### 11. Nginx sozlang
```bash
# Config faylini nusxalash
cp /var/www/bilimdon/nginx.conf /etc/nginx/sites-available/bilimdon
ln -sf /etc/nginx/sites-available/bilimdon /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test va restart
nginx -t
systemctl restart nginx
```

### 12. SSL sertifikat olish
```bash
apt install -y certbot python3-certbot-nginx

# Frontend uchun
certbot --nginx -d bilimdon-ai.uz -d www.bilimdon-ai.uz

# Backend uchun
certbot --nginx -d api.bilimdon-ai.uz
```

### 13. PM2 bilan ishga tushirish
```bash
cd /var/www/bilimdon

# Logs papkasini yarating
mkdir -p logs

# PM2 bilan ishga tushirish
pm2 start ecosystem.config.js --env production

# PM2 ni tizim bilan avtomatik ishga tushirish
pm2 save
pm2 startup
```

### 14. Telegram Webhook sozlash
```bash
curl -X POST "https://api.telegram.org/bot8587660548:AAHLSxk3aVyGhhQULFMTCtb_-yhRRb52-UY/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.bilimdon-ai.uz/api/telegram/webhook"}'
```

## 🔍 Tekshirish

```bash
# PM2 status
pm2 status

# PM2 logs
pm2 logs

# Nginx status
systemctl status nginx

# PostgreSQL status
systemctl status postgresql

# Redis status
systemctl status redis-server

# API tekshirish
curl https://api.bilimdon-ai.uz/api/health

# Frontend tekshirish
curl https://bilimdon-ai.uz
```

## 🔄 Yangilash

```bash
cd /var/www/bilimdon

# Yangi kodni olish
git pull origin main

# Backend yangilash
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build

# Frontend yangilash
cd ../frontend
npm install --production
npm run build

# PM2 restart
pm2 restart all
```

## 🛠 Foydali Komandalar

```bash
# PM2
pm2 status          # Status ko'rish
pm2 logs            # Loglarni ko'rish
pm2 restart all     # Barchasini restart
pm2 stop all        # Barchasini to'xtatish
pm2 delete all      # Barchasini o'chirish

# Nginx
nginx -t                    # Config tekshirish
systemctl restart nginx     # Restart
systemctl status nginx      # Status

# PostgreSQL
sudo -u postgres psql       # DB ga kirish
sudo -u postgres psql -d bilimdon  # bilimdon DB ga kirish

# Logs
tail -f /var/www/bilimdon/logs/backend-out.log
tail -f /var/www/bilimdon/logs/frontend-out.log
```

## ⚠️ Muammolar va Yechimlar

### 1. Port band
```bash
# Portni ishlatayotgan processni topish
lsof -i :3001
# Processni to'xtatish
kill -9 PID
```

### 2. Prisma xatosi
```bash
cd /var/www/bilimdon/backend
npx prisma generate
npx prisma migrate reset --force  # DIQQAT: Ma'lumotlar o'chadi!
```

### 3. SSL muammosi
```bash
certbot renew --dry-run
```

### 4. Xotira yetishmovchiligi
```bash
# Swap yaratish
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```
