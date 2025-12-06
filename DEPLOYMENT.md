# 🚀 Domenga Deploy Qilish - To'liq Yo'riqnoma

## Sizning domen: **bekmuhammad.uz** (yoki boshqa)

---

## 📋 Reja

1. ✅ GitHub'ga kod yuklash
2. ✅ Frontend deploy (Vercel/Netlify - bepul)
3. ✅ Backend deploy (VPS/Railway - bepul tier)
4. ✅ Database (Supabase/Railway - bepul)
5. ✅ Telegram Bot sozlash

---

## 1️⃣ GitHub Repository Yaratish

### Terminal'da:

```bash
cd c:\Users\Onyx_PC\Desktop\bilimdon

# Git init (agar qilinmagan bo'lsa)
git init

# Fayllarni qo'shish
git add .

# Commit
git commit -m "Initial commit: Bilimdon Platform"

# GitHub'da repository yarating: https://github.com/new
# Repository name: bilimdon_aibot

# Remote qo'shish
git remote add origin https://github.com/bekmuhammad/bilimdon_aibot.git

# Push
git branch -M main
git push -u origin main
```

---

## 2️⃣ Frontend Deploy (Vercel - BEPUL)

### A) Vercel'da account oching
https://vercel.com

### B) GitHub bilan ulanish
- "Add New Project"
- GitHub repo tanlang: `bekmuhammad/bilimdon_aibot`
- Root Directory: `frontend`

### C) Environment Variables (.env)

```env
NEXT_PUBLIC_API_URL=https://api.bekmuhammad.uz/api
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=Bilimdon_aibot
NEXT_PUBLIC_APP_URL=https://bekmuhammad.uz
```

### D) Deploy!

**Natija:**
```
https://bilimdon-aibot.vercel.app
```

### E) Custom Domain sozlash

Vercel Dashboard → Settings → Domains:
```
bekmuhammad.uz
```

DNS sozlamalar (domain provideringizda):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.21.21
```

---

## 3️⃣ Backend Deploy (Railway - BEPUL 500 soat/oy)

### A) Railway'da account oching
https://railway.app

### B) New Project
- "Deploy from GitHub"
- Repository: `bekmuhammad/bilimdon_aibot`
- Root Directory: `backend`

### C) PostgreSQL qo'shish
- "Add Database" → PostgreSQL
- Railway avtomatik DATABASE_URL beradi

### D) Environment Variables

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production

# Telegram
TELEGRAM_BOT_TOKEN=8587660548:AAHLSxk3aVyGhhQULFMTCtb_-yhRRb52-UY
TELEGRAM_BOT_USERNAME=Bilimdon_aibot
WEBAPP_URL=https://bekmuhammad.uz

# Email (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_FROM="Bilimdon Platform <noreply@bekmuhammad.uz>"

# Gemini AI
GEMINI_API_KEY=AIzaSyDgc_ucOp-PTp4yBNydm1iR6w0ANhquZKA

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting  
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### E) Custom Domain

Railway Settings → Domains:
```
api.bekmuhammad.uz
```

DNS (domain provideringizda):
```
Type: CNAME
Name: api
Value: your-railway-app.up.railway.app
```

---

## 4️⃣ Database Migration

Railway Dashboard → PostgreSQL → Connect

```bash
# Local terminalda
DATABASE_URL="postgresql://user:pass@host/db" npx prisma migrate deploy
DATABASE_URL="postgresql://user:pass@host/db" npm run prisma:seed
```

Yoki Railway'da deploy script:
```json
// backend/package.json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main",
    "railway:deploy": "prisma migrate deploy && prisma generate && npm run start:prod"
  }
}
```

---

## 5️⃣ Telegram Bot Sozlash

### BotFather'da:

```
/mybots
→ @Bilimdon_aibot
→ Bot Settings
→ Menu Button
→ Configure Menu Button
```

**URL:**
```
https://bekmuhammad.uz
```

**Button:**
```
Open App
```

### Webhook (ixtiyoriy):

```bash
curl -X POST https://api.bekmuhammad.uz/api/telegram/admin/set-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"webhookUrl": "https://api.bekmuhammad.uz/api/telegram/webhook"}'
```

---

## 6️⃣ SSL Sertifikat

✅ Vercel: Avtomatik HTTPS  
✅ Railway: Avtomatik HTTPS  
✅ Custom domain: Let's Encrypt (avtomatik)

---

## 7️⃣ Test Qilish

### Frontend:
```
https://bekmuhammad.uz
```

### Backend API:
```
https://api.bekmuhammad.uz/api/docs
```

### Telegram Bot:
```
@Bilimdon_aibot → /start → Open App
```

---

## 💰 Narxlar (Barchasi BEPUL boshlash uchun)

- ✅ **GitHub:** Bepul
- ✅ **Vercel:** Bepul (100GB bandwidth/oy)
- ✅ **Railway:** Bepul (500 soat/oy, ~$5/oy keyinchalik)
- ✅ **Domain:** $5-15/yil (sizda bor)
- ✅ **SSL:** Bepul (Let's Encrypt)

**Jami:** Domain narxi + Railway ($5/oy ko'p foydalanuvchi uchun)

---

## 🔧 Qo'shimcha Sozlamalar

### Email (Gmail App Password):

1. Google Account → Security
2. 2-Step Verification yoqing
3. App Passwords yarating
4. Kodni `.env` ga qo'shing

### Gemini API Key:

1. https://makersuite.google.com/app/apikey
2. API key yarating
3. `.env` ga qo'shing

---

## 📊 Monitoring

- **Vercel:** Analytics (bepul)
- **Railway:** Metrics va logs (built-in)
- **Telegram:** Bot analytics (@BotFather)

---

## ⚡ Deploy Qilish

```bash
# Frontend (Vercel avtomatik)
git push origin main

# Backend (Railway avtomatik)  
git push origin main
```

Har ikkisi ham GitHub'ga push qilganingizda avtomatik deploy bo'ladi!

---

**Hammasi tayyor! 🚀**

Test: https://bekmuhammad.uz
