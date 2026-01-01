import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Synthetic test data for empty categories
const syntheticQuestions = {
  react: [
    {
      text: "React'da component nima?",
      options: [
        "HTML markup",
        "Reusable UI elements",
        "Styling system",
        "Database query",
      ],
      correctAnswer: 1,
    },
    {
      text: "JSX nima va uning maqsadi nima?",
      options: [
        "Java Style eXtension",
        "JavaScript XML - HTML-like syntax in JS",
        "JSON eXtensible",
        "JavaScript eXtra",
      ],
      correctAnswer: 1,
    },
    {
      text: "React hooks'lar qanday ishlaydi?",
      options: [
        "Class componentlari sozlamash",
        "State va lifecycle holatlarini functional componentlardan foydalanish",
        "Database connections",
        "HTTP requests",
      ],
      correctAnswer: 1,
    },
    {
      text: "Virtual DOM ning afzalligi nima?",
      options: [
        "Katta memory o'z oladi",
        "Tezroq rendering va efficient updates",
        "CSS bilan ishlash",
        "Network speed",
      ],
      correctAnswer: 1,
    },
    {
      text: "React'da key prop nima uchun kerak?",
      options: [
        "Password encryption",
        "List elements'ni identify qilish uchun",
        "Database primary key",
        "Authentication",
      ],
      correctAnswer: 1,
    },
  ],
  redis: [
    {
      text: "Redis nima va uning asosiy maqsadi nima?",
      options: [
        "Relational database",
        "In-memory data structure store va cache",
        "File storage system",
        "Email server",
      ],
      correctAnswer: 1,
    },
    {
      text: "Redis'da SET va GET buyruqlari nima?",
      options: [
        "SQL commands",
        "HTML tags",
        "Key-value pair operations",
        "File operations",
      ],
      correctAnswer: 2,
    },
    {
      text: "Redis'da TTL (Time To Live) nima?",
      options: [
        "Total Transmission Latency",
        "Key'ning expiration time'i",
        "Transaction log length",
        "Template Tag Language",
      ],
      correctAnswer: 1,
    },
    {
      text: "Redis'da hashing qanday ishlaydi?",
      options: [
        "Encrypted storage",
        "Field-value pairs bilan data storage",
        "Document indexing",
        "Image processing",
      ],
      correctAnswer: 1,
    },
    {
      text: "Redis lists'lari qanday ishlaydi?",
      options: [
        "Array sorting",
        "Ordered collections - push, pop operations",
        "Hash maps",
        "Set operations",
      ],
      correctAnswer: 1,
    },
  ],
  rust: [
    {
      text: "Rust'da ownership system nima?",
      options: [
        "Object-oriented programming",
        "Memory management bilan borrows va moves",
        "File permissions",
        "User authentication",
      ],
      correctAnswer: 1,
    },
    {
      text: "Borrow checker Rust'da nimani qiladi?",
      options: [
        "Loans pul beradi",
        "Memory safety bugs'larni prevent qiladi",
        "Network protocols",
        "Database transactions",
      ],
      correctAnswer: 1,
    },
    {
      text: "Lifetimes Rust'da nima?",
      options: [
        "Program execution duration",
        "Reference'larning validity'si scope",
        "Variable scope",
        "Function parameters",
      ],
      correctAnswer: 1,
    },
    {
      text: "Rust'da match keyword nima uchun?",
      options: [
        "String matching",
        "Pattern matching va control flow",
        "Date comparison",
        "File searching",
      ],
      correctAnswer: 1,
    },
    {
      text: "Option<T> va Result<T, E> nima?",
      options: [
        "HTML elements",
        "Error handling enums",
        "CSS properties",
        "JSON objects",
      ],
      correctAnswer: 1,
    },
  ],
  sql: [
    {
      text: "SQL'da SELECT statement nima?",
      options: [
        "Data deletion",
        "Data retrieval from tables",
        "Table creation",
        "User authentication",
      ],
      correctAnswer: 1,
    },
    {
      text: "JOIN'lar SQL'da nima uchun kerak?",
      options: [
        "Data compression",
        "Multiple tables'dan data combine qilish",
        "User permissions",
        "Network protocols",
      ],
      correctAnswer: 1,
    },
    {
      text: "WHERE clause'da AND va OR operators nima?",
      options: [
        "File operations",
        "Conditional filtering in queries",
        "User roles",
        "Network connections",
      ],
      correctAnswer: 1,
    },
    {
      text: "SQL'da aggregate functions nima?",
      options: [
        "Table joins",
        "COUNT, SUM, AVG kabi calculations",
        "User authentication",
        "File uploads",
      ],
      correctAnswer: 1,
    },
    {
      text: "Normalization SQL'da nima?",
      options: [
        "Data encryption",
        "Redundancy reduce qilish va data integrity",
        "User management",
        "Performance optimization",
      ],
      correctAnswer: 1,
    },
  ],
  typescript: [
    {
      text: "TypeScript nima va qanday foydali?",
      options: [
        "JavaScript replacement",
        "Static typing - compile-time error checking",
        "Database system",
        "CSS framework",
      ],
      correctAnswer: 1,
    },
    {
      text: "Interface va Type TypeScript'da farqi nima?",
      options: [
        "Ikkala ham bir xil",
        "Interface objects, Type unions/primitives uchun",
        "Speed differences",
        "Memory usage",
      ],
      correctAnswer: 1,
    },
    {
      text: "Generic types TypeScript'da nima?",
      options: [
        "Regular variables",
        "Reusable components with type parameters",
        "Function decorators",
        "Class inheritance",
      ],
      correctAnswer: 1,
    },
    {
      text: "Decorators TypeScript'da nima?",
      options: [
        "CSS styling",
        "Functions va classes'ni modify qilish",
        "HTML elements",
        "JavaScript operators",
      ],
      correctAnswer: 1,
    },
    {
      text: "Union types TypeScript'da nima?",
      options: [
        "Combining databases",
        "Multiple possible types - | operator",
        "User groups",
        "File merging",
      ],
      correctAnswer: 1,
    },
  ],
  vuejs: [
    {
      text: "Vue.js'da component nima?",
      options: [
        "Server-side rendering",
        "Reusable UI building blocks",
        "Database query",
        "CSS framework",
      ],
      correctAnswer: 1,
    },
    {
      text: "Vue'da v-if va v-show farqi nima?",
      options: [
        "Speed differences",
        "v-if - DOM'dan remove, v-show - CSS display toggle",
        "Data binding",
        "Event handling",
      ],
      correctAnswer: 1,
    },
    {
      text: "Data binding Vue'da qanday ishlaydi?",
      options: [
        "Manual DOM updates",
        "Automatic synchronization between data va UI",
        "Database connections",
        "Network requests",
      ],
      correctAnswer: 1,
    },
    {
      text: "Vue'da lifecycle hooks nima?",
      options: [
        "HTTP requests",
        "Component creation, mounting, updating events",
        "CSS animations",
        "User permissions",
      ],
      correctAnswer: 1,
    },
    {
      text: "Computed properties Vue'da nima?",
      options: [
        "Mathematical calculations only",
        "Cached derived state from data",
        "Database queries",
        "API calls",
      ],
      correctAnswer: 1,
    },
  ],
};

async function main() {
  console.log("🚀 Adding synthetic data for empty categories...\n");

  for (const [categorySlug, questions] of Object.entries(
    syntheticQuestions
  )) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      console.log(`❌ Category not found: ${categorySlug}`);
      continue;
    }

    console.log(`\n📂 ${category.name}:`);
    let addedCount = 0;

    for (const q of questions) {
      // Check if already exists
      const existing = await prisma.question.findFirst({
        where: {
          question: q.text,
          categoryId: category.id,
        },
      });

      if (!existing) {
        await prisma.question.create({
          data: {
            question: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            difficulty: "EASY",
            categoryId: category.id,
          },
        });
        addedCount++;
      }
    }

    console.log(`   ✅ Added ${addedCount} questions`);
  }

  console.log("\n✨ Synthetic data import complete!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
