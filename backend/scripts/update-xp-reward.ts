import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating xpReward for questions...');
  
  const result = await prisma.question.updateMany({
    where: {
      xpReward: {
        lte: 0,
      },
    },
    data: {
      xpReward: 10,
    },
  });

  console.log(`Updated ${result.count} questions with xpReward = 10`);

  // Also set difficulty-based XP if xpReward is still 0
  const easyQuestions = await prisma.question.updateMany({
    where: {
      difficulty: 'EASY',
      xpReward: 0,
    },
    data: {
      xpReward: 5,
    },
  });

  const mediumQuestions = await prisma.question.updateMany({
    where: {
      difficulty: 'MEDIUM',
      xpReward: 0,
    },
    data: {
      xpReward: 10,
    },
  });

  const hardQuestions = await prisma.question.updateMany({
    where: {
      difficulty: 'HARD',
      xpReward: 0,
    },
    data: {
      xpReward: 15,
    },
  });

  console.log(`Updated EASY: ${easyQuestions.count}, MEDIUM: ${mediumQuestions.count}, HARD: ${hardQuestions.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
