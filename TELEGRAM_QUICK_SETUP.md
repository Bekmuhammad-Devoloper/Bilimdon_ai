# ⚡ Tezkor Telegram Bot Sozlash

## 🎯 Muammo: Botda frontend ochmayapti

### ✅ Yechim: BotFather orqali Menu Button sozlash

## 📱 Qadamlar (5 daqiqa):

### 1️⃣ BotFather'ni oching
Telegram'da: [@BotFather](https://t.me/BotFather)

### 2️⃣ Komandalarni yuboring:
```
/mybots
```
Keyin `@Bilimdon_aibot` ni tanlang

### 3️⃣ Menu Button sozlang:
```
Bot Settings → Menu Button → Configure Menu Button
```

### 4️⃣ URL kiriting:

**Development (ngrok bilan):**
```
https://your-ngrok-url.ngrok.io
```

**Yoki test uchun (HTTPS)::**
```
https://bilimdon.uz
```

### 5️⃣ Button nomini kiriting:
```
Open App
```

### 6️⃣ Test qiling:
```
/start
```
Pastki menuda "Open App" tugmasi paydo bo'ladi!

---

## 🔧 Ngrok bilan local frontend'ni HTTPS qilish:

### Ngrok o'rnatish (Windows):
```powershell
# PowerShell'da
winget install ngrok
```

### Ishga tushirish:
```powershell
ngrok http 3000
```

Natija:
```
Forwarding: https://abc123.ngrok-free.app → http://localhost:3000
```

Bu URLni BotFather'ga kiriting!

---

## ❌ Agar ngrok bo'lmasa:

Hozircha browserda test qiling:
```
http://localhost:3000
```

Console'da:
```javascript
window.Telegram.WebApp.initData
```

Agar `undefined` bo'lsa - bu normal, chunki Telegram'dan ochilmagan.

---

## 🚀 To'liq ishlashi uchun:

1. ✅ Backend: `http://localhost:3001` (ishlamoqda)
2. ✅ Frontend: `http://localhost:3000` (ishlamoqda)  
3. ⚠️ **Telegram Mini App**: BotFather'da sozlash kerak
4. ⚠️ **HTTPS**: ngrok yoki deploy qilish kerak

---

**Hozir qilish kerak:**
1. Ngrok o'rnating va ishga tushiring
2. HTTPS URL oling
3. BotFather'da Menu Button sozlang
4. Botni oching va "Open App" bosing!
