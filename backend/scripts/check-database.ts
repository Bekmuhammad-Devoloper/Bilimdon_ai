import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.question.count();
  const byCategory = await prisma.question.groupBy({
    by: ['categoryId'],
    _count: true,
  });

  console.log(`\n📊 Database Statistics:`);
  console.log(`✅ Total Questions: ${total}`);
  console.log(`\n📈 Questions by Category:`);
  
  for (const group of byCategory) {
    const cat = await prisma.category.findUnique({
      where: { id: group.categoryId },
    });
    console.log(`   ${cat?.name}: ${group._count}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
