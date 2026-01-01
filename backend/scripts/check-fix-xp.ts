import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndFix() {
  // User ma'lumotlari
  const user = await prisma.user.findFirst({
    where: { username: 'bekmuhammad_user' }
  });
  
  if (!user) {
    console.log('User not found!');
    return;
  }

  console.log('=== HOZIRGI HOLAT ===');
  console.log('User totalXP:', user.totalXP);

  // Test natijalari
  const attempts = await prisma.testAttempt.findMany({
    where: { userId: user.id, completedAt: { not: null } },
    include: { category: { select: { slug: true } } }
  });
  
  console.log('\nTest natijalari:');
  let realTotalXP = 0;
  const categoryXP: Record<string, number> = {};
  
  attempts.forEach(a => {
    const slug = a.category?.slug || 'unknown';
    console.log(`  - ${slug}: ${a.xpEarned} XP`);
    realTotalXP += a.xpEarned;
    categoryXP[slug] = (categoryXP[slug] || 0) + a.xpEarned;
  });
  
  console.log('\n=== HISOBLANGAN ===');
  console.log('Jami XP (testlardan):', realTotalXP);
  console.log('Kategoriya bo\'yicha:', categoryXP);

  // CategoryStats
  const stats = await prisma.categoryStat.findMany({
    where: { userId: user.id },
    include: { category: { select: { slug: true } } }
  });
  
  console.log('\nCategoryStat jadvalidagi:');
  stats.forEach(s => {
    console.log(`  - ${s.category?.slug}: ${s.totalXP} XP`);
  });

  // Agar user.totalXP noto'g'ri bo'lsa, to'g'rilaymiz
  if (user.totalXP !== realTotalXP) {
    console.log(`\n=== TO'G'RILASH ===`);
    console.log(`User totalXP: ${user.totalXP} -> ${realTotalXP}`);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { totalXP: realTotalXP }
    });
    console.log('User totalXP yangilandi!');
  }

  // CategoryStatlarni to'g'rilaymiz
  for (const [slug, xp] of Object.entries(categoryXP)) {
    const category = await prisma.category.findFirst({ where: { slug } });
    if (!category) continue;

    const existingStat = stats.find(s => s.category?.slug === slug);
    
    if (!existingStat || existingStat.totalXP !== xp) {
      console.log(`CategoryStat ${slug}: ${existingStat?.totalXP || 0} -> ${xp}`);
      
      const categoryAttempts = attempts.filter(a => a.category?.slug === slug);
      const totalTests = categoryAttempts.length;
      const totalQuestions = categoryAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
      const correctAnswers = categoryAttempts.reduce((sum, a) => sum + a.correctAnswers, 0);
      const avgScore = Math.round(categoryAttempts.reduce((sum, a) => sum + a.score, 0) / totalTests);
      const bestScore = Math.max(...categoryAttempts.map(a => a.score));
      
      await prisma.categoryStat.upsert({
        where: { userId_categoryId: { userId: user.id, categoryId: category.id } },
        update: { totalXP: xp, totalTests, totalQuestions, correctAnswers, averageScore: avgScore, bestScore },
        create: { 
          userId: user.id, 
          categoryId: category.id, 
          totalXP: xp, 
          totalTests, 
          totalQuestions, 
          correctAnswers, 
          averageScore: avgScore, 
          bestScore 
        }
      });
    }
  }

  console.log('\n=== YAKUNIY ===');
  const updatedUser = await prisma.user.findFirst({ where: { id: user.id } });
  console.log('User totalXP:', updatedUser?.totalXP);
  
  const updatedStats = await prisma.categoryStat.findMany({
    where: { userId: user.id },
    include: { category: { select: { slug: true } } }
  });
  updatedStats.forEach(s => {
    console.log(`  ${s.category?.slug}: ${s.totalXP} XP`);
  });
}

checkAndFix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
