require("dotenv").config();
const crypto = require("crypto");
const prisma = require("../src/config/prisma");
const { generateProfileSlug } = require("../src/utils/slugify");

const generatePublicId = () => crypto.randomUUID().replace(/-/g, "").substring(0, 24);

async function backfill() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { public_id: null },
        { public_id: "" },
        { profile_slug: null },
        { profile_slug: "" },
      ],
    },
    select: { id: true, name: true, public_id: true, profile_slug: true },
  });

  console.log(`Found ${users.length} user(s) needing backfill.`);

  let updated = 0;

  for (const user of users) {
    const updates = {};

    if (!user.public_id) {
      updates.public_id = generatePublicId();
    }

    const finalPublicId = updates.public_id || user.public_id;

    if (!user.profile_slug) {
      const baseSlug = generateProfileSlug(user.name);
      if (baseSlug) {
        let slug = baseSlug;
        let counter = 2;
        while (true) {
          const existing = await prisma.user.findFirst({
            where: { profile_slug: slug, id: { not: user.id } },
            select: { id: true },
          });
          if (!existing) break;
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        updates.profile_slug = slug;
      } else {
        updates.profile_slug = `user-${finalPublicId.substring(0, 12)}`;
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updates,
      });
      console.log(`  Updated user ${user.id} (${user.name}): public_id=${updates.public_id || "(kept)"} slug=${updates.profile_slug || "(kept)"}`);
      updated++;
    }
  }

  console.log(`Backfill complete. ${updated} user(s) updated.`);
  await prisma.$disconnect?.();
}

backfill().catch(async (err) => {
  console.error("Backfill failed:", err);
  await prisma.$disconnect?.();
  process.exit(1);
});
