const prisma = require("../src/config/prisma");

/**
 * Default Service Categories
 * Bilingual: English name + Arabic description
 */
const serviceCategories = [
  {
    name: "Programming",
    slug: "programming",
    description: "Web development, mobile apps, APIs, and software engineering services",
    descriptionAr: "تطوير الويب، تطبيقات الهاتف، واجهات البرمجة، وخدمات هندسة البرمجيات",
  },
  {
    name: "Design",
    slug: "design",
    description: "Graphic design, UI/UX, branding, and visual identity services",
    descriptionAr: "التصميم الجرافيكي، واجهة المستخدم، العلامة التجارية، والهوية البصرية",
  },
  {
    name: "Marketing",
    slug: "marketing",
    description: "Digital marketing, SEO, social media, and advertising services",
    descriptionAr: "التسويق الرقمي، تحسين محركات البحث، وسائل التواصل الاجتماعي، والإعلان",
  },
  {
    name: "Writing",
    slug: "writing",
    description: "Content writing, copywriting, translation, and technical writing",
    descriptionAr: "كتابة المحتوى، الكتابة الإعلانية، الترجمة، والكتابة التقنية",
  },
  {
    name: "Consulting",
    slug: "consulting",
    description: "Business consulting, strategy, and professional advisory services",
    descriptionAr: "استشارات الأعمال، الاستراتيجية، والخدمات الاستشارية المهنية",
  },
  {
    name: "Education",
    slug: "education",
    description: "Tutoring, training, course creation, and educational content",
    descriptionAr: "التدريس، التدريب، إنشاء الدورات، والمحتوى التعليمي",
  },
];

/**
 * Default Product Categories
 * Bilingual: English name + Arabic description
 */
const productCategories = [
  {
    name: "Templates",
    slug: "templates",
    description: "Ready-to-use templates for business, design, and productivity",
    descriptionAr: "قوالب جاهزة للاستخدام للأعمال والتصميم والإنتاجية",
  },
  {
    name: "E-books",
    slug: "ebooks",
    description: "Digital books, guides, and educational resources",
    descriptionAr: "كتب رقمية، أدلة، وموارد تعليمية",
  },
  {
    name: "Design Assets",
    slug: "design-assets",
    description: "Icons, illustrations, fonts, and graphic design resources",
    descriptionAr: "أيقونات، رسوم توضيحية، خطوط، وموارد التصميم الجرافيكي",
  },
  {
    name: "Digital Tools",
    slug: "digital-tools",
    description: "Software, scripts, plugins, and digital utilities",
    descriptionAr: "برامج، سكريبتات، إضافات، وأدوات رقمية",
  },
  {
    name: "Courses",
    slug: "courses",
    description: "Online courses, tutorials, and learning materials",
    descriptionAr: "دورات عبر الإنترنت، دروس، ومواد تعليمية",
  },
  {
    name: "Software",
    slug: "software",
    description: "Applications, tools, and software solutions",
    descriptionAr: "تطبيقات، أدوات، وحلول برمجية",
  },
];

/**
 * Seed Service Categories
 * Uses upsert to avoid duplicates on repeated runs
 */
async function seedServiceCategories() {
  console.log("\n📦 Seeding Service Categories...");
  
  let created = 0;
  let updated = 0;

  for (const category of serviceCategories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    const result = await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        is_active: true,
      },
      update: {
        name: category.name,
        description: category.description,
        is_active: true,
      },
    });

    if (existing) {
      updated++;
      console.log(`  ✏️  Updated: ${result.name} (${result.slug})`);
    } else {
      created++;
      console.log(`  ✅ Created: ${result.name} (${result.slug})`);
    }
  }

  console.log(`  📊 Service Categories: ${created} created, ${updated} updated`);
  return { created, updated };
}

/**
 * Seed Product Categories
 * Uses upsert to avoid duplicates on repeated runs
 */
async function seedProductCategories() {
  console.log("\n📦 Seeding Product Categories...");
  
  let created = 0;
  let updated = 0;

  for (const category of productCategories) {
    const existing = await prisma.productCategory.findUnique({
      where: { slug: category.slug },
    });

    const result = await prisma.productCategory.upsert({
      where: { slug: category.slug },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        is_active: true,
      },
      update: {
        name: category.name,
        description: category.description,
        is_active: true,
      },
    });

    if (existing) {
      updated++;
      console.log(`  ✏️  Updated: ${result.name} (${result.slug})`);
    } else {
      created++;
      console.log(`  ✅ Created: ${result.name} (${result.slug})`);
    }
  }

  console.log(`  📊 Product Categories: ${created} created, ${updated} updated`);
  return { created, updated };
}

/**
 * Main seed function
 */
async function main() {
  console.log("🌱 Starting database seed...");
  console.log("=".repeat(50));

  try {
    // Seed both category types
    const serviceStats = await seedServiceCategories();
    const productStats = await seedProductCategories();

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Seed completed successfully!");
    console.log(`   Total Service Categories: ${serviceStats.created + serviceStats.updated}`);
    console.log(`   Total Product Categories: ${productStats.created + productStats.updated}`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("\n❌ Seed failed:", error.message);
    throw error;
  }
}

// Execute seed
main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seed script error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
