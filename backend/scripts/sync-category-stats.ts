import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateRealStats() {
  console.log('Updating stats based on real test results...');

  // Sizning usernamengizni topamiz
  const users = await prisma.user.findMany({
    select: { id: true, username: true, totalXP: true }
  });
  
  console.log('Users:', users.map(u => ({ username: u.username, totalXP: u.totalXP })));

  // JavaScript kategoriyasini topamiz
  const jsCategory = await prisma.category.findFirst({
    where: { slug: 'javascript' }
  });

  if (!jsCategory) {
    console.log('JavaScript category not found!');
    return;
  }

  console.log('JavaScript category ID:', jsCategory.id);

  // Har bir foydalanuvchi uchun test natijalarini hisoblash
  for (const user of users) {
    // JavaScript testlaridan yig'ilgan XP
    const jsTestAttempts = await prisma.testAttempt.findMany({
      where: {
        userId: user.id,
        categoryId: jsCategory.id,
        completedAt: { not: null }
      },
      select: {
        xpEarned: true,
        score: true,
        correctAnswers: true,
        totalQuestions: true
      }
    });

    if (jsTestAttempts.length > 0) {
      const totalXP = jsTestAttempts.reduce((sum, t) => sum + t.xpEarned, 0);
      const totalTests = jsTestAttempts.length;
      const totalQuestions = jsTestAttempts.reduce((sum, t) => sum + t.totalQuestions, 0);
      const correctAnswers = jsTestAttempts.reduce((sum, t) => sum + t.correctAnswers, 0);
      const avgScore = Math.round(jsTestAttempts.reduce((sum, t) => sum + t.score, 0) / totalTests);
      const bestScore = Math.max(...jsTestAttempts.map(t => t.score));

      console.log(`${user.username} - JavaScript: ${totalXP} XP, ${totalTests} tests, ${avgScore}% avg`);

      // CategoryStat ni yangilaymiz
      await prisma.categoryStat.upsert({
        where: {
          userId_categoryId: { userId: user.id, categoryId: jsCategory.id }
        },
        update: {
          totalXP,
          totalTests,
          totalQuestions,
          correctAnswers,
          averageScore: avgScore,
          bestScore
        },
        create: {
          userId: user.id,
          categoryId: jsCategory.id,
          totalXP,
          totalTests,
          totalQuestions,
          correctAnswers,
          averageScore: avgScore,
          bestScore
        }
      });
    } else {
      console.log(`${user.username} - No JavaScript tests found`);
    }
  }

  // Barcha kategoriyalar uchun qaytaramiz
  const categories = await prisma.category.findMany();
  
  for (const user of users) {
    for (const category of categories) {
      const attempts = await prisma.testAttempt.findMany({
        where: {
          userId: user.id,
          categoryId: category.id,
          completedAt: { not: null }
        }
      });

      if (attempts.length > 0) {
        const totalXP = attempts.reduce((sum, t) => sum + t.xpEarned, 0);
        const totalTests = attempts.length;
        const totalQuestions = attempts.reduce((sum, t) => sum + t.totalQuestions, 0);
        const correctAnswers = attempts.reduce((sum, t) => sum + t.correctAnswers, 0);
        const avgScore = Math.round(attempts.reduce((sum, t) => sum + t.score, 0) / totalTests);
        const bestScore = Math.max(...attempts.map(t => t.score));

        await prisma.categoryStat.upsert({
          where: {
            userId_categoryId: { userId: user.id, categoryId: category.id }
          },
          update: { totalXP, totalTests, totalQuestions, correctAnswers, averageScore: avgScore, bestScore },
          create: {
            userId: user.id,
            categoryId: category.id,
            totalXP, totalTests, totalQuestions, correctAnswers, 
            averageScore: avgScore, bestScore
          }
        });
        
        console.log(`  ${user.username} - ${category.slug}: ${totalXP} XP`);
      }
    }
  }

  console.log('\nDone! Stats updated based on real test results.');
}

updateRealStats()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
