import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAllUsersXP() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        totalXP: true,
      }
    });

    console.log('=== Fixing All Users XP ===\n');
    
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
      
      if (user.totalXP !== realXP) {
        // Calculate correct level
        const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8500, 13000, 20000];
        let newLevel = 1;
        for (let i = thresholds.length - 1; i >= 0; i--) {
          if (realXP >= thresholds[i]) {
            newLevel = i + 1;
            break;
          }
        }

        // Update user
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            totalXP: realXP,
            level: newLevel
          }
        });

        console.log(`✅ Fixed ${user.username}: ${user.totalXP} -> ${realXP} XP (Level ${newLevel})`);
      } else {
        console.log(`✓ ${user.username}: ${realXP} XP is correct`);
      }
    }

    console.log('\n=== Done! ===');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllUsersXP();
