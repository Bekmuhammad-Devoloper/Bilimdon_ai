import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { username: 'Bekmuhammad' },
    include: {
      testAttempts: {
        select: {
          xpEarned: true,
          score: true,
          totalQuestions: true,
          correctAnswers: true,
        }
      },
      userAchievements: {
        where: { unlockedAt: { not: null } },
        include: {
          achievement: {
            select: { name: true, xpReward: true }
          }
        }
      }
    }
  });

  if (!user) {
    console.log('User topilmadi');
    return;
  }

  console.log(`User: ${user.username}`);
  console.log(`Bazadagi XP: ${user.totalXP}`);
  console.log('');

  // Testlardan XP
  const testXP = user.testAttempts.reduce((sum, t) => sum + t.xpEarned, 0);
  console.log(`Testlar soni: ${user.testAttempts.length}`);
  console.log(`Testlardan XP: ${testXP}`);
  user.testAttempts.forEach((t, i) => {
    console.log(`  Test ${i+1}: ${t.correctAnswers}/${t.totalQuestions} = ${t.xpEarned} XP`);
  });
  console.log('');

  // Yutuqlardan XP
  const achXP = user.userAchievements.reduce((sum, ua) => sum + ua.achievement.xpReward, 0);
  console.log(`Yutuqlar soni: ${user.userAchievements.length}`);
  console.log(`Yutuqlardan XP: ${achXP}`);
  user.userAchievements.forEach(ua => {
    console.log(`  ${ua.achievement.name}: +${ua.achievement.xpReward} XP`);
  });
  console.log('');

  console.log(`Jami hisoblangan: ${testXP + achXP} XP`);
  console.log(`Bazadagi: ${user.totalXP} XP`);
  console.log(`Farq: ${user.totalXP - (testXP + achXP)} XP`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
