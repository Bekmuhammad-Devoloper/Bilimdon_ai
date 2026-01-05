#!/bin/bash

# ===========================================
# BILIMDON - VPS DEPLOY SCRIPT
# ===========================================
# Bu skriptni VPS serverda ishga tushiring

set -e

echo "🚀 Bilimdon Deploy Script"
echo "========================="

# Ranglar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. System update
echo -e "${YELLOW}[1/8] Tizimni yangilash...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. Docker installation
echo -e "${YELLOW}[2/8] Docker o'rnatish...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}Docker o'rnatildi!${NC}"
else
    echo -e "${GREEN}Docker allaqachon o'rnatilgan${NC}"
fi

# 3. Docker Compose installation
echo -e "${YELLOW}[3/8] Docker Compose o'rnatish...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose o'rnatildi!${NC}"
else
    echo -e "${GREEN}Docker Compose allaqachon o'rnatilgan${NC}"
fi

# 4. Create directories
echo -e "${YELLOW}[4/8] Papkalar yaratish...${NC}"
mkdir -p ~/bilimdon
mkdir -p ~/bilimdon/nginx/ssl
mkdir -p ~/bilimdon/certbot/conf
mkdir -p ~/bilimdon/certbot/www
cd ~/bilimdon

# 5. Clone repository (agar mavjud bo'lmasa)
echo -e "${YELLOW}[5/8] Repositoriyani klonlash...${NC}"
if [ ! -d ".git" ]; then
    git clone https://github.com/Bekmuhammad-Devoloper/Bilimdon_ai.git .
    echo -e "${GREEN}Repository klonlandi!${NC}"
else
    git pull origin main
    echo -e "${GREEN}Repository yangilandi!${NC}"
fi

# 6. Check .env file
echo -e "${YELLOW}[6/8] .env faylni tekshirish...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}XATO: .env fayl topilmadi!${NC}"
    echo -e "${YELLOW}.env.example faylidan nusxa oling va to'ldiring:${NC}"
    echo "cp .env.example .env"
    echo "nano .env"
    exit 1
fi
echo -e "${GREEN}.env fayl topildi!${NC}"

# 7. SSL Certificates (first time only)
echo -e "${YELLOW}[7/8] SSL sertifikatlarini olish...${NC}"
if [ ! -f "certbot/conf/live/bilimdon-ai.uz/fullchain.pem" ]; then
    echo -e "${YELLOW}SSL sertifikatlarini olish uchun birinchi marta nginx'ni HTTP rejimida ishga tushiramiz...${NC}"
    
    # Temporarily run nginx without SSL
    docker-compose up -d nginx
    
    # Get certificates
    docker-compose run --rm certbot certonly --webroot \
        --webroot-path=/var/www/certbot \
        --email your-email@example.com \
        --agree-tos \
        --no-eff-email \
        -d bilimdon-ai.uz \
        -d www.bilimdon-ai.uz \
        -d api.bilimdon-ai.uz
    
    # Restart nginx with SSL
    docker-compose restart nginx
    echo -e "${GREEN}SSL sertifikatlari olindi!${NC}"
else
    echo -e "${GREEN}SSL sertifikatlari mavjud${NC}"
fi

# 8. Build and run
echo -e "${YELLOW}[8/8] Docker konteynerlarni build qilish va ishga tushirish...${NC}"
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

# Check status
echo ""
echo -e "${GREEN}✅ Deploy muvaffaqiyatli!${NC}"
echo ""
echo "📊 Konteynerlar holati:"
docker-compose ps
echo ""
echo "🔗 URL'lar:"
echo "   Frontend: https://bilimdon-ai.uz"
echo "   Backend:  https://api.bilimdon-ai.uz"
echo "   API Docs: https://api.bilimdon-ai.uz/api/docs"
echo ""
echo "📋 Loglarni ko'rish:"
echo "   docker-compose logs -f"
echo ""
echo "🔄 Qayta ishga tushirish:"
echo "   docker-compose restart"
echo ""
