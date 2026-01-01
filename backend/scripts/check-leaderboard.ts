import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  // Global leaderboard
  const users = await prisma.user.findMany({
    orderBy: { totalXP: 'desc' },
    select: { username: true, totalXP: true, level: true }
  });
  console.log('=== GLOBAL LEADERBOARD ===');
  users.forEach((u, i) => console.log(`${i+1}. ${u.username}: ${u.totalXP} XP (Level ${u.level})`));

  // Category stats
  const stats = await prisma.categoryStat.findMany({
    include: {
      user: { select: { username: true } },
      category: { select: { slug: true, name: true } }
    },
    orderBy: { totalXP: 'desc' }
  });
  
  console.log('\n=== CATEGORY LEADERBOARD ===');
  const byCategory: Record<string, Array<{user: string, xp: number}>> = {};
  stats.forEach(s => {
    const cat = s.category?.slug || 'unknown';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push({ user: s.user.username, xp: s.totalXP });
  });
  
  for (const [cat, entries] of Object.entries(byCategory)) {
    console.log(`\n${cat.toUpperCase()}:`);
    entries.forEach((e, i) => console.log(`  ${i+1}. ${e.user}: ${e.xp} XP`));
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
