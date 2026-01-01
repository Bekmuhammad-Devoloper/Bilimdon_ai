# 📧 Email Verification Setup

## 🎯 Overview

Email verification tizimi foydalanuvchilarga **Gmail orqali tasdiqlash kodi yuborish** uchun tizimlanmoqda. Kod **10 daqiqa** davomida amal qiladi va o'z-o'zini tasdiqlaydi.

---

## 🔧 Backend Setup

### 1️⃣ Dependencies

Nodemailer allaqachon o'rnatilgan:
```bash
npm list nodemailer  # Check installation
```

### 2️⃣ Environment Variables

`.env` faylga qo'shing:
```env
# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-service-account@your-project.iam.gserviceaccount.com
SMTP_PASS=your-private-key-or-password
SMTP_FROM_NAME=Bilimdon Platform
SMTP_FROM_EMAIL=noreply@bilimdon.uz
```

### 3️⃣ Google Cloud Service Account Setup

1. **Console'ga kiring**: https://console.cloud.google.com
2. **Yangi proyekt yarating**: `Bilimdon`
3. **Gmail API'ni enable qiling**:
   - APIs & Services → Library
   - "Gmail API" izlang
   - ENABLE bosing
4. **Service Account yarating**:
   - APIs & Services → Credentials
   - "+ CREATE CREDENTIALS" → "Service Account"
   - Nomi: `bilimdon-mailer`
5. **Key yarating**:
   - Service account'ni tanlang → Keys → "+ ADD KEY"
   - Format: JSON
   - JSON faylni yuklab oling
6. **Credentials'ni .env'ga qo'shing**:
   - `client_email` → SMTP_USER
   - `private_key` → SMTP_PASS

---

## 📡 API Endpoints

### 1. Send Verification Code

**Request:**
```http
POST /api/auth/send-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Tasdiqlash kodi emailingizga yuborildi"
}
```

### 2. Verify Email

**Request:**
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email muvaffaqiyatli tasdiqlandi"
}
```

---

## 🎨 Frontend Implementation

### Register Page (`src/app/auth/register/page.tsx`)
✅ **Allaqachon implementatsiya qilindi**
- Email kiritish
- 6-raqamli kod kiritish
- Avtomatik verify (barcha raqamlar kiritilsa)
- Re-send option (60 saniya)

### Login Page (`src/app/auth/login/page.tsx`)
✅ **Allaqachon implementatsiya qilindi**
- Standard login form
- "Parolni unutdingizmi?" link
- Email verification flow uchun parol tiklanish

---

## 🧪 Testing

### 1️⃣ Test qilish uchun:

```bash
# Terminal 1: Backend ishga tushirish
cd backend
npm run start:dev

# Terminal 2: Frontend ishga tushirish
cd frontend
npm run dev
```

### 2️⃣ Register page'da test qiling:
1. http://localhost:3000/auth/register ga kiring
2. Email kiriting (test@gmail.com)
3. "Ro'yxatdan o'ting" bosing
4. Gmail inbox'ingizni tekshiring
5. 6-raqamli kodni ko'paytiring
6. Inputlarni to'ldiring - avtomatik verify bo'ladi

### 3️⃣ Login page'da parol tiklanish:
1. http://localhost:3000/auth/login ga kiring
2. "Parolni unutdingizmi?" bosing
3. Email kiriting
4. "Kod Yuborish" bosing
5. Gmail'dan kodni ko'paytiring
6. Kod kiritilsa - parol tiklanishni yakunlash

---

## 📊 Database Schema

```prisma
model EmailVerification {
  id        String   @id @default(uuid())
  email     String   @unique
  code      String   // 6-raqamli kod
  expiresAt DateTime // 10 daqiqalik muddati
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([email])
  @@index([code])
  @@index([expiresAt])
}
```

---

## 🔐 Security Features

✅ **6-Raqamli Random Kod**: Har safar yangi kod
✅ **10 Daqiqalik Muddati**: `Date.now() + 10 * 60 * 1000`
✅ **Bir Marta Verify**: `verified: true` flagi
✅ **Re-send Imkoniyati**: Hammasi ushbu query orqali override qilinadi
✅ **Email Hashing**: Har bir email unique index
✅ **Xatolik Xabarlari**: Muddati tugagan, noto'g'ri kod, va hokazo

---

## 🛡️ Error Handling

| Error | Response |
|-------|----------|
| Email not found | 400 - Tasdiqlash kodi topilmadi |
| Already verified | 400 - Email allaqachon tasdiqlangan |
| Wrong code | 400 - Noto'g\'ri tasdiqlash kodi |
| Expired code | 400 - Tasdiqlash kodi muddati tugagan |
| SMTP error | 500 - Email yuborishda xato |

---

## 🚀 Production Checklist

- [ ] Google Cloud Service Account setup (JSON key)
- [ ] SMTP_USER va SMTP_PASS .env'ga qo'shilgan
- [ ] Email templates HTML to'g'ri ko'rinadi
- [ ] 6-raqamli kod format to'g'ri
- [ ] Muddati 10 daqiqa
- [ ] Frontend validation working
- [ ] Error messages o'zbek tilida

---

## 📝 Notes

- Kod **10 daqiqa** davomida amal qiladi
- Yangi kod yuborilsa, eski kod o'rniga replace bo'ladi
- `verified: true` bo'lgan email yana tasdiqlana olmaydi
- Gmail SMTP qo'llaniladi (ya'ni boshqa email bilan emas)

---

**✨ Built with ❤️ for Bilimdon Platform**
