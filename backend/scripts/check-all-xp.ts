import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllUsersXP() {
  try {
    // Get all users with their test attempts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        totalXP: true,
        level: true,
        _count: {
          select: { testAttempts: true }
        }
      }
    });

    console.log('=== All Users XP ===\n');
    
    for (const user of users) {
      // Calculate real XP from test attempts
      const testAttempts = await prisma.testAttempt.findMany({
        where: { 
          userId: user.id,
          completedAt: { not: null }
        },
        select: { xpEarned: true }
      });

      const realXP = testAttempts.reduce((sum, t) => sum + (t.xpEarned || 0), 0);
      const isCorrect = user.totalXP === realXP;

      console.log(`User: ${user.username}`);
      console.log(`  - Database XP: ${user.totalXP}`);
      console.log(`  - Real XP from tests: ${realXP}`);
      console.log(`  - Tests completed: ${testAttempts.length}`);
      console.log(`  - Status: ${isCorrect ? '✅ Correct' : '❌ Needs fix'}`);
      console.log('');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsersXP();
