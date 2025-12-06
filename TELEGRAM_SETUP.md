# Telegram Mini App Sozlash

## 1. BotFather orqali Mini App sozlash

### Qadamlar:

1. **Telegram'da BotFather'ni oching**: [@BotFather](https://t.me/BotFather)

2. **Mini App sozlang**:
   ```
   /mybots
   → @Bilimdon_aibot ni tanlang
   → Bot Settings
   → Menu Button
   → Configure Menu Button
   ```

3. **URL kiriting**:
   ```
   Production: https://bilimdon.uz
   Development: https://your-ngrok-url.ngrok.io
   ```
   
   ⚠️ **Muhim**: Telegram faqat HTTPSURLlarni qabul qiladi!

4. **Menu Button nomini kiriting**:
   ```
   Open App
   yoki
   Bilimdon Platform
   ```

## 2. Development uchun ngrok sozlash

Lokal serveringizni Telegram bilan ishlash uchun HTTPS orqali ochish:

### ngrok o'rnatish:
```bash
# Windows (chocolatey)
choco install ngrok

# yoki https://ngrok.com/download dan yuklab oling
```

### ngrok ishga tushirish:
```bash
# Frontend uchun (port 3000)
ngrok http 3000
```

Natija:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

Bu `https://abc123.ngrok.io` URLni BotFather'ga kiriting.

## 3. Backend webhook sozlash (ixtiyoriy)

Agar bot commandlari bilan ishlashni istasangiz:

```bash
# Backend uchun webhook
ngrok http 3001
```

Keyin Swagger orqali webhook o'rnating:
```
POST http://localhost:3001/api/telegram/admin/set-webhook
{
  "webhookUrl": "https://your-backend-ngrok.ngrok.io/api/telegram/webhook"
}
```

## 4. Botni test qilish

1. Telegram'da `@Bilimdon_aibot` ni oching
2. `/start` buyrug'ini yuboring
3. Pastki menuda "Open App" tugmasi paydo bo'ladi
4. Tugmani bosing - frontend ochiladi!

## 5. Muammolarni hal qilish

### Mini App ochmayapti:
- ✅ BotFather'da Menu Button sozlanganini tekshiring
- ✅ URL HTTPS ekanligini tekshiring
- ✅ Frontend server ishlab turganini tekshiring
- ✅ Browser console'da xatolarni tekshiring

### Telegram Web App script yuklanmayapti:
`frontend/src/app/layout.tsx` faylida mavjudligini tekshiring:
```tsx
<script src="https://telegram.org/js/telegram-web-app.js" async />
```

### InitData validatsiya xatosi:
- Backend `.env` da `TELEGRAM_BOT_TOKEN` to'g'riligini tekshiring
- Frontend `.env.local` da `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` to'g'riligini tekshiring

## 6. Production uchun

Production'da ngrok o'rniga real domain ishlatiladi:

1. **Frontend deploy** (Vercel/Netlify):
   ```
   https://bilimdon.uz
   ```

2. **BotFather'da URL yangilash**:
   ```
   /mybots → @Bilimdon_aibot → Bot Settings → Menu Button
   URL: https://bilimdon.uz
   ```

3. **Backend webhook** (agar kerak bo'lsa):
   ```
   https://api.bilimdon.uz/api/telegram/webhook
   ```

## 7. Hozirgi sozlamalar

### Backend `.env`:
```env
TELEGRAM_BOT_TOKEN=8587660548:AAHLSxk3aVyGhhQULFMTCtb_-yhRRb52-UY
TELEGRAM_BOT_USERNAME=Bilimdon_aibot
WEBAPP_URL=http://localhost:3000
```

### Frontend `.env.local`:
```env
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=Bilimdon_aibot
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 8. Test uchun URL

Development:
```
Mini App link: https://t.me/Bilimdon_aibot
Sozlashdan keyin: Menu Button → Open App
```

Qo'lda ochish (BotFather sozlanmagan bo'lsa):
```
Browser'da: http://localhost:3000?tgWebAppPlatform=web
```

---

**Yordam kerakmi?**
- Telegram: @Bilimdon_aibot
- Issues: GitHub repository
