import { PrismaClient, Difficulty, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ==================== CATEGORIES ====================
  const categories = [
    // Dasturlash tillari
    { name: 'Python', slug: 'python', description: 'Python dasturlash tili', icon: '🐍', color: '#3776AB', order: 1 },
    { name: 'JavaScript', slug: 'javascript', description: 'JavaScript dasturlash tili', icon: '💛', color: '#F7DF1E', order: 2 },
    { name: 'TypeScript', slug: 'typescript', description: 'TypeScript dasturlash tili', icon: '💙', color: '#3178C6', order: 3 },
    { name: 'Java', slug: 'java', description: 'Java dasturlash tili', icon: '☕', color: '#007396', order: 4 },
    { name: 'C++', slug: 'cpp', description: 'C++ dasturlash tili', icon: '⚡', color: '#00599C', order: 5 },
    { name: 'Go', slug: 'golang', description: 'Go dasturlash tili', icon: '🔵', color: '#00ADD8', order: 6 },
    { name: 'Rust', slug: 'rust', description: 'Rust dasturlash tili', icon: '🦀', color: '#DEA584', order: 7 },
    
    // Frontend
    { name: 'React', slug: 'react', description: 'React JavaScript kutubxonasi', icon: '⚛️', color: '#61DAFB', order: 10 },
    { name: 'Next.js', slug: 'nextjs', description: 'Next.js React framework', icon: '▲', color: '#000000', order: 11 },
    { name: 'Vue.js', slug: 'vuejs', description: 'Vue.js framework', icon: '💚', color: '#4FC08D', order: 12 },
    { name: 'HTML/CSS', slug: 'html-css', description: 'HTML va CSS asoslari', icon: '🎨', color: '#E34F26', order: 13 },
    { name: 'Tailwind CSS', slug: 'tailwind', description: 'Tailwind CSS framework', icon: '🌊', color: '#06B6D4', order: 14 },
    
    // Backend
    { name: 'Node.js', slug: 'nodejs', description: 'Node.js runtime', icon: '💚', color: '#339933', order: 20 },
    { name: 'NestJS', slug: 'nestjs', description: 'NestJS framework', icon: '🐈', color: '#E0234E', order: 21 },
    { name: 'Express.js', slug: 'expressjs', description: 'Express.js framework', icon: '🚂', color: '#000000', order: 22 },
    { name: 'Django', slug: 'django', description: 'Django Python framework', icon: '🌿', color: '#092E20', order: 23 },
    
    // Database
    { name: 'SQL', slug: 'sql', description: 'SQL so\'rovlar tili', icon: '🗃️', color: '#4479A1', order: 30 },
    { name: 'PostgreSQL', slug: 'postgresql', description: 'PostgreSQL database', icon: '🐘', color: '#336791', order: 31 },
    { name: 'MongoDB', slug: 'mongodb', description: 'MongoDB NoSQL database', icon: '🍃', color: '#47A248', order: 32 },
    { name: 'Redis', slug: 'redis', description: 'Redis cache database', icon: '🔴', color: '#DC382D', order: 33 },
    
    // DevOps
    { name: 'Docker', slug: 'docker', description: 'Docker containerization', icon: '🐳', color: '#2496ED', order: 40 },
    { name: 'Git', slug: 'git', description: 'Git version control', icon: '📦', color: '#F05032', order: 41 },
    { name: 'Linux', slug: 'linux', description: 'Linux operatsion tizimi', icon: '🐧', color: '#FCC624', order: 42 },
    
    // Fanlar
    { name: 'Matematika', slug: 'matematika', description: 'Umumiy matematika', icon: '🔢', color: '#9C27B0', order: 50 },
    { name: 'Fizika', slug: 'fizika', description: 'Fizika fani', icon: '⚛️', color: '#2196F3', order: 51 },
    { name: 'Ingliz tili', slug: 'english', description: 'Ingliz tili grammatikasi', icon: '🇬🇧', color: '#FF5722', order: 52 },
    { name: 'Tarix', slug: 'tarix', description: 'Jahon va O\'zbekiston tarixi', icon: '📜', color: '#795548', order: 53 },
  ];

  console.log('📁 Creating categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: { ...cat, isActive: true },
    });
  }

  // ==================== ACHIEVEMENTS ====================
  const achievements = [
    // Boshlang'ich
    { name: 'Birinchi qadam', description: 'Birinchi testni topshiring', icon: '🎯', condition: { type: 'tests', value: 1 }, xpReward: 50, order: 1 },
    { name: 'Faol o\'quvchi', description: '10 ta test topshiring', icon: '📚', condition: { type: 'tests', value: 10 }, xpReward: 100, order: 2 },
    { name: 'Tajribali', description: '50 ta test topshiring', icon: '🏆', condition: { type: 'tests', value: 50 }, xpReward: 250, order: 3 },
    { name: 'Professional', description: '100 ta test topshiring', icon: '👑', condition: { type: 'tests', value: 100 }, xpReward: 500, order: 4 },
    { name: 'Usta', description: '500 ta test topshiring', icon: '🌟', condition: { type: 'tests', value: 500 }, xpReward: 1000, order: 5 },
    
    // XP bo'yicha
    { name: 'Yangi boshlovchi', description: '1000 XP to\'plang', icon: '🌱', condition: { type: 'xp', value: 1000 }, xpReward: 100, order: 10 },
    { name: 'O\'sish', description: '5000 XP to\'plang', icon: '🌿', condition: { type: 'xp', value: 5000 }, xpReward: 250, order: 11 },
    { name: 'Kuchli', description: '10000 XP to\'plang', icon: '💪', condition: { type: 'xp', value: 10000 }, xpReward: 500, order: 12 },
    { name: 'Ekspert', description: '50000 XP to\'plang', icon: '🏅', condition: { type: 'xp', value: 50000 }, xpReward: 1000, order: 13 },
    
    // Level bo'yicha
    { name: 'Level 5', description: '5-levelga yeting', icon: '⭐', condition: { type: 'level', value: 5 }, xpReward: 100, order: 20 },
    { name: 'Level 10', description: '10-levelga yeting', icon: '🌟', condition: { type: 'level', value: 10 }, xpReward: 250, order: 21 },
    { name: 'Level 25', description: '25-levelga yeting', icon: '💫', condition: { type: 'level', value: 25 }, xpReward: 500, order: 22 },
    
    // Mukammallik
    { name: 'Mukammal!', description: 'Testda 100% natija oling', icon: '💯', condition: { type: 'perfect', value: 1 }, xpReward: 50, order: 30 },
    { name: 'Doimiy mukammallik', description: '10 ta testda 100% natija oling', icon: '🎖️', condition: { type: 'perfect', value: 10 }, xpReward: 300, order: 31 },
    
    // AI
    { name: 'AI do\'sti', description: 'AI bilan 10 ta savol-javob', icon: '🤖', condition: { type: 'ai', value: 10 }, xpReward: 50, order: 40 },
    { name: 'AI ustasi', description: 'AI bilan 100 ta savol-javob', icon: '🧠', condition: { type: 'ai', value: 100 }, xpReward: 200, order: 41 },
    
    // Reyting
    { name: 'Top 10', description: 'Reytingda Top 10 ga kiring', icon: '🏆', condition: { type: 'rank', value: 10 }, xpReward: 500, order: 50 },
    { name: 'Yetakchi', description: 'Reytingda 1-o\'rinni egallang', icon: '👑', condition: { type: 'rank', value: 1 }, xpReward: 1000, order: 51 },
    
    // Kategoriya
    { name: 'Kategoriya ustasi', description: 'Bitta kategoriyada 50 ta test', icon: '🎓', condition: { type: 'category', value: 50 }, xpReward: 300, order: 60 },
    { name: 'Ko\'p qirrali', description: '10 ta turli kategoriyada test topshiring', icon: '🔮', condition: { type: 'categories', value: 10 }, xpReward: 200, order: 61 },
  ];

  console.log('🏆 Creating achievements...');
  for (const ach of achievements) {
    // Check if achievement exists
    const existing = await prisma.achievement.findFirst({
      where: { name: ach.name }
    });
    
    if (existing) {
      await prisma.achievement.update({
        where: { id: existing.id },
        data: ach,
      });
    } else {
      await prisma.achievement.create({
        data: { ...ach, isActive: true },
      });
    }
  }

  // ==================== SAMPLE QUESTIONS ====================
  const pythonCategory = await prisma.category.findUnique({ where: { slug: 'python' } });
  const jsCategory = await prisma.category.findUnique({ where: { slug: 'javascript' } });
  
  if (pythonCategory) {
    const pythonQuestions = [
      {
        question: 'Python\'da ro\'yxat (list) yaratish uchun qaysi belgilar ishlatiladi?',
        options: ['[]', '{}', '()', '<>'],
        correctAnswer: 0,
        explanation: 'Python\'da ro\'yxat (list) kvadrat qavslar [] yordamida yaratiladi.',
        difficulty: Difficulty.EASY,
        xpReward: 5,
        tags: ['python', 'list', 'basics'],
      },
      {
        question: 'Python\'da lug\'at (dictionary) yaratish uchun qaysi belgilar ishlatiladi?',
        options: ['[]', '{}', '()', '<>'],
        correctAnswer: 1,
        explanation: 'Python\'da lug\'at (dictionary) figurali qavslar {} yordamida yaratiladi.',
        difficulty: Difficulty.EASY,
        xpReward: 5,
        tags: ['python', 'dictionary', 'basics'],
      },
      {
        question: 'Python\'da funksiya yaratish uchun qaysi kalit so\'z ishlatiladi?',
        options: ['function', 'def', 'func', 'fn'],
        correctAnswer: 1,
        explanation: 'Python\'da funksiya "def" kalit so\'zi yordamida yaratiladi.',
        difficulty: Difficulty.EASY,
        xpReward: 5,
        tags: ['python', 'function', 'basics'],
      },
      {
        question: 'Python\'da "len()" funksiyasi nima qiladi?',
        options: ['Elementlar sonini qaytaradi', 'Maksimum qiymatni topadi', 'Minimum qiymatni topadi', 'Yig\'indini hisoblaydi'],
        correctAnswer: 0,
        explanation: 'len() funksiyasi ro\'yxat, string yoki boshqa iterable\'ning uzunligini qaytaradi.',
        difficulty: Difficulty.EASY,
        xpReward: 5,
        tags: ['python', 'len', 'built-in'],
      },
      {
        question: 'Python\'da class yaratish uchun qaysi kalit so\'z ishlatiladi?',
        options: ['class', 'Class', 'def', 'object'],
        correctAnswer: 0,
        explanation: 'Python\'da class "class" kalit so\'zi yordamida yaratiladi.',
        difficulty: Difficulty.MEDIUM,
        xpReward: 10,
        tags: ['python', 'class', 'oop'],
      },
      {
        question: 'Python\'da "self" nima?',
        options: ['Class instance\'ga ishora', 'Global o\'zgaruvchi', 'Funksiya nomi', 'Modul nomi'],
        correctAnswer: 0,
        explanation: 'self class instance\'ga ishora qiladi va method\'lar ichida instance attribute\'larini olish uchun ishlatiladi.',
        difficulty: Difficulty.MEDIUM,
        xpReward: 10,
        tags: ['python', 'self', 'oop'],
      },
      {
        question: 'Python\'da list comprehension sintaksisi qaysi?',
        options: ['[x for x in range(10)]', '{x for x in range(10)}', '(x for x in range(10))', '<x for x in range(10)>'],
        correctAnswer: 0,
        explanation: 'List comprehension kvadrat qavslar ichida [expression for item in iterable] formatida yoziladi.',
        difficulty: Difficulty.MEDIUM,
        xpReward: 10,
        tags: ['python', 'comprehension', 'list'],
      },
      {
        question: 'Python\'da decorator qanday belgi bilan boshlanadi?',
        options: ['@', '#', '$', '&'],
        correctAnswer: 0,
        explanation: 'Decorator\'lar @ belgisi bilan boshlanadi, masalan @staticmethod.',
        difficulty: Difficulty.HARD,
        xpReward: 15,
        tags: ['python', 'decorator', 'advanced'],
      },
      {
        question: 'Python\'da generator funksiya qaysi kalit so\'zni ishlatadi?',
        options: ['yield', 'return', 'generate', 'next'],
        correctAnswer: 0,
        explanation: 'Generator funksiyalar "yield" kalit so\'zini ishlatadi va lazy evaluation qiladi.',
        difficulty: Difficulty.HARD,
        xpReward: 15,
        tags: ['python', 'generator', 'advanced'],
      },
      {
        question: 'Python\'da async funksiya yaratish uchun qaysi kalit so\'z ishlatiladi?',
        options: ['async def', 'await def', 'future def', 'promise def'],
        correctAnswer: 0,
        explanation: 'Asinxron funksiyalar "async def" kalit so\'zlari bilan yaratiladi.',
        difficulty: Difficulty.HARD,
        xpReward: 15,
        tags: ['python', 'async', 'advanced'],
      },
    ];

    console.log('📝 Creating Python questions...');
    for (const q of pythonQuestions) {
      await prisma.question.create({
        data: {
          categoryId: pythonCategory.id,
          ...q,
          isActive: true,
        },
      });
    }
  }

  if (jsCategory) {
    const jsQuestions = [
      {
        question: 'JavaScript\'da o\'zgaruvchi e\'lon qilish uchun qaysi kalit so\'zlar ishlatiladi?',
        options: ['var, let, const', 'int, string, bool', 'define, set, make', 'new, create, init'],
        correctAnswer: 0,
        explanation: 'JavaScript\'da o\'zgaruvchilar var, let yoki const kalit so\'zlari bilan e\'lon qilinadi.',
        difficulty: Difficulty.EASY,
        xpReward: 5,
        tags: ['javascript', 'variables', 'basics'],
      },
      {
        question: 'JavaScript\'da === va == orasidagi farq nima?',
        options: ['=== type ham tekshiradi', '== type ham tekshiradi', 'Farqi yo\'q', '=== sekinroq'],
        correctAnswer: 0,
        explanation: '=== (strict equality) qiymat va type\'ni tekshiradi, == esa faqat qiymatni tekshiradi.',
        difficulty: Difficulty.EASY,
        xpReward: 5,
        tags: ['javascript', 'operators', 'basics'],
      },
      {
        question: 'JavaScript\'da arrow function sintaksisi qaysi?',
        options: ['() => {}', 'function() {}', '-> {}', 'lambda: {}'],
        correctAnswer: 0,
        explanation: 'Arrow function () => {} sintaksisi bilan yoziladi.',
        difficulty: Difficulty.EASY,
        xpReward: 5,
        tags: ['javascript', 'arrow-function', 'es6'],
      },
      {
        question: 'JavaScript\'da "null" va "undefined" orasidagi farq nima?',
        options: ['null - ataylab bo\'sh, undefined - tayinlanmagan', 'Farqi yo\'q', 'null - xato, undefined - normal', 'null - 0, undefined - NaN'],
        correctAnswer: 0,
        explanation: 'null ataylab bo\'sh qiymat, undefined esa o\'zgaruvchiga qiymat berilmaganligini bildiradi.',
        difficulty: Difficulty.MEDIUM,
        xpReward: 10,
        tags: ['javascript', 'null', 'undefined'],
      },
      {
        question: 'JavaScript\'da Promise nima?',
        options: ['Asinxron operatsiya natijasi', 'Sinxron funksiya', 'Loop turi', 'Ma\'lumot turi'],
        correctAnswer: 0,
        explanation: 'Promise asinxron operatsiyaning kelajakdagi natijasini ifodalaydi.',
        difficulty: Difficulty.MEDIUM,
        xpReward: 10,
        tags: ['javascript', 'promise', 'async'],
      },
      {
        question: 'JavaScript\'da "this" qayerga ishora qiladi?',
        options: ['Kontekstga bog\'liq', 'Har doim window', 'Har doim object', 'Har doim function'],
        correctAnswer: 0,
        explanation: '"this" qiymati funksiya qanday chaqirilganiga bog\'liq - bu execution context\'ga bog\'liq.',
        difficulty: Difficulty.HARD,
        xpReward: 15,
        tags: ['javascript', 'this', 'advanced'],
      },
      {
        question: 'JavaScript\'da closure nima?',
        options: ['Tashqi scope\'ga kirish', 'Funksiyani yopish', 'O\'zgaruvchini bloklash', 'Modul yaratish'],
        correctAnswer: 0,
        explanation: 'Closure - funksiyaning o\'zi yaratilgan scope\'dagi o\'zgaruvchilarga kirishini saqlashi.',
        difficulty: Difficulty.HARD,
        xpReward: 15,
        tags: ['javascript', 'closure', 'advanced'],
      },
      {
        question: 'JavaScript\'da event loop nima qiladi?',
        options: ['Asinxron kodni boshqaradi', 'DOM\'ni yangilaydi', 'Xotira tozalaydi', 'Kod kompilatsiya qiladi'],
        correctAnswer: 0,
        explanation: 'Event loop call stack va callback queue\'ni kuzatib, asinxron kodni boshqaradi.',
        difficulty: Difficulty.HARD,
        xpReward: 15,
        tags: ['javascript', 'event-loop', 'advanced'],
      },
    ];

    console.log('📝 Creating JavaScript questions...');
    for (const q of jsQuestions) {
      await prisma.question.create({
        data: {
          categoryId: jsCategory.id,
          ...q,
          isActive: true,
        },
      });
    }
  }

  // ==================== ADMIN USER ====================
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  console.log('👤 Creating admin user...');
  await prisma.user.upsert({
    where: { email: 'admin@bilimdon.uz' },
    update: {},
    create: {
      email: 'admin@bilimdon.uz',
      username: 'admin',
      password: hashedPassword,
      fullName: 'Administrator',
      role: Role.ADMIN,
      totalXP: 0,
      level: 1,
    },
  });

  // ==================== DEFAULT SETTINGS ====================
  const defaultSettings = [
    { key: 'siteName', value: 'Bilimdon' },
    { key: 'testQuestionsCount', value: 10 },
    { key: 'timerEnabled', value: false },
    { key: 'timerSeconds', value: 600 },
    { key: 'easyXP', value: 5 },
    { key: 'mediumXP', value: 10 },
    { key: 'hardXP', value: 15 },
    { key: 'aiDailyLimit', value: 100 },
    { key: 'geminiModel', value: 'gemini-pro' },
  ];

  console.log('⚙️ Creating default settings...');
  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
