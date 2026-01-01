import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { username: 'Programmer' },
    select: { id: true, username: true, avatar: true, fullName: true }
  });
  
  console.log('Programmer user:', JSON.stringify(user, null, 2));
  
  // Barcha userlarni ko'rish
  const allUsers = await prisma.user.findMany({
    select: { username: true, avatar: true }
  });
  console.log('\nAll users:');
  allUsers.forEach(u => {
    console.log(`  ${u.username}: avatar = ${u.avatar || 'NULL'}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
