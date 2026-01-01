import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCategoryLeaderboard() {
  // JavaScript kategoriyasini topamiz
  const jsCategory = await prisma.category.findFirst({
    where: { slug: 'javascript' }
  });
  
  console.log('JavaScript category ID:', jsCategory?.id);
  
  // CategoryStat ni tekshiramiz
  const stats = await prisma.categoryStat.findMany({
    where: { categoryId: jsCategory?.id },
    include: {
      user: { select: { id: true, username: true, fullName: true, avatar: true, level: true } }
    },
    orderBy: { totalXP: 'desc' }
  });
  
  console.log('\nCategoryStat for JavaScript:');
  console.log(JSON.stringify(stats, null, 2));
  
  // Leaderboard formatida
  const leaderboard = stats.map((stat, index) => ({
    rank: index + 1,
    id: stat.user.id,
    username: stat.user.username,
    fullName: stat.user.fullName,
    avatar: stat.user.avatar,
    level: stat.user.level,
    totalXP: stat.totalXP,
    testsCount: stat.totalTests,
  }));
  
  console.log('\nLeaderboard format:');
  console.log(JSON.stringify({ leaderboard }, null, 2));
}

testCategoryLeaderboard()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
