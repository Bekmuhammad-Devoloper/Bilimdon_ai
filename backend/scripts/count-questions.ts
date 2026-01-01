import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`
    SELECT c.name, COUNT(q.id)::int as question_count 
    FROM "Category" c 
    LEFT JOIN "Question" q ON c.id = q."categoryId" 
    GROUP BY c.id, c.name 
    ORDER BY c.name
  `;
  
  console.log('\n📊 Questions per category:\n');
  console.table(result);
  
  const total = await prisma.question.count();
  console.log(`\n✅ Total questions in database: ${total}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
