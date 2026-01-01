import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAchievements() {
  const count = await prisma.achievement.count();
  console.log('Achievements count:', count);
  
  const achievements = await prisma.achievement.findMany({
    take: 5,
    select: { id: true, name: true, xpReward: true, isActive: true }
  });
  console.log('Sample achievements:', achievements);
  
  await prisma.$disconnect();
}

checkAchievements().catch(console.error);
