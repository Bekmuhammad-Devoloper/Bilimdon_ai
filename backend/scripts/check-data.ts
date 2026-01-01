import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  // CategoryStats
  const stats = await prisma.categoryStat.findMany({
    include: {
      category: { select: { id: true, slug: true, name: true } },
      user: { select: { username: true } }
    }
  });
  
  console.log('CategoryStats:', stats.length);
  stats.forEach(s => {
    console.log(`  User: ${s.user.username}, Category: ${s.category?.slug}, XP: ${s.totalXP}`);
  });

  // Categories
  const categories = await prisma.category.findMany({
    select: { id: true, slug: true, name: true }
  });
  console.log('\nCategories:', categories.slice(0, 5).map(c => ({ id: c.id, slug: c.slug })));
}

checkData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
