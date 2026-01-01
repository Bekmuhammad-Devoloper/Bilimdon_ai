import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking for duplicate questions...\n");

  // Get all categories
  const categories = await prisma.category.findMany({
    include: {
      questions: {
        select: {
          id: true,
          question: true,
        },
      },
    },
  });

  console.log(`Found ${categories.length} categories\n`);

  let totalQuestions = 0;
  let totalDuplicates = 0;

  for (const category of categories) {
    console.log(`\n📂 ${category.name} (${category.slug}):`);
    console.log(`   Total questions: ${category.questions.length}`);

    // Check for duplicates within this category
    const questionMap = new Map<string, number>();
    let duplicatesInCategory = 0;

    for (const q of category.questions) {
      const key = q.question.toLowerCase().trim();
      if (questionMap.has(key)) {
        duplicatesInCategory++;
      } else {
        questionMap.set(key, 1);
      }
    }

    if (duplicatesInCategory > 0) {
      console.log(`   ⚠️  Duplicates in category: ${duplicatesInCategory}`);
      totalDuplicates += duplicatesInCategory;
    } else {
      console.log(`   ✅ No duplicates`);
    }

    totalQuestions += category.questions.length;
  }

  console.log("\n" + "=".repeat(50));
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total questions across all categories: ${totalQuestions}`);
  console.log(`   Total duplicates found: ${totalDuplicates}`);

  // Check for same questions across different categories
  console.log("\n\n🔍 Checking for CROSS-CATEGORY duplicates...\n");

  const allQuestions = await prisma.question.findMany({
    select: {
      id: true,
      question: true,
      categoryId: true,
      category: { select: { slug: true, name: true } },
    },
  });

  const globalQuestionMap = new Map<string, any[]>();

  for (const q of allQuestions) {
    const key = q.question.toLowerCase().trim();
    if (!globalQuestionMap.has(key)) {
      globalQuestionMap.set(key, []);
    }
    globalQuestionMap.get(key)!.push(q);
  }

  let crossCategoryDuplicates = 0;
  for (const [question, occurrences] of globalQuestionMap.entries()) {
    if (occurrences.length > 1) {
      const categories = occurrences
        .map((o) => o.category.slug)
        .filter((v, i, a) => a.indexOf(v) === i);

      if (categories.length > 1) {
        console.log(
          `❌ Found in ${categories.length} categories: ${question.substring(0, 80)}...`
        );
        console.log(`   Categories: ${categories.join(", ")}`);
        console.log(`   Count: ${occurrences.length}\n`);
        crossCategoryDuplicates += occurrences.length - 1;
      }
    }
  }

  console.log(`\n📊 Cross-category duplicates: ${crossCategoryDuplicates}`);

  if (crossCategoryDuplicates === 0) {
    console.log(
      "✅ No same questions found across different categories!\n"
    );
  }
}

main().then(() => process.exit(0));
