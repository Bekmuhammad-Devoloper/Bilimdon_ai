import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      totalXP: true,
      level: true,
      avatar: true,
      _count: {
        select: { testAttempts: true }
      }
    },
    orderBy: { totalXP: 'desc' }
  });

  console.log('=== Barcha foydalanuvchilar ===\n');
  
  for (const user of users) {
    console.log(`👤 ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   XP: ${user.totalXP} | Level: ${user.level}`);
    console.log(`   Tests: ${user._count.testAttempts}`);
    console.log(`   Avatar: ${user.avatar ? 'Bor' : 'Yo\'q'}`);
    console.log('');
  }

  await prisma.$disconnect();
}

listAllUsers();
