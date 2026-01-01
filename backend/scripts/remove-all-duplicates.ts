import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Removing duplicate questions...\n");

  // Get all questions
  const allQuestions = await prisma.question.findMany({
    select: {
      id: true,
      question: true,
      categoryId: true,
      category: { select: { slug: true, name: true } },
    },
  });

  // Find duplicates within categories
  const categoryDuplicates = new Map<string, string[]>();

  for (const categoryId of [
    ...new Set(allQuestions.map((q) => q.categoryId)),
  ]) {
    const categoryQuestions = allQuestions.filter(
      (q) => q.categoryId === categoryId
    );
    const questionMap = new Map<string, string[]>();

    for (const q of categoryQuestions) {
      const key = q.question.toLowerCase().trim();
      if (!questionMap.has(key)) {
        questionMap.set(key, []);
      }
      questionMap.get(key)!.push(q.id);
    }

    // Find duplicates
    for (const [question, ids] of questionMap.entries()) {
      if (ids.length > 1) {
        // Keep first, mark others for deletion
        const idsToDelete = ids.slice(1);
        if (!categoryDuplicates.has(categoryId)) {
          categoryDuplicates.set(categoryId, []);
        }
        categoryDuplicates.get(categoryId)!.push(...idsToDelete);
      }
    }
  }

  // Delete duplicates within categories
  let totalDeletedWithin = 0;
  for (const [categoryId, idsToDelete] of categoryDuplicates.entries()) {
    const category = allQuestions.find((q) => q.categoryId === categoryId);
    console.log(
      `\n📂 ${category?.category.name}: Deleting ${idsToDelete.length} duplicates`
    );

    for (const id of idsToDelete) {
      await prisma.question.delete({ where: { id } });
    }
    totalDeletedWithin += idsToDelete.length;
  }

  console.log(`\n✅ Deleted ${totalDeletedWithin} duplicates within categories`);

  // Find and remove cross-category duplicates
  console.log("\n🔍 Checking cross-category duplicates...\n");

  const updatedQuestions = await prisma.question.findMany({
    select: {
      id: true,
      question: true,
      categoryId: true,
      category: { select: { slug: true, name: true } },
    },
  });

  const globalQuestionMap = new Map<string, any[]>();

  for (const q of updatedQuestions) {
    const key = q.question.toLowerCase().trim();
    if (!globalQuestionMap.has(key)) {
      globalQuestionMap.set(key, []);
    }
    globalQuestionMap.get(key)!.push(q);
  }

  let totalDeletedCross = 0;
  for (const [question, occurrences] of globalQuestionMap.entries()) {
    if (occurrences.length > 1) {
      const categories = occurrences
        .map((o) => o.category.slug)
        .filter((v, i, a) => a.indexOf(v) === i);

      if (categories.length > 1) {
        console.log(
          `❌ Found in ${categories.length} categories: ${question.substring(0, 60)}...`
        );

        // Keep first occurrence, delete rest
        const idsToDelete = occurrences.slice(1).map((o) => o.id);
        console.log(`   Deleting ${idsToDelete.length} copies...\n`);

        for (const id of idsToDelete) {
          await prisma.question.delete({ where: { id } });
        }
        totalDeletedCross += idsToDelete.length;
      }
    }
  }

  console.log(`\n✅ Deleted ${totalDeletedCross} cross-category duplicates`);

  // Final stats
  const finalQuestions = await prisma.question.findMany();
  console.log(`\n📊 Final Statistics:`);
  console.log(`   Total questions remaining: ${finalQuestions.length}`);
  console.log(`   Total removed: ${totalDeletedWithin + totalDeletedCross}`);

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { questions: true } },
    },
  });

  console.log(`\n📂 Questions per category:`);
  for (const cat of categories.sort(
    (a, b) => b._count.questions - a._count.questions
  )) {
    if (cat._count.questions > 0) {
      console.log(`   ${cat.name}: ${cat._count.questions}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
