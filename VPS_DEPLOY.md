# 🚀 Bilimdon - VPS Serverga Deploy Qilish

Bu qo'llanma sizning VPS serveringizga Bilimdon platformasini deploy qilish uchun to'liq ko'rsatmalar beradi.

## 📋 Talablar

- **VPS Server**: Ubuntu 22.04 LTS (yoki 20.04)
- **RAM**: Minimum 2GB (4GB tavsiya etiladi)
- **CPU**: 2 yadroli
- **Disk**: 20GB+ SSD
- **Domain**: bilimdon-ai.uz (yoki sizning domeningiz)

---

## 🔧 1-QADAM: VPS Serverni Tayyorlash

### 1.1 SSH orqali serverga ulanish
```bash
ssh root@YOUR_SERVER_IP
```

### 1.2 Yangi foydalanuvchi yaratish (xavfsizlik uchun)
```bash
adduser bilimdon
usermod -aG sudo bilimdon
su - bilimdon
```

### 1.3 Tizimni yangilash
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.4 Kerakli paketlarni o'rnatish
```bash
sudo apt install -y curl git wget nano ufw
```

---

## 🐳 2-QADAM: Docker O'rnatish

### 2.1 Docker Engine o'rnatish
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh
```

### 2.2 Docker Compose o'rnatish
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2.3 Docker ishlayotganini tekshirish
```bash
# Tizimga qayta kiring (docker guruhini faollashtirish uchun)
exit
ssh bilimdon@YOUR_SERVER_IP

# Versiyalarni tekshirish
docker --version
docker-compose --version
```

---

## 🔥 3-QADAM: Firewall Sozlash

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## 📁 4-QADAM: Loyiha Fayllarini Yuklash

### 4.1 Papka yaratish va repodan klonlash
```bash
mkdir -p ~/bilimdon
cd ~/bilimdon

# GitHub'dan klonlash
git clone https://github.com/Bekmuhammad-Devoloper/Bilimdon_ai.git .
```

### 4.2 Kerakli papkalarni yaratish
```bash
mkdir -p nginx/ssl
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p uploads/avatars uploads/attachments uploads/temp
```

---

## ⚙️ 5-QADAM: Environment Sozlash

### 5.1 .env faylni yaratish
```bash
cp .env.example .env
nano .env
```

### 5.2 .env faylni to'ldirish (quyidagi qiymatlarni o'zgartiring):
```bash
# ===========================================
# BILIMDON - VPS ENVIRONMENT VARIABLES
# ===========================================

# ============ DATABASE ============
# Kuchli parol kiriting (harflar, raqamlar, belgilar)
DB_PASSWORD=SizningKuchliParolingiz123!@#

# ============ JWT ============
# Tasodifiy uzun string (32+ belgi)
JWT_SECRET=juda_uzun_va_murakkab_maxfiy_kalit_1234567890abcdef

# ============ APP DOMAIN ============
# Sizning domeningiz
APP_DOMAIN=https://bilimdon-ai.uz
WEBAPP_URL=https://bilimdon-ai.uz
BACKEND_URL=https://api.bilimdon-ai.uz

# ============ FRONTEND ============
NEXT_PUBLIC_API_URL=https://api.bilimdon-ai.uz/api
NEXT_PUBLIC_WS_URL=wss://api.bilimdon-ai.uz

# ============ TELEGRAM BOT ============
# @BotFather dan olingan token
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
TELEGRAM_BOT_USERNAME=Bilimdon_aibot
# Admin chat ID (o'zingizning Telegram ID)
TELEGRAM_ADMIN_CHAT_ID=123456789

# ============ GEMINI AI ============
# Google AI Studio dan olingan API key
GEMINI_API_KEY=AIzaSy...

# ============ EMAIL (SMTP) ============
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
# Gmail App Password (2FA yoqilgan bo'lishi kerak)
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
SMTP_FROM_NAME=Bilimdon Platform
SMTP_FROM_EMAIL=your-email@gmail.com
```

Saqlash: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 🌐 6-QADAM: DNS Sozlash

Domen provayderingizda quyidagi DNS yozuvlarini qo'shing:

| Turi | Nom | Qiymat | TTL |
|------|-----|--------|-----|
| A | @ | YOUR_SERVER_IP | 3600 |
| A | www | YOUR_SERVER_IP | 3600 |
| A | api | YOUR_SERVER_IP | 3600 |

DNS yangilanishini kutish uchun 5-30 daqiqa vaqt kerak bo'lishi mumkin.

DNS tekshirish:
```bash
ping bilimdon-ai.uz
ping api.bilimdon-ai.uz
```

---

## 🔒 7-QADAM: SSL Sertifikatlarini Olish (Birinchi Marta)

### 7.1 HTTP rejimda nginx ishga tushirish

Avval SSL-siz nginx config yaratamiz:
```bash
nano nginx/nginx-init.conf
```

Quyidagini kiriting:
```nginx
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name bilimdon-ai.uz www.bilimdon-ai.uz api.bilimdon-ai.uz;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 'SSL sertifikat olinmoqda...';
            add_header Content-Type text/plain;
        }
    }
}
```

### 7.2 Certbot uchun nginx ishga tushirish
```bash
docker run -d --name temp-nginx \
  -p 80:80 \
  -v $(pwd)/nginx/nginx-init.conf:/etc/nginx/nginx.conf:ro \
  -v $(pwd)/certbot/www:/var/www/certbot:ro \
  nginx:alpine
