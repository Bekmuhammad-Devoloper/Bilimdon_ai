import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAvatar() {
  // Sharobiddinov avatarini eng oxirgi yuklangan faylga yangilash
  const updated = await prisma.user.update({
    where: { username: 'Sharobiddinov' },
    data: { avatar: '/uploads/avatars/13955bda-8b21-4026-82c0-4538451a6ec5-1766691762296.jpg' },
    select: { id: true, username: true, avatar: true }
  });
  
  console.log('Yangilandi!');
  console.log('Username:', updated.username);
  console.log('Avatar:', updated.avatar);

  await prisma.$disconnect();
}

checkAvatar();
