import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Removing duplicate questions and limiting to 300 per category...\n');
  
  // Step 1: Remove exact duplicates (same question text in same category)
  const categories = await prisma.category.findMany();
  
  for (const category of categories) {
    // Find duplicate questions in this category
    const duplicateGroups = await prisma.$queryRaw<Array<{ question: string; ids: string; count: number }>>`
      SELECT 
        question,
        STRING_AGG(id::text, ',') as ids,
        COUNT(*)::int as count
      FROM "Question"
      WHERE "categoryId" = ${category.id}
      GROUP BY question
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateGroups.length > 0) {
      console.log(`⚠️  ${category.name}: Found ${duplicateGroups.length} duplicate question groups`);
      
      for (const group of duplicateGroups) {
        const ids = group.ids.split(',');
        // Keep only the first one, delete the rest
        const toDelete = ids.slice(1);
        
        await prisma.question.deleteMany({
          where: {
            id: { in: toDelete }
          }
        });
      }
      
      console.log(`   Removed ${duplicateGroups.reduce((sum, g) => sum + (g.count - 1), 0)} duplicate questions`);
    }
    
    // Check question count after removing duplicates
    const questionCount = await prisma.question.count({
      where: { categoryId: category.id }
    });
    
    if (questionCount === 0) {
      console.log(`⚪ ${category.name}: No questions (skipped)`);
      continue;
    }
    
    if (questionCount <= 300) {
      console.log(`✅ ${category.name}: ${questionCount} questions (OK)`);
      continue;
    }
    
    // Step 2: Limit to 300 total (100 per difficulty)
    console.log(`📊 ${category.name}: ${questionCount} questions → limiting to 300...`);
    
    const difficulties = ['EASY', 'MEDIUM', 'HARD'] as const;
    
    for (const difficulty of difficulties) {
      const questions = await prisma.question.findMany({
        where: {
          categoryId: category.id,
          difficulty
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      });
      
      if (questions.length > 100) {
        const toDelete = questions.slice(100).map(q => q.id);
        await prisma.question.deleteMany({
          where: { id: { in: toDelete } }
        });
        console.log(`   ${difficulty}: ${questions.length} → 100`);
      }
    }
    
    const newCount = await prisma.question.count({
      where: { categoryId: category.id }
    });
    console.log(`   ✓ ${category.name}: ${questionCount} → ${newCount}`);
  }
  
  const totalAfter = await prisma.question.count();
  console.log(`\n✅ Cleanup complete! Total questions: ${totalAfter}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