```

### 7.3 SSL sertifikatlarini olish
```bash
docker run --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email sizning-email@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d bilimdon-ai.uz \
  -d www.bilimdon-ai.uz \
  -d api.bilimdon-ai.uz
```

### 7.4 Vaqtinchalik nginx'ni to'xtatish
```bash
docker stop temp-nginx
docker rm temp-nginx
```

---

## 🏗️ 8-QADAM: Barcha Servislarni Ishga Tushirish

### 8.1 Docker image'larni build qilish
```bash
cd ~/bilimdon
docker-compose build --no-cache
```

Bu jarayon 10-20 daqiqa davom etishi mumkin (birinchi marta).

### 8.2 Servislarni ishga tushirish
```bash
docker-compose up -d
```

### 8.3 Servislar holatini tekshirish
```bash
docker-compose ps
```

Barcha servislar "Up (healthy)" holatida bo'lishi kerak:
```
NAME                    STATUS
bilimdon-postgres       Up (healthy)
bilimdon-redis          Up (healthy)
bilimdon-backend        Up (healthy)
bilimdon-frontend       Up (healthy)
bilimdon-nginx          Up
bilimdon-certbot        Up
```

---

## 🗄️ 9-QADAM: Ma'lumotlar Bazasini Sozlash

### 9.1 Prisma migratsiyalarni ishga tushirish
```bash
docker-compose exec backend npx prisma migrate deploy
```

### 9.2 Admin foydalanuvchi yaratish (ixtiyoriy)
```bash
docker-compose exec backend npx ts-node scripts/create-admin.ts
```

---

## ✅ 10-QADAM: Tekshirish

### 10.1 Backend tekshirish
```bash
curl https://api.bilimdon-ai.uz/api/stats/public
```

### 10.2 Frontend tekshirish
Brauzerda oching: https://bilimdon-ai.uz

### 10.3 Loglarni ko'rish
```bash
# Barcha loglar
docker-compose logs -f

# Faqat backend
docker-compose logs -f backend

# Faqat frontend
docker-compose logs -f frontend

# Faqat nginx
docker-compose logs -f nginx
```

---

## 🔄 Yangilash (Update)

Yangi versiyani deploy qilish:
```bash
cd ~/bilimdon

# Yangi kodni olish
git pull origin main

# Image'larni qayta build qilish
docker-compose build --no-cache backend frontend

# Servislarni qayta ishga tushirish
docker-compose up -d

# Migratsiyalarni ishga tushirish (agar yangi bo'lsa)
docker-compose exec backend npx prisma migrate deploy
```

---

## 🛠️ Foydali Buyruqlar

### Servislarni boshqarish
```bash
# Barcha servislarni to'xtatish
docker-compose stop

# Barcha servislarni o'chirish (ma'lumotlar saqlanadi)
docker-compose down

# Barcha servislarni ishga tushirish
docker-compose up -d

# Bitta servisni qayta ishga tushirish
docker-compose restart backend
```

### Loglar va diagnostika
```bash
# Real-time loglar
docker-compose logs -f

# Oxirgi 100 qator log
docker-compose logs --tail=100 backend

# Container ichiga kirish
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d bilimdon
```

### Tozalash
```bash
# Foydalanilmayotgan image'larni o'chirish
docker image prune -a

# Barcha cache'ni tozalash
docker system prune -a
```

---

## ⚠️ Xatoliklarni Tuzatish

### "Port already in use" xatosi
```bash
# 80 va 443 portlardan foydalanayotgan servislarni topish
sudo lsof -i :80
sudo lsof -i :443

# Apache yoki nginx o'rnatilgan bo'lsa o'chirish
sudo systemctl stop apache2
sudo systemctl disable apache2
```

### Database connection xatosi
```bash
# PostgreSQL loglarini tekshirish
docker-compose logs postgres

# Database mavjudligini tekshirish
docker-compose exec postgres psql -U postgres -c "\l"
```

### SSL sertifikat muammolari
```bash
# Sertifikatlarni yangilash
docker-compose run --rm certbot renew

# Nginx'ni qayta ishga tushirish
docker-compose restart nginx
```

### Container'lar ishga tushmasa
```bash
# Batafsil xatolikni ko'rish
docker-compose logs backend
docker-compose logs frontend

# Container'ni qayta build qilish
docker-compose build --no-cache backend
docker-compose up -d backend
```

---

## 📊 Monitoring

### Disk hajmini tekshirish
```bash
df -h
docker system df
```

### RAM va CPU
```bash
htop
docker stats
```

### SSL sertifikat muddatini tekshirish
```bash
echo | openssl s_client -servername bilimdon-ai.uz -connect bilimdon-ai.uz:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 🔐 Xavfsizlik Tavsiялари

1. **Root login'ni o'chiring** - SSH faqat oddiy user bilan
2. **SSH key authentication** - Parol o'rniga SSH key ishlating
3. **Muntazam yangilash** - `sudo apt update && sudo apt upgrade -y`
4. **Backup** - Ma'lumotlar bazasini muntazam backup qiling:
```bash
docker-compose exec postgres pg_dump -U postgres bilimdon > backup_$(date +%Y%m%d).sql
```

---

## 📞 Yordam

Muammolar yuzaga kelsa:
- GitHub Issues: https://github.com/Bekmuhammad-Devoloper/Bilimdon_ai/issues
- Telegram: @Bekmuhammad_Devoloper

---

**Muvaffaqiyatli deploy! 🎉**
