import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkIcons() {
  const categories = await prisma.category.findMany({
    select: { name: true, icon: true },
    take: 10
  });
  
  console.log('Category icons:');
  categories.forEach(c => {
    console.log(`- ${c.name}: "${c.icon}"`);
  });
  
  await prisma.$disconnect();
}

checkIcons();
