const slugify = require("slugify");
const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");

const safeParseJsonArray = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const normalizeStringArray = (value, limit) => {
  const arr = safeParseJsonArray(value);
  if (!arr) return null;
  const cleaned = arr
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  return cleaned.slice(0, limit);
};

const isLocalProductImagePath = (value) => {
  if (!value || typeof value !== "string") return false;
  const cleaned = value.startsWith("/") ? value.slice(1) : value;
  return (
    cleaned.startsWith("uploads/product-thumbnails/") ||
    cleaned.startsWith("uploads/product-gallery/")
  );
};

const deleteLocalProductImage = (value) => {
  if (!isLocalProductImagePath(value)) return;
  const cleaned = value.startsWith("/") ? value.slice(1) : value;
  const filePath = path.join(__dirname, "../../", cleaned);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    return;
  }
};

const withProductImageAliases = (product) => {
  if (!product || typeof product !== "object") return product;
  const galleryImages =
    Array.isArray(product.gallery_images) || product.gallery_images == null
      ? product.gallery_images
      : null;
  return {
    ...product,
    thumbnail: product.thumbnail_url || null,
    galleryImages,
  };
};

// Helper: create unique slug
const generateUniqueSlug = async (title) => {
  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (!existingProduct) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const { search, category_id, featured, language } = req.query;

    const where = {
      status: "active",
    };

    if (category_id) {
      const parsedCategoryId = Number(category_id);
      if (!Number.isNaN(parsedCategoryId)) where.category_id = parsedCategoryId;
    }

    const parseBoolean = (value) => {
      if (value === undefined) return undefined;
      if (typeof value === "boolean") return value;
      const normalized = String(value).toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
      return undefined;
    };

    const featuredBool = parseBoolean(featured);
    if (featuredBool !== undefined) {
      where.is_featured = featuredBool;
    }

    const normalizedLanguage =
      typeof language === "string" ? language.toLowerCase().trim() : undefined;
    const isValidLanguage =
      normalizedLanguage && ["ar", "en", "de"].includes(normalizedLanguage);

    if (isValidLanguage) {
      where.language = normalizedLanguage;
    } else if (language) {
      return res.status(400).json({
        message: "Invalid language. Allowed values: ar, en, de",
      });
    } else if (!req.user) {
      where.language = "en";
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
          },
        },
        {
          short_description: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
      ];
    }

    const baseSelect = {
      id: true,
      title: true,
      slug: true,
      short_description: true,
      price: true,
      thumbnail_url: true,
      gallery_images: true,
      status: true,
      is_featured: true,
      language: true,
      created_at: true,
      updated_at: true,
      user: {
        select: {
          id: true,
          profile_slug: true,
          name: true,
          role: true,
          avatar_url: true,
          headline: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          files: true,
          orders: true,
        },
      },
    };

    const fetchWithSelect = async (select) => {
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            created_at: "desc",
          },
          select,
        }),
        prisma.product.count({ where }),
      ]);
      return { products, total };
    };

    let products;
    let total;
    try {
      ({ products, total } = await fetchWithSelect(baseSelect));
    } catch (error) {
      const message = String(error?.message || "");
      const isLanguageColumnError =
        /language/i.test(message) &&
        (/(unknown\s+argument|unknown\s+field|unknown\s+column)/i.test(message) ||
          /column.*does\s+not\s+exist/i.test(message));

      const isGalleryImagesColumnError =
        /gallery_images/i.test(message) &&
        (/(unknown\s+argument|unknown\s+field|unknown\s+column)/i.test(message) ||
          /column.*does\s+not\s+exist/i.test(message));

      if (!isLanguageColumnError && !isGalleryImagesColumnError) throw error;

      const fallbackWhere = { ...where };
      if (isLanguageColumnError) delete fallbackWhere.language;

      const fallbackSelect = { ...baseSelect };
      if (isLanguageColumnError) delete fallbackSelect.language;
      if (isGalleryImagesColumnError) delete fallbackSelect.gallery_images;

      const [fallbackProducts, fallbackTotal] = await Promise.all([
        prisma.product.findMany({
          where: fallbackWhere,
          skip,
          take: limit,
          orderBy: {
            created_at: "desc",
          },
          select: fallbackSelect,
        }),
        prisma.product.count({ where: fallbackWhere }),
      ]);

      products = fallbackProducts;
      total = fallbackTotal;
    }

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      products: Array.isArray(products) ? products.map(withProductImageAliases) : products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      message: "Server error while fetching products",
    });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const baseSelect = {
      id: true,
      title: true,
      slug: true,
      short_description: true,
      description: true,
      price: true,
      thumbnail_url: true,
      gallery_images: true,
      status: true,
      is_featured: true,
      language: true,
      created_at: true,
      updated_at: true,
      user: {
        select: {
          id: true,
          profile_slug: true,
          name: true,
          role: true,
          avatar_url: true,
          headline: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      files: {
        select: {
          id: true,
          file_name: true,
          file_size: true,
          created_at: true,
        },
      },
    };

    let product;
    try {
      product = await prisma.product.findUnique({
        where: {
          id,
        },
        select: baseSelect,
      });
    } catch (error) {
      const message = String(error?.message || "");
      const isLanguageColumnError =
        /language/i.test(message) &&
        (/(unknown\s+argument|unknown\s+field|unknown\s+column)/i.test(message) ||
          /column.*does\s+not\s+exist/i.test(message));
      const isGalleryImagesColumnError =
        /gallery_images/i.test(message) &&
        (/(unknown\s+argument|unknown\s+field|unknown\s+column)/i.test(message) ||
          /column.*does\s+not\s+exist/i.test(message));

      if (!isLanguageColumnError && !isGalleryImagesColumnError) throw error;

      const fallbackSelect = { ...baseSelect };
      if (isLanguageColumnError) delete fallbackSelect.language;
      if (isGalleryImagesColumnError) delete fallbackSelect.gallery_images;

      product = await prisma.product.findUnique({
        where: {
          id,
        },
        select: fallbackSelect,
      });
    }

    if (!product || product.status === "inactive") {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      product: withProductImageAliases(product),
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      message: "Server error while fetching product",
    });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const {
      category_id,
      title,
      short_description,
      description,
      price,
      thumbnail_url,
      status,
      is_featured,
      language,
      galleryImages,
      gallery_images,
    } = req.body;

    if (!category_id || !title || price === undefined) {
      return res.status(400).json({
        message: "category_id, title and price are required",
      });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({
        message: "Product title must be at least 3 characters",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        message: "Price must be greater than or equal to 0",
      });
    }

    const category = await prisma.productCategory.findUnique({
      where: {
        id: Number(category_id),
      },
    });

    if (!category || !category.is_active) {
      return res.status(404).json({
        message: "Product category not found or inactive",
      });
    }

    const slug = await generateUniqueSlug(title);

    const uploadedThumbnail = req.files?.thumbnail?.[0] || null;
    const uploadedGallery = Array.isArray(req.files?.galleryImages)
      ? req.files.galleryImages
      : [];

    const uploadedGalleryPaths = uploadedGallery
      .map((file) => file?.filename)
      .filter(Boolean)
      .map((name) => `uploads/product-gallery/${name}`);

    const desiredGallery = normalizeStringArray(galleryImages || gallery_images, 3) || [];
    const mergedGallery = [...desiredGallery, ...uploadedGalleryPaths].slice(0, 3);

    const nextThumbnail =
      uploadedThumbnail?.filename
        ? `uploads/product-thumbnails/${uploadedThumbnail.filename}`
        : thumbnail_url || null;

    const data = {
      user_id: req.user.id,
      category_id: Number(category_id),
      title: title.trim(),
      slug,
      short_description: short_description || null,
      description: description || null,
      price: Number(price),
      thumbnail_url: nextThumbnail,
      gallery_images: mergedGallery.length ? mergedGallery : null,
      status: status || "draft",
      is_featured: Boolean(is_featured) || false,
      language: language || "en",
    };

    const baseSelect = {
      id: true,
      title: true,
      slug: true,
      short_description: true,
      description: true,
      price: true,
      thumbnail_url: true,
      gallery_images: true,
      status: true,
      is_featured: true,
      language: true,
      created_at: true,
      updated_at: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          profile_slug: true,
          name: true,
          role: true,
        },
      },
    };
 

    let product;
    try {
      product = await prisma.product.create({
        data,
        select: baseSelect,
      });
    } catch (error) {
      const message = String(error?.message || "");
      const isLanguageColumnError =
        /language/i.test(message) &&
        (/(unknown\s+argument|unknown\s+field|unknown\s+column)/i.test(message) ||
          /column.*does\s+not\s+exist/i.test(message));
      const isGalleryImagesColumnError =
        /gallery_images/i.test(message) &&
        (/(unknown\s+argument|unknown\s+field|unknown\s+column)/i.test(message) ||
          /column.*does\s+not\s+exist/i.test(message));

      if (!isLanguageColumnError && !isGalleryImagesColumnError) throw error;

      const fallbackData = { ...data };
      if (isLanguageColumnError) delete fallbackData.language;
      if (isGalleryImagesColumnError) delete fallbackData.gallery_images;

      const fallbackSelect = { ...baseSelect };
      if (isLanguageColumnError) delete fallbackSelect.language;
      if (isGalleryImagesColumnError) delete fallbackSelect.gallery_images;

      product = await prisma.product.create({
        data: fallbackData,
        select: fallbackSelect,
      });
    }

    res.status(201).json({
      message: "Product created successfully",
      product: withProductImageAliases(product),
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      message: "Server error while creating product",
    });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const {
      category_id,
      title,
      short_description,
      description,
      price,
      thumbnail_url,
      status,
      is_featured,
      language,
      galleryImages,
      gallery_images,
    } = req.body;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        user_id: true,
        category_id: true,
        title: true,
        slug: true,
        short_description: true,
        description: true,
        price: true,
        thumbnail_url: true,
        gallery_images: true,
        status: true,
        is_featured: true,
        language: true,
      },
    }).catch(async (error) => {
      const message = String(error?.message || "");
      const isGalleryImagesColumnError =
        /gallery_images/i.test(message) &&
        (/(unknown\s+argument|unknown\s+field|unknown\s+column)/i.test(message) ||
          /column.*does\s+not\s+exist/i.test(message));
      if (!isGalleryImagesColumnError) throw error;
      return prisma.product.findUnique({
        where: {
          id,
        },
      });
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const isOwner = product.user_id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to update this product",
      });
    }

    let newSlug = product.slug;

    if (title && title.trim() !== product.title) {
      newSlug = await generateUniqueSlug(title);
    }

    if (category_id) {
      const category = await prisma.productCategory.findUnique({
        where: {
          id: Number(category_id),
        },
      });

      if (!category || !category.is_active) {
        return res.status(404).json({
          message: "Product category not found or inactive",
        });
      }
    }

    const uploadedThumbnail = req.files?.thumbnail?.[0] || null;
    const uploadedGallery = Array.isArray(req.files?.galleryImages)
      ? req.files.galleryImages
      : [];

    const uploadedGalleryPaths = uploadedGallery
      .map((file) => file?.filename)
      .filter(Boolean)
      .map((name) => `uploads/product-gallery/${name}`);

    const desiredGalleryRaw = galleryImages || gallery_images;
    const desiredGallery =
      desiredGalleryRaw !== undefined ? normalizeStringArray(desiredGalleryRaw, 3) || [] : null;

    const existingGallery = Array.isArray(product.gallery_images) ? product.gallery_images : [];
    const mergedGallery =
      desiredGallery != null
        ? [...desiredGallery, ...uploadedGalleryPaths].slice(0, 3)
        : [...existingGallery, ...uploadedGalleryPaths].slice(0, 3);

    if (desiredGallery != null && Array.isArray(product.gallery_images)) {
      const keep = new Set(mergedGallery);
      product.gallery_images.forEach((image) => {
        if (!keep.has(image)) deleteLocalProductImage(image);
      });
    }

    const nextThumbnail =
      uploadedThumbnail?.filename
        ? `uploads/product-thumbnails/${uploadedThumbnail.filename}`
        : thumbnail_url !== undefined
          ? thumbnail_url
          : product.thumbnail_url;

    if (
      uploadedThumbnail?.filename &&
      product.thumbnail_url &&
      product.thumbnail_url !== nextThumbnail
    ) {
      deleteLocalProductImage(product.thumbnail_url);
    }

    const baseSelect = {
      id: true,
      title: true,
      slug: true,
      short_description: true,
      description: true,
      price: true,
      thumbnail_url: true,
      gallery_images: true,
      status: true,
      is_featured: true,
      language: true,
      created_at: true,
      updated_at: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          profile_slug: true,
          name: true,
          role: true,
          avatar_url: true,
          headline: true,
        },
      },
    };

    const data = {
      category_id: category_id ? Number(category_id) : product.category_id,
      title: title ? title.trim() : product.title,
      slug: newSlug,
      short_description:
        short_description !== undefined ? short_description : product.short_description,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? Number(price) : product.price,
      thumbnail_url: nextThumbnail,
      gallery_images:
        desiredGalleryRaw !== undefined || uploadedGalleryPaths.length
          ? mergedGallery.length
            ? mergedGallery
            : null
          : product.gallery_images,
      status: status || product.status,
      is_featured: is_featured !== undefined ? Boolean(is_featured) : product.is_featured,
      language: language || product.language,
    };

    let updatedProduct;
    try {
      updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data,
      select: baseSelect,
      });
    } catch (error) {
      const message = String(error?.message || "");
      const isLanguageColumnError =
        /language/i.test(message) &&
        (/(unknown\s+argument|unknown\s+field|unknown\s+column)/i.test(message) ||
          /column.*does\s+not\s+exist/i.test(message));
      const isGalleryImagesColumnError =
        /gallery_images/i.test(message) &&
        (/(unknown\s+argument|unknown\s+field|unknown\s+column)/i.test(message) ||
          /column.*does\s+not\s+exist/i.test(message));

      if (!isLanguageColumnError && !isGalleryImagesColumnError) throw error;

      const fallbackData = { ...data };
      if (isLanguageColumnError) delete fallbackData.language;
      if (isGalleryImagesColumnError) delete fallbackData.gallery_images;

      const fallbackSelect = { ...baseSelect };
      if (isLanguageColumnError) delete fallbackSelect.language;
      if (isGalleryImagesColumnError) delete fallbackSelect.gallery_images;

      updatedProduct = await prisma.product.update({
        where: {
          id,
        },
        data: fallbackData,
        select: fallbackSelect,
      });
    }

    res.json({
      message: "Product updated successfully",
      product: withProductImageAliases(updatedProduct),
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      message: "Server error while updating product",
    });
  }
};

// DELETE /api/products/:id
// Soft delete: status = inactive
const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const isOwner = product.user_id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to delete this product",
      });
    }

    await prisma.product.update({
      where: {
        id,
      },
      data: {
        status: "inactive",
      },
    });

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      message: "Server error while deleting product",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
