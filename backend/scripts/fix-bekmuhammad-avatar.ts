import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Bekmuhammad userni topish
  const user = await prisma.user.findFirst({
    where: { username: 'Bekmuhammad' },
    select: { id: true, username: true, avatar: true }
  });
  
  console.log('User:', user);
  
  if (user && user.id === '0dd139e4-6803-430c-8610-2a594eaeb880') {
    // Avatar'ni bazaga yozish
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: '/uploads/avatars/0dd139e4-6803-430c-8610-2a594eaeb880-1766688604534.jpeg' }
    });
    console.log('Avatar yangilandi:', updated.avatar);
  } else {
    console.log('User ID:', user?.id);
    console.log('Fayl: 0dd139e4-6803-430c-8610-2a594eaeb880-1766688604534.jpeg');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
