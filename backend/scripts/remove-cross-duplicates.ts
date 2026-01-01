import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeCrossCategoryDuplicates() {
  console.log('🧹 Removing cross-category duplicate questions...\n');
  
  // Find questions that appear in multiple categories
  const duplicates = await prisma.$queryRaw<Array<{ 
    question: string; 
    ids: string; 
    count: number 
  }>>`
    SELECT 
      question,
      STRING_AGG(id::text, ',') as ids,
      COUNT(*)::int as count
    FROM "Question"
    GROUP BY question
    HAVING COUNT(*) > 1
    ORDER BY count DESC
  `;
  
  if (duplicates.length === 0) {
    console.log('✅ No cross-category duplicates found!\n');
    return;
  }
  
  console.log(`⚠️  Found ${duplicates.length} duplicate question texts across categories\n`);
  
  for (const dup of duplicates) {
    const ids = dup.ids.split(',');
    const questions = await prisma.question.findMany({
      where: { id: { in: ids } },
      include: { category: true }
    });
    
    console.log(`📝 "${dup.question.substring(0, 60)}..." (${dup.count} times)`);
    console.log(`   Categories: ${questions.map(q => q.category.name).join(', ')}`);
    
    // Keep only the first occurrence, delete others
    const toDelete = ids.slice(1);
    await prisma.question.deleteMany({
      where: { id: { in: toDelete } }
    });
    
    console.log(`   ✓ Removed ${toDelete.length} duplicates\n`);
  }
  
  const total = await prisma.question.count();
  console.log(`\n✅ Cleanup complete! Total questions: ${total}\n`);
}

removeCrossCategoryDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
