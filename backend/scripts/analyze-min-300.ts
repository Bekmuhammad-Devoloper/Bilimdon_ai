import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📊 Analyzing category question distribution...\n");

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { questions: true } },
    },
    orderBy: { name: "asc" },
  });

  console.log("Category Analysis:");
  console.log("==================\n");

  const needsQuestions: Array<{
    slug: string;
    name: string;
    current: number;
    needed: number;
  }> = [];

  for (const cat of categories) {
    const current = cat._count.questions;
    const needed = Math.max(0, 300 - current);

    const status =
      needed === 0
        ? "✅"
        : needed <= 100
          ? "🟡"
          : "❌";

    console.log(
      `${status} ${cat.name.padEnd(20)} ${current.toString().padStart(4)} / 300 (need +${needed})`
    );

    if (needed > 0) {
      needsQuestions.push({
        slug: cat.slug,
        name: cat.name,
        current,
        needed,
      });
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`\n📋 Categories needing more questions:\n`);

  let totalNeeded = 0;
  for (const cat of needsQuestions) {
    console.log(
      `${cat.name.padEnd(20)} +${cat.needed.toString().padStart(3)} (${cat.current} → 300)`
    );
    totalNeeded += cat.needed;
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Categories to fix: ${needsQuestions.length}`);
  console.log(`Total questions to add: ${totalNeeded}`);

  const totalQuestions = categories.reduce(
    (sum, c) => sum + c._count.questions,
    0
  );
  console.log(`Current total: ${totalQuestions}`);
  console.log(`Will be: ${totalQuestions + totalNeeded}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
