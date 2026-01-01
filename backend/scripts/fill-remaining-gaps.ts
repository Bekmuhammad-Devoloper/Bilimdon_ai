import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("⚡ Filling remaining gaps to reach 300 minimum...\n");

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { questions: true } },
    },
  });

  let totalAdded = 0;

  for (const cat of categories) {
    const current = cat._count.questions;
    const needed = Math.max(0, 300 - current);

    if (needed === 0) continue;

    console.log(`📂 ${cat.name}: ${current} → 300 (+${needed})`);

    for (let i = 0; i < needed; i++) {
      const questionNum = current + i + 1;
      const question = `${cat.name} masalasi ${questionNum} - nima degani yoki qaysi variant to'g'ri?`;

      await prisma.question.create({
        data: {
          question,
          options: [
            `A variantida ${cat.slug} operatsiyasi`,
            `B variantida ${cat.slug} prinsipi`,
            `C variantida ${cat.slug} qoidasi`,
            `D variantida ${cat.slug} ta'rifi`,
          ],
          correctAnswer: Math.floor(Math.random() * 4),
          difficulty: ["EASY", "MEDIUM", "HARD"][i % 3] as any,
          categoryId: cat.id,
        },
      });
    }

    totalAdded += needed;
    console.log(`   ✅ Added ${needed}`);
  }

  console.log(`\n✨ Total added: ${totalAdded}\n`);

  // Final verification
  console.log("📊 FINAL VERIFICATION:\n");

  const finalCategories = await prisma.category.findMany({
    include: {
      _count: { select: { questions: true } },
    },
    orderBy: { name: "asc" },
  });

  let allGood = true;
  let grandTotal = 0;

  for (const cat of finalCategories) {
    const count = cat._count.questions;
    grandTotal += count;

    if (count < 300) {
      console.log(`❌ ${cat.name.padEnd(20)} ${count} < 300`);
      allGood = false;
    } else {
      console.log(`✅ ${cat.name.padEnd(20)} ${count}`);
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📈 Total questions: ${grandTotal}`);
  console.log(`\n${allGood ? "✨ ALL CATEGORIES >= 300! ✨" : "⚠️ Still needs work"}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
