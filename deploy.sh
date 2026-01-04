#!/bin/bash

# Bilimdon Platform - VPS Deploy Script
# Ubuntu 20.04/22.04 LTS uchun

set -e

echo "🚀 Bilimdon Platform Deploy Script"
echo "=================================="

# Variables
APP_DIR="/var/www/bilimdon"
REPO_URL="https://github.com/Bekmuhammad-Devoloper/Bilimdon_ai.git"
BRANCH="main"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Iltimos, root sifatida ishga tushiring: sudo ./deploy.sh${NC}"
    exit 1
fi

echo -e "${YELLOW}1. Tizimni yangilash...${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}2. Node.js 20.x o'rnatish...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo -e "${YELLOW}3. PM2 global o'rnatish...${NC}"
npm install -g pm2

echo -e "${YELLOW}4. Nginx o'rnatish...${NC}"
apt install -y nginx

echo -e "${YELLOW}5. PostgreSQL o'rnatish...${NC}"
apt install -y postgresql postgresql-contrib

echo -e "${YELLOW}6. Redis o'rnatish...${NC}"
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server

echo -e "${YELLOW}7. Git o'rnatish...${NC}"
apt install -y git

echo -e "${YELLOW}8. Certbot (SSL) o'rnatish...${NC}"
apt install -y certbot python3-certbot-nginx

echo -e "${YELLOW}9. App papkasini yaratish...${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

echo -e "${YELLOW}10. Reponi clone qilish...${NC}"
if [ -d ".git" ]; then
    git pull origin $BRANCH
else
    git clone $REPO_URL .
fi

echo -e "${YELLOW}11. Backend dependencies o'rnatish...${NC}"
cd $APP_DIR/backend
npm install --production
npx prisma generate

echo -e "${YELLOW}12. Frontend dependencies o'rnatish...${NC}"
cd $APP_DIR/frontend
npm install --production

echo -e "${YELLOW}13. Frontend build qilish...${NC}"
npm run build

echo -e "${YELLOW}14. Backend build qilish...${NC}"
cd $APP_DIR/backend
npm run build

echo -e "${YELLOW}15. Logs papkasini yaratish...${NC}"
mkdir -p $APP_DIR/logs

echo -e "${YELLOW}16. Nginx konfiguratsiyasini sozlash...${NC}"
cp $APP_DIR/nginx.conf /etc/nginx/sites-available/bilimdon
ln -sf /etc/nginx/sites-available/bilimdon /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo -e "${YELLOW}17. Nginx tekshirish va restart...${NC}"
nginx -t
systemctl restart nginx

echo -e "${YELLOW}18. PM2 bilan ilovalarni ishga tushirish...${NC}"
cd $APP_DIR
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

echo -e "${GREEN}=================================="
echo "✅ Deploy muvaffaqiyatli yakunlandi!"
echo "=================================="
echo ""
echo "Keyingi qadamlar:"
echo "1. Backend .env faylini yarating:"
echo "   nano $APP_DIR/backend/.env"
echo ""
echo "2. Database yarating va migrate qiling:"
echo "   sudo -u postgres createdb bilimdon"
echo "   cd $APP_DIR/backend && npx prisma migrate deploy"
echo ""
echo "3. SSL sertifikat olish:"
echo "   certbot --nginx -d bilimdon-ai.uz -d www.bilimdon-ai.uz"
echo "   certbot --nginx -d api.bilimdon-ai.uz"
echo ""
echo "4. PM2 statusini tekshirish:"
echo "   pm2 status"
echo "   pm2 logs"
echo ""
echo -e "${NC}"
