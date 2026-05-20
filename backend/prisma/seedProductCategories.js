const prisma = require("../src/config/prisma");

const categories = [
  { name: "PDF Books", slug: "pdf-books" },
  { name: "E-Books (PLR)", slug: "ebooks-plr" },
  { name: "Workbooks & Planners", slug: "workbooks-planners" },
  { name: "Templates", slug: "templates" },
  { name: "Digital Courses", slug: "digital-courses" },
  { name: "Digital Tools & Software", slug: "digital-tools-software" },
];

async function main() {
  for (const category of categories) {
    const existing = await prisma.productCategory.findUnique({
      where: { slug: category.slug },
    });

    const result = await prisma.productCategory.upsert({
      where: { slug: category.slug },
      create: {
        name: category.name,
        slug: category.slug,
        is_active: true,
      },
      update: {
        name: category.name,
        is_active: true,
      },
    });

    if (existing) {
      console.log(`Updated category: ${result.name} (${result.slug})`);
    } else {
      console.log(`Created category: ${result.name} (${result.slug})`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Product category seeding complete.");
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seed script failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
