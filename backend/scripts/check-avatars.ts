import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAvatars() {
  const users = await prisma.user.findMany({
    select: { username: true, avatar: true }
  });
  
  console.log('User avatars:');
  users.forEach(u => {
    console.log(`- ${u.username}: ${u.avatar || 'null'}`);
  });
  
  await prisma.$disconnect();
}

checkAvatars();
