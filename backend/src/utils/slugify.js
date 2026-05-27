const generateProfileSlug = (name) => {
  if (!name || typeof name !== "string") return null;

  let slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug || slug.length < 2) return null;

  return slug;
};

const ensureUniqueSlug = async (prisma, baseSlug, currentUserId) => {
  if (!baseSlug) return null;

  let slug = baseSlug;
  let counter = 2;

  const where = currentUserId
    ? { profile_slug: slug, id: { not: currentUserId } }
    : { profile_slug: slug };

  while (await prisma.user.findFirst({ where })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

module.exports = { generateProfileSlug, ensureUniqueSlug };
