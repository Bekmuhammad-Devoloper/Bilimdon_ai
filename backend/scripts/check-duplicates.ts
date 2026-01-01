import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking for duplicate questions...\n');
  
  // Check duplicates across all categories
  const duplicates = await prisma.$queryRaw<Array<{ question: string; count: number; categories: string }>>`
    SELECT 
      q.question,
      COUNT(*)::int as count,
      STRING_AGG(DISTINCT c.name, ', ') as categories
    FROM "Question" q
    JOIN "Category" c ON q."categoryId" = c.id
    GROUP BY q.question
    HAVING COUNT(*) > 1
    ORDER BY count DESC
    LIMIT 20
  `;
  
  if (duplicates.length > 0) {
    console.log('⚠️  Found duplicate questions:\n');
    duplicates.forEach((dup, idx) => {
      console.log(`${idx + 1}. "${dup.question.substring(0, 60)}..." (${dup.count} times)`);
      console.log(`   Categories: ${dup.categories}\n`);
    });
  } else {
    console.log('✅ No duplicate questions found!\n');
  }
  
  // Check answer distribution
  console.log('📊 Answer distribution:\n');
  const answerStats = await prisma.$queryRaw<Array<{ correct_answer: number; count: number; percentage: string }>>`
    SELECT 
      "correctAnswer" as correct_answer,
      COUNT(*)::int as count,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)::text || '%' as percentage
    FROM "Question"
    GROUP BY "correctAnswer"
    ORDER BY correct_answer
  `;
  
  console.table(answerStats.map(stat => ({
    'Answer': String.fromCharCode(65 + stat.correct_answer) + ` (${stat.correct_answer})`,
    'Count': stat.count,
    'Percentage': stat.percentage
  })));
  
  // Check questions per category
  console.log('\n📋 Questions per category:\n');
  const categoryStats = await prisma.$queryRaw<Array<{ name: string; total: number; easy: number; medium: number; hard: number }>>`
    SELECT 
      c.name,
      COUNT(q.id)::int as total,
      COUNT(CASE WHEN q.difficulty = 'EASY' THEN 1 END)::int as easy,
      COUNT(CASE WHEN q.difficulty = 'MEDIUM' THEN 1 END)::int as medium,
      COUNT(CASE WHEN q.difficulty = 'HARD' THEN 1 END)::int as hard
    FROM "Category" c
    LEFT JOIN "Question" q ON c.id = q."categoryId"
    GROUP BY c.id, c.name
    ORDER BY total DESC, c.name
  `;
  
  console.table(categoryStats);
  
  const totalQuestions = await prisma.question.count();
  console.log(`\n✅ Total questions in database: ${totalQuestions}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
