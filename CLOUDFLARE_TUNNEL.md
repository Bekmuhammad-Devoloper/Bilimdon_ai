# 🚀 Telegram Mini App - Cloudflare Tunnel bilan

## ✅ Domain siz, bepul, tezkor!

### 1. Cloudflared o'rnatish

**Windows (PowerShell):**
```powershell
# Yuklab oling
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"

# Yoki winget bilan
winget install Cloudflare.cloudflared
```

### 2. Frontend'ni expose qiling

```powershell
cloudflared tunnel --url http://localhost:3000
```

**Natija:**
```
Your quick Tunnel has been created! Visit it at:
https://random-name-abc123.trycloudflare.com
```

### 3. BotFather'da sozlang

1. Telegram'da **@BotFather** oching
2. Quyidagi komandalarni yuboring:

```
/mybots
```
→ `@Bilimdon_aibot` tanlang
```
Bot Settings
→ Menu Button  
→ Configure Menu Button
```

3. **URL kiriting:**
```
https://random-name-abc123.trycloudflare.com
```

4. **Button text:**
```
Open App
```

### 4. Test qiling!

1. `@Bilimdon_aibot` ni oching
2. `/start` bosing
3. Pastda **"Open App"** tugmasi paydo bo'ladi
4. Bosing va frontend ochiladi! 🎉

---

## ⚡ Afzalliklari:

✅ Bepul  
✅ Domain kerak emas  
✅ Tez sozlanadi (2 daqiqa)  
✅ HTTPS avtomatik  
✅ Account yaratish kerak emas

---

## 🔄 Har safar ishga tushirish:

```powershell
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend  
cd frontend
npm run dev

# Terminal 3: Cloudflare tunnel
cloudflared tunnel --url http://localhost:3000
```

**Eslatma:** Har safar tunnel URL o'zgaradi, BotFather'da yangilashingiz kerak!

---

## 💡 Doimiy URL uchun:

Cloudflare account ochib, doimiy tunnel yaratishingiz mumkin (bepul):

```powershell
# Login
cloudflared tunnel login

# Tunnel yaratish
cloudflared tunnel create bilimdon

# Config
cloudflared tunnel route dns bilimdon bilimdon.example.com

# Ishga tushirish
cloudflared tunnel run bilimdon
```

Lekin bu qo'shimcha sozlamalar talab qiladi.
