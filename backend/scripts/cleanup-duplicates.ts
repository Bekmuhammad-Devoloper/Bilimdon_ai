import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up duplicate questions...\n');
  
  // Get all categories
  const categories = await prisma.category.findMany();
  
  for (const category of categories) {
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
    
    console.log(`⚠️  ${category.name}: ${questionCount} questions (removing duplicates...)`);
    
    // For each difficulty level, keep only the latest 100 questions
    for (const difficulty of [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD]) {
      const questions = await prisma.question.findMany({
        where: {
          categoryId: category.id,
          difficulty
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      });
      
      if (questions.length > 100) {
        // Keep first 100, delete the rest
        const toDelete = questions.slice(100).map(q => q.id);
        await prisma.question.deleteMany({
          where: {
            id: { in: toDelete }
          }
        });
        console.log(`   Deleted ${toDelete.length} ${difficulty} questions`);
      }
    }
    
    const newCount = await prisma.question.count({
      where: { categoryId: category.id }
    });
    console.log(`   ${category.name}: ${questionCount} → ${newCount}`);
  }
  
  const totalAfter = await prisma.question.count();
  console.log(`\n✅ Cleanup complete! Total questions: ${totalAfter}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
