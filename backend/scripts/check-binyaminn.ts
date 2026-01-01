import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBinyaminn() {
  const user = await prisma.user.findFirst({
    where: { username: 'Binyaminn_user' }
  });

  if (user) {
    console.log('=== Binyaminn_user ===');
    console.log('User ID:', user.id);
    console.log('Username:', user.username);
    console.log('Total XP in DB:', user.totalXP);
    console.log('Level:', user.level);
    console.log('Avatar:', user.avatar);

    // Test attempts
    const attempts = await prisma.testAttempt.findMany({
      where: { userId: user.id, completedAt: { not: null } },
      select: { xpEarned: true, score: true }
    });

    const realXP = attempts.reduce((sum, a) => sum + (a.xpEarned || 0), 0);
    console.log('\nReal XP from tests:', realXP);
    console.log('Completed tests:', attempts.length);

    if (user.totalXP !== realXP) {
      console.log('\n⚠️ XP farq bor! DB:', user.totalXP, '| Real:', realXP);
      
      // XP ni to'g'rilash
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          totalXP: realXP,
          level: Math.floor(realXP / 1000) + 1
        }
      });
      console.log('✅ XP to\'g\'rilandi:', realXP);
    } else {
      console.log('\n✅ XP to\'g\'ri');
    }
  } else {
    console.log('User topilmadi');
  }

  await prisma.$disconnect();
}

checkBinyaminn();
