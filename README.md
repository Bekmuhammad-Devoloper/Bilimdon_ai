# 🎓 Bilimdon - Ta'lim Platformasi

🌐 **Live:** https://bilimdon-ai.uz

Bilimdon - bu turli fanlar bo'yicha test topshirish, bilim darajasini aniqlash, reytingda raqobatlashish va AI yordamchisi orqali savollar so'rash imkoniyatiga ega zamonaviy ta'lim platformasi.

## ✅ Loyiha Holati

✅ Backend: **Muvaffaqiyatli kompilyatsiya qilindi**  
✅ Frontend: **Muvaffaqiyatli kompilyatsiya qilindi**  
✅ Database Schema: **To'g'ri konfiguratsiya qilindi**  
✅ Dependencies: **Barcha paketlar o'rnatildi**

## 🚀 Xususiyatlar

### 📚 Test Tizimi
- 30+ kategoriya (dasturlash, matematika, tillar va boshqalar)
- Har bir kategoriyada 350+ savol
- 10 ta random savoldan iborat testlar
- Qiyinlik darajalari (oson, o'rta, qiyin)
- Test natijalarini ko'rish va tahlil qilish

### 💰 XP va Level Tizimi
- Har bir to'g'ri javob uchun XP
- Level tizimi (11+ levellar)
- Achievement'lar va bonuslar

### 🏆 Reyting Tizimi
- Umumiy reyting (Top 100)
- Haftalik va oylik reytinglar
- Kategoriya bo'yicha reyting

### 🤖 AI Yordamchi
- Google Gemini AI integratsiyasi
- O'zbek tilida javoblar
- Kod va formula qo'llab-quvvatlash
- Chat tarixi

### 📱 Telegram Mini App
- Telegram orqali kirish
- WebApp integratsiyasi
- Push bildirishnomalar

## 🛠 Texnologiyalar

### Backend
- **NestJS** - Node.js framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Autentifikatsiya
- **Socket.io** - Real-time
- **Google Gemini** - AI

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Socket.io-client** - Real-time

## 📦 O'rnatish

### 1. Repository klonlash
```bash
git clone https://github.com/your-username/bilimdon.git
cd bilimdon
```

### 2. Backend sozlash
```bash
cd backend
npm install

# .env faylini yaratish
cp .env.example .env
# .env faylini tahrirlang

# Database migration
npx prisma migrate dev

# Seed data
npm run prisma:seed

# Server ishga tushirish
npm run start:dev
```

### 3. Frontend sozlash
```bash
cd frontend
npm install

# .env faylini yaratish
cp .env.example .env.local
# .env.local faylini tahrirlang

# Development server
npm run dev
```

## 🌐 API Endpoints

### Auth
- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Kirish
- `GET /api/auth/profile` - Profil olish
- `POST /api/telegram/webapp/auth` - Telegram auth

### Tests
- `POST /api/tests/start` - Test boshlash
- `POST /api/tests/:id/submit` - Test yuborish
- `GET /api/tests/:id/result` - Natija olish

### Leaderboard
- `GET /api/leaderboard/global` - Umumiy reyting
- `GET /api/leaderboard/weekly` - Haftalik
- `GET /api/leaderboard/monthly` - Oylik

### AI
- `POST /api/ai/chat` - AI bilan suhbat
- `GET /api/ai/history` - Chat tarixi
- `GET /api/ai/usage` - Foydalanish statistikasi

## 📁 Loyiha Strukturasi

```
bilimdon/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── categories/
│   │   │   ├── questions/
│   │   │   ├── tests/
│   │   │   ├── leaderboard/
│   │   │   ├── ai/
│   │   │   ├── achievements/
│   │   │   ├── notifications/
│   │   │   ├── admin/
│   │   │   ├── upload/
│   │   │   └── telegram/
│   │   ├── prisma/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (pages)/
│   │   │   ├── auth/
│   │   │   ├── categories/
│   │   │   ├── test/
│   │   │   ├── leaderboard/
│   │   │   ├── ai/
│   │   │   ├── profile/
│   │   │   └── notifications/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   └── layout/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── store/
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
GEMINI_API_KEY=your-api-key
TELEGRAM_BOT_TOKEN=your-bot-token
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📱 Telegram Bot Sozlash

1. [@BotFather](https://t.me/BotFather) orqali yangi bot yarating
2. Bot tokenini oling va `.env` ga qo'shing
3. WebApp manzilini sozlang:
   ```
   /setmenubutton
   -> Bot tanlang
   -> Web App URL: https://your-domain.com
   ```

## 🚀 Deployment

### Backend (Railway/Render)
1. PostgreSQL database yarating
2. Environment variables sozlang
3. Deploy qiling

### Frontend (Vercel)
1. Repository'ni ulang
2. Environment variables sozlang
3. Deploy qiling

## 📄 License

MIT License

## 👨‍💻 Muallif

Bekmuhammad - Full Stack Developer

---

⭐ Agar loyiha yoqsa, star qo'ying!
