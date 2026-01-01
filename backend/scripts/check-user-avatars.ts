import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserAvatar() {
  // Barcha userlarning avatarini tekshirish
  const users = await prisma.user.findMany({
    select: { id: true, username: true, fullName: true, avatar: true }
  });
  
  console.log('All users with avatars:');
  users.forEach(u => {
    console.log(`- ${u.username} (${u.fullName}): avatar = ${u.avatar || 'NULL'}`);
  });
  
  await prisma.$disconnect();
}

checkUserAvatar().catch(console.error);
