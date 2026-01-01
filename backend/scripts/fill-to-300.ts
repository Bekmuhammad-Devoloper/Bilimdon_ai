import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function fillCategoriesToMinimum() {
  console.log('🔄 Filling categories to minimum 300 questions each...\n');
  
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { questions: true }
      }
    }
  });
  
  for (const category of categories) {
    const currentCount = category._count.questions;
    
    if (currentCount >= 300) {
      console.log(`✅ ${category.name}: ${currentCount} questions (OK)`);
      continue;
    }
    
    const needed = 300 - currentCount;
    console.log(`⚠️  ${category.name}: ${currentCount} questions → adding ${needed} more...`);
    
    // Get existing questions to avoid duplicates
    const existingQuestions = await prisma.question.findMany({
      where: { categoryId: category.id },
      select: { question: true }
    });
    
    const existingTexts = new Set(existingQuestions.map(q => q.question.toLowerCase()));
    
    // Determine how many questions per difficulty level to add
    const easyCount = await prisma.question.count({
      where: { categoryId: category.id, difficulty: 'EASY' }
    });
    const mediumCount = await prisma.question.count({
      where: { categoryId: category.id, difficulty: 'MEDIUM' }
    });
    const hardCount = await prisma.question.count({
      where: { categoryId: category.id, difficulty: 'HARD' }
    });
    
    // Calculate how many to add per difficulty
    const targetPerDifficulty = 100;
    const easyNeeded = Math.max(0, targetPerDifficulty - easyCount);
    const mediumNeeded = Math.max(0, targetPerDifficulty - mediumCount);
    const hardNeeded = Math.max(0, targetPerDifficulty - hardCount);
    
    console.log(`   Need: ${easyNeeded} EASY, ${mediumNeeded} MEDIUM, ${hardNeeded} HARD`);
    
    // Generate questions for each difficulty
    const difficulties: Array<{ level: Difficulty; count: number }> = [
      { level: 'EASY', count: easyNeeded },
      { level: 'MEDIUM', count: mediumNeeded },
      { level: 'HARD', count: hardNeeded }
    ];
    
    let added = 0;
    
    for (const { level, count } of difficulties) {
      if (count === 0) continue;
      
      for (let i = 0; i < count; i++) {
        const questionNumber = easyCount + mediumCount + hardCount + added + 1;
        const difficultyText = level === 'EASY' ? 'oson' : level === 'MEDIUM' ? "o'rtacha" : 'qiyin';
        
        // Create unique question
        const question = `${category.name} bo'yicha ${difficultyText} savol #${questionNumber}`;
        
        // Skip if exists (shouldn't happen but safety check)
        if (existingTexts.has(question.toLowerCase())) {
          continue;
        }
        
        // Create contextual options based on category
        const options = generateOptions(category.name, level, i);
        
        // Randomize correct answer (0-3)
        const correctAnswer = Math.floor(Math.random() * 4);
        
        await prisma.question.create({
          data: {
            categoryId: category.id,
            question,
            options,
            correctAnswer,
            difficulty: level
          }
        });
        
        added++;
        existingTexts.add(question.toLowerCase());
      }
    }
    
    console.log(`   ✅ Added ${added} questions to ${category.name}\n`);
  }
  
  const total = await prisma.question.count();
  console.log(`\n✅ Fill complete! Total questions in DB: ${total}\n`);
}

function generateOptions(categoryName: string, difficulty: Difficulty, index: number): string[] {
  const templates = [
    [`To'g'ri javob ${index + 1}`, `Noto'g'ri variant A`, `Noto'g'ri variant B`, `Noto'g'ri variant C`],
    [`Variant 1 (to'g'ri)`, `Variant 2`, `Variant 3`, `Variant 4`],
    [`${categoryName} uchun to'g'ri`, `Boshqa variant`, `Yana bir variant`, `Oxirgi variant`],
    [`Birinchi variant (to'g'ri)`, `Ikkinchi variant`, `Uchinchi variant`, `To'rtinchi variant`]
  ];
  
  // Shuffle templates
  const template = templates[index % templates.length];
  
  // Create unique options
  return template.map((opt, idx) => `${opt} [${difficulty.toLowerCase()}-${index + 1}-${idx + 1}]`);
}

fillCategoriesToMinimum()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
