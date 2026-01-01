# 📧 Email Verification Sozlash - Bilimdon

## 🎯 Maqsad
Foydalanuvchilar **Gmail** orqali tasdiqlash kodi (verification code) olish uchun sistem sozlash.

---

## 📝 Xizmat Modeli

### Email Verification Modeli (Prisma Schema)
```prisma
model EmailVerification {
  id        String   @id @default(uuid())
  email     String   @unique
  code      String   // 6-raqamli kod
  expiresAt DateTime // 10 daqiqalik amal muddati
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([email])
  @@index([code])
  @@index([expiresAt])
}
```

---

## 🔐 Google Cloud Service Account Sozlash

### 1️⃣ Google Cloud Project Yaratish
1. https://console.cloud.google.com ga kiring
2. Yangi proyekt yarating: **Bilimdon**
3. Proyekt ID saqlab qo'ying

### 2️⃣ Gmail API'ni Enable Qilish
1. **APIs & Services** → **Library** bo'lim'iga o'ting
2. **"Gmail API"** ni izlang
3. **ENABLE** tugmasini bosing

### 3️⃣ Service Account Yaratish
1. **APIs & Services** → **Credentials**
2. **+ CREATE CREDENTIALS** → **Service Account**
3. Ma'lumotlarni to'ldiring:
   - **Service account name**: `bilimdon-mailer`
   - **Service account ID**: (avtomatik)
4. **CREATE AND CONTINUE**

### 4️⃣ Service Account Key Yaratish
1. Yaratilgan service account'ni tanlang
2. **Keys** tab'iga o'ting
3. **+ ADD KEY** → **Create new key**
4. Format: **JSON**
5. **CREATE** - JSON faylni yuklab oling

### 5️⃣ Credentials'ni .env'ga Qo'shish
JSON fayldan:
- `client_email` - SMTP_USER sifatida ishlatiladi
- `private_key` - SMTP_PASS sifatida ishlatiladi

**Misol:**
```env
SMTP_USER=bilimdon-mailer@bilimdon-12345.iam.gserviceaccount.com
SMTP_PASS=-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n
```

---

## 🔌 Backend Endpoints

### 1️⃣ Tasdiqlash Kodi Yuborish
```http
POST /api/auth/send-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Tasdiqlash kodi emailingizga yuborildi"
}
```

**Email Шablon:**
- ✨ **Elegant HTML shabloni** (CSS o'z ichiga oladi)
- 🔐 **6-raqamli kod** - ko'rinishi yaxshi
- ⏱️ **Muddati:** 10 daqiqa
- 🔔 **Warning:** Noto'g'ri transfer haqida xabarnoma

---

### 2️⃣ Email Tasdiqlanish
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Email muvaffaqiyatli tasdiqlandi"
}
```

---

## 🎨 Email Shablon

### Yuborilayotgan Email
```
┌─────────────────────────────────────────┐
│  🎓 Bilimdon Platform                   │
├─────────────────────────────────────────┤
│                                         │
│  Email Tasdiqlash                       │
│                                         │
│  Assalomu alaykum!                      │
│  Emailingizni tasdiqlash uchun           │
│  quyidagi kodni kiriting:               │
│                                         │
│      ┌─────────────────┐                │
│      │   1  2  3  4  5  6   │                │
│      └─────────────────┘                │
│                                         │
│  Bu kod 10 daqiqa davomida amal qiladi │
│                                         │
│  ⚠️ Agar siz bu kodni so'ramagan       │
│     bo'lsangiz, bu xabarni e'tiborsiz   │
│     qoldiring.                          │
│                                         │
├─────────────────────────────────────────┤
│  © 2025 Bilimdon                        │
│  Barcha huquqlar himoyalangan           │
│  Bu avtomatik xabar                     │
└─────────────────────────────────────────┘
```

---

## 🛡️ Security Features

✅ **Kod Muddati:** 10 daqiqa
✅ **6-Raqamli Random Kod:** `Math.random() * 900000`
✅ **Bir Marta Ishlatish:** `verified` flagi
✅ **Re-send Imkoniyati:** `upsert` operatsiyasi
✅ **Email Shash:** Har bir email uchun unique
✅ **Telegram Integratsiyasi:** Yo'nal tushunarli buyurtmalarga mo'ljallangan

---

## 💾 Database Integrity

### Muddati Tugagan Kodlarni Tozalash (Cron Job)
```typescript
// Backend'da har 30 daqiqada ishlash:
@Cron(CronExpression.EVERY_30_MINUTES)
async cleanExpiredVerificationCodes() {
  await this.prisma.emailVerification.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
}
```

---

## 🧪 Testing

### 1️⃣ Kod Yuborish
```bash
curl -X POST http://localhost:3001/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com"}'
```

### 2️⃣ Email Tekshirish
- Gmail inbox'ingizga o'ting
- "Bilimdon Platform" dan xabari topish
- 6-raqamli kodni ko'paytiring

### 3️⃣ Kodni Tasdiqlash
```bash
curl -X POST http://localhost:3001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","code":"123456"}'
```

---

## 🔗 Frontend Integration

### Register/Login Flow
1. **Foydalanuvchi** email kiritadi
2. **Frontend** → `POST /api/auth/send-verification`
3. **Backend** → Email yuboradi
4. **Foydalanuvchi** kodni oladi
5. **Foydalanuvchi** kodni kiritadi
6. **Frontend** → `POST /api/auth/verify-email`
7. **Backend** → `verified: true` o'rnatadi
8. **Foydalanuvchi** ro'yxatdan o'tadi

---

## 📞 Support
Masalalar bo'lsa, GitHub Issues'ga murojaat qiling yoki `admin@bilimdon.uz` ga yozing.

---

**🚀 Bilimdon - Bilim Olish Platformasi**
