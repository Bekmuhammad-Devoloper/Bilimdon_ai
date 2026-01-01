import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategoryStats() {
  console.log('Updating category stats with better XP values...');
  
  // Admin uchun yanada yaxshi XP qiymatlar
  await prisma.categoryStat.updateMany({
    where: { 
      user: { username: 'admin' },
      category: { slug: 'python' }
    },
    data: { totalXP: 2500, totalTests: 25, averageScore: 92 }
  });
  
  await prisma.categoryStat.updateMany({
    where: { 
      user: { username: 'admin' },
      category: { slug: 'javascript' }
    },
    data: { totalXP: 2200, totalTests: 22, averageScore: 88 }
  });
  
  await prisma.categoryStat.updateMany({
    where: { 
      user: { username: 'admin' },
      category: { slug: 'typescript' }
    },
    data: { totalXP: 1800, totalTests: 18, averageScore: 85 }
  });
  
  await prisma.categoryStat.updateMany({
    where: { 
      user: { username: 'admin' },
      category: { slug: 'java' }
    },
    data: { totalXP: 1500, totalTests: 15, averageScore: 80 }
  });
  
  await prisma.categoryStat.updateMany({
    where: { 
      user: { username: 'admin' },
      category: { slug: 'react' }
    },
    data: { totalXP: 2000, totalTests: 20, averageScore: 90 }
  });
  
  // bekmuhammad_user uchun ham XP oshiramiz
  await prisma.categoryStat.updateMany({
    where: { 
      user: { username: 'bekmuhammad_user' },
      category: { slug: 'python' }
    },
    data: { totalXP: 1800, totalTests: 18, averageScore: 85 }
  });
  
  await prisma.categoryStat.updateMany({
    where: { 
      user: { username: 'bekmuhammad_user' },
      category: { slug: 'javascript' }
    },
    data: { totalXP: 1500, totalTests: 15, averageScore: 82 }
  });
  
  console.log('Updated category stats!');
  
  // Natijani tekshiramiz
  const stats = await prisma.categoryStat.findMany({
    include: { 
      user: { select: { username: true } },
      category: { select: { slug: true } }
    },
    orderBy: { totalXP: 'desc' }
  });
  
  console.log('\nCategory stats:');
  stats.forEach(s => {
    console.log(`  ${s.user.username} - ${s.category?.slug}: ${s.totalXP} XP`);
  });
}

seedCategoryStats()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
