# 🚀 Serverga Deploy Qilish Bo'yicha Qo'llanma

## ✅ Tayyor Bo'lgan O'zgarishlar

### 1. Environment Variables
- **Frontend**: `.env.production` yaratildi
- **Backend**: `.env.production.example` yaratildi (namuna sifatida)

### 2. Hardcoded URL lar Tuzatildi
Barcha `localhost:3001` URL lari `NEXT_PUBLIC_API_URL` environment variable bilan almashtirildi:
- `src/app/leaderboard/page.tsx`
- `src/app/ai/page.tsx`
- `src/app/profile/page.tsx`
- `src/components/ui/avatar.tsx`

### 3. CORS Sozlamalari
`backend/src/main.ts` da production domenlar qo'shildi:
- `https://bilimdon-ai.uz`
- `https://web.telegram.org`
- Vercel preview deployments (*.vercel.app)

### 4. Docker va Railway Config
- `backend/Dockerfile` - yangilandi
- `frontend/Dockerfile` - yangilandi
- `backend/Procfile` - yangilandi
- `frontend/Procfile` - yangilandi

---

## 📋 Deploy Qadamlari

### 1. GitHub'ga Push Qilish

```bash
cd c:\Users\Onyx_PC\Desktop\bilimdon

# O'zgarishlarni qo'shish
git add .
git commit -m "Production ready: CORS, env vars, hardcoded URLs fixed"
git push origin main
```

### 2. Railway'da Backend Deploy

1. https://railway.app ga kiring
2. "New Project" → "Deploy from GitHub repo"
3. `Bilimdon_ai` repo ni tanlang
4. **Root Directory**: `backend`
5. **Environment Variables** qo'shing:

```
DATABASE_URL=postgresql://...
REDIS_HOST=...
REDIS_PORT=6379
JWT_SECRET=your-secret-key-min-32-chars
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

6. Railway database yarating yoki Supabase/Neon dan foydalaning
7. Custom domain sozlang: `api.bilimdon-ai.uz`

### 3. Vercel'da Frontend Deploy

1. https://vercel.com ga kiring
2. "Add New Project" → GitHub repo tanlang
3. **Root Directory**: `frontend`
4. **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://api.bilimdon-ai.uz/api
NEXT_PUBLIC_APP_URL=https://bilimdon-ai.uz
NEXT_PUBLIC_APP_NAME=Bilimdon
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=Bilimdon_aibot
```

5. Deploy tugagach, custom domain sozlang: `bilimdon-ai.uz`

### 4. Database Migration

Railway'da yoki local'da:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### 5. Telegram Bot Webhook Sozlash

```bash
curl -X POST "https://api.telegram.org/bot8587660548:AAHLSxk3aVyGhhQULFMTCtb_-yhRRb52-UY/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.bilimdon-ai.uz/api/telegram/webhook"}'
```

---

## 🌐 DNS Sozlamalari

Domain provideringizda (bekmuhammad.uz yoki bilimdon-ai.uz):

### A Records
```
Type: A
Name: @
Value: (Vercel IP - 76.76.21.21)
```

### CNAME Records
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: CNAME
Name: api
Value: (Railway domain - your-app.railway.app)
```

---

## 📝 Tekshirish

Deploy tugagach tekshiring:

1. **Frontend**: https://bilimdon-ai.uz
2. **API**: https://api.bilimdon-ai.uz/api/docs
3. **Telegram Bot**: @Bilimdon_aibot

---

## ⚠️ E'tibor Bering

1. `.env` fayllarini GitHub'ga PUSH QILMANG!
2. Production'da `JWT_SECRET` ni o'zgartiring!
3. Database URL ni xavfsiz saqlang
4. SMTP password'ni app password sifatida ishlatng
