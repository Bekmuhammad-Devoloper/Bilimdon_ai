import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanIncompleteTests() {
  console.log('Tugallanmagan testlarni o\'chirish...');
  
  // Avval sanab olish
  const incompleteCount = await prisma.testAttempt.count({
    where: { completedAt: null }
  });
  
  console.log(`Tugallanmagan testlar soni: ${incompleteCount}`);
  
  if (incompleteCount > 0) {
    const deleted = await prisma.testAttempt.deleteMany({
      where: { completedAt: null }
    });
    
    console.log(`O'chirildi: ${deleted.count} ta tugallanmagan test`);
  } else {
    console.log('Tugallanmagan test topilmadi');
  }
  
  await prisma.$disconnect();
}

cleanIncompleteTests().catch(console.error);
