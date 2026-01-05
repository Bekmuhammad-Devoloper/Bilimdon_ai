import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Category slug to icon mapping
const categoryIcons: Record<string, string> = {
  'cpp': '/img/c++-logo.png',
  'django': '/img/django-logo.png',
  'docker': '/img/docker-logo.png',
  'expressjs': '/img/express.js-logo.png',
  'fizika': '/img/fizika-logo.png',
  'git': '/img/git-logo.png',
  'go': '/img/Go-Logo_Aqua.png',
  'html-css': '/img/html-css-logo.png',
  'ingliz-tili': '/img/english-logo.png',
  'java': '/img/Java-logo.png',
  'javascript': '/img/JavaScript-logo.png',
  'linux': '/img/linux-logo.png',
  'matematika': '/img/matematika-logo.png',
  'mongodb': '/img/mongodb-logo.png',
  'nestjs': '/img/nestjs-logo.png',
  'nextjs': '/img/next.js-logo.png',
  'nodejs': '/img/node.js-logo.png',
  'postgresql': '/img/postgreSql-logo.png',
  'python': '/img/Python-logo.png',
  'react': '/img/react-logo.png',
  'redis': '/img/redis-logo.png',
  'rust': '/img/rust-logo.png',
  'sql': '/img/sql-logo.png',
  'tailwindcss': '/img/tailwind-css-logo.png',
  'tarix': '/img/history-logo.png',
  'typescript': '/img/TypeScript-logo.png',
  'vuejs': '/img/vue.js-logo.png',
};

// Category descriptions
const categoryDescriptions: Record<string, string> = {
  'cpp': 'C++ dasturlash tili',
  'django': 'Django web framework',
  'docker': 'Docker konteyner texnologiyasi',
  'expressjs': 'Express.js Node.js framework',
  'fizika': 'Fizika fani asoslari',
  'git': 'Git versiya nazorati',
  'go': 'Go dasturlash tili',
  'html-css': 'HTML va CSS web texnologiyalari',
  'ingliz-tili': 'Ingliz tili grammatikasi',
  'java': 'Java dasturlash tili',
  'javascript': 'JavaScript dasturlash tili',
  'linux': 'Linux operatsion tizimi',
  'matematika': 'Matematika asoslari',
  'mongodb': 'MongoDB NoSQL database',
  'nestjs': 'NestJS Node.js framework',
  'nextjs': 'Next.js React framework',
  'nodejs': 'Node.js runtime environment',
  'postgresql': 'PostgreSQL database',
  'python': 'Python dasturlash tili',
  'react': 'React JavaScript kutubxonasi',
  'redis': 'Redis in-memory database',
  'rust': 'Rust dasturlash tili',
  'sql': 'SQL database tili',
  'tailwindcss': 'Tailwind CSS framework',
  'tarix': 'Jahon va O\'zbekiston tarixi',
  'typescript': 'TypeScript dasturlash tili',
  'vuejs': 'Vue.js JavaScript framework',
};

async function updateCategoryIcons() {
  console.log('🖼️  Kategoriya ikonlarini yangilash...\n');

  const categories = await prisma.category.findMany();
  let updated = 0;

  for (const category of categories) {
    const icon = categoryIcons[category.slug];
    const description = categoryDescriptions[category.slug];
    
    if (icon || description) {
      await prisma.category.update({
        where: { id: category.id },
        data: {
          ...(icon && { icon }),
          ...(description && { description }),
        },
      });
      console.log(`✅ ${category.name}: ${icon || 'no icon'}`);
      updated++;
    } else {
      console.log(`⚠️  ${category.name} (${category.slug}): No icon mapping found`);
    }
  }

  console.log(`\n========================================`);
  console.log(`✅ Updated: ${updated} categories`);
  console.log(`========================================`);
}

updateCategoryIcons()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
