import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      avatar: true,
      totalXP: true,
      level: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  
  console.log('Oxirgi 10 user:');
  users.forEach(u => {
    console.log(`- ${u.username}: XP=${u.totalXP}, Level=${u.level}, Avatar=${u.avatar ? 'Bor' : 'Yo\'q'}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
