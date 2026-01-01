import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    select: { slug: true, name: true },
    orderBy: { slug: "asc" },
  });

  console.log("Database categories:");
  for (const cat of categories) {
    console.log(`  ${cat.slug.padEnd(20)} --> ${cat.name}`);
  }
}

main().then(() => process.exit(0));
