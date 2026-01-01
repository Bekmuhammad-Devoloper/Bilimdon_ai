import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanAndSync() {
  console.log('=== TOZALASH VA SINXRONLASH ===\n');

  // Barcha foydalanuvchilar
  const users = await prisma.user.findMany();

  for (const user of users) {
    console.log(`\n--- ${user.username} ---`);

    // Haqiqiy test natijalari
    const attempts = await prisma.testAttempt.findMany({
      where: { userId: user.id, completedAt: { not: null } },
      include: { category: { select: { id: true, slug: true } } }
    });

    // Kategoriya bo'yicha XP hisoblash
    const categoryData: Record<string, {
      categoryId: string;
      totalXP: number;
      totalTests: number;
      totalQuestions: number;
      correctAnswers: number;
      scores: number[];
    }> = {};

    let realTotalXP = 0;

    attempts.forEach(a => {
      if (!a.category) return;
      
      realTotalXP += a.xpEarned;
      
      if (!categoryData[a.category.slug]) {
        categoryData[a.category.slug] = {
          categoryId: a.category.id,
          totalXP: 0,
          totalTests: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          scores: []
        };
      }
      
      categoryData[a.category.slug].totalXP += a.xpEarned;
      categoryData[a.category.slug].totalTests += 1;
      categoryData[a.category.slug].totalQuestions += a.totalQuestions;
      categoryData[a.category.slug].correctAnswers += a.correctAnswers;
      categoryData[a.category.slug].scores.push(a.score);
    });

    console.log(`Jami XP: ${realTotalXP}`);
    console.log('Kategoriyalar:', Object.keys(categoryData).map(k => `${k}: ${categoryData[k].totalXP} XP`).join(', ') || 'yo\'q');

    // User totalXP ni yangilash
    await prisma.user.update({
      where: { id: user.id },
      data: { totalXP: realTotalXP }
    });

    // Eski CategoryStatlarni o'chirish
    await prisma.categoryStat.deleteMany({
      where: { userId: user.id }
    });

    // Yangi CategoryStatlarni yaratish (faqat haqiqiy test natijalari bilan)
    for (const [slug, data] of Object.entries(categoryData)) {
      const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
      const bestScore = Math.max(...data.scores);

      await prisma.categoryStat.create({
        data: {
          userId: user.id,
          categoryId: data.categoryId,
          totalXP: data.totalXP,
          totalTests: data.totalTests,
          totalQuestions: data.totalQuestions,
          correctAnswers: data.correctAnswers,
          averageScore: avgScore,
          bestScore: bestScore
        }
      });
      
      console.log(`  CategoryStat yaratildi: ${slug} = ${data.totalXP} XP`);
    }
  }

  console.log('\n=== YAKUNIY NATIJA ===');
  
  const allUsers = await prisma.user.findMany({
    select: { username: true, totalXP: true }
  });
  console.log('\nFoydalanuvchilar:');
  allUsers.forEach(u => console.log(`  ${u.username}: ${u.totalXP} XP`));

  const allStats = await prisma.categoryStat.findMany({
    include: { 
      user: { select: { username: true } },
      category: { select: { slug: true } }
    }
  });
  console.log('\nCategoryStat:');
  allStats.forEach(s => console.log(`  ${s.user.username} - ${s.category?.slug}: ${s.totalXP} XP`));
}

cleanAndSync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
