const slugify = require("slugify");
const prisma = require("../config/prisma");

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

    const { search, category_id, featured } = req.query;

    const where = {
      status: "active",
    };

    if (category_id) {
      where.category_id = Number(category_id);
    }

    if (featured !== undefined) {
      where.is_featured = featured === "true";
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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          title: true,
          slug: true,
          short_description: true,
          price: true,
          thumbnail_url: true,
          status: true,
          is_featured: true,
          created_at: true,
          updated_at: true,
          user: {
            select: {
              id: true,
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
        },
      }),

      prisma.product.count({ where }),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      products,
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
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        short_description: true,
        description: true,
        price: true,
        thumbnail_url: true,
        status: true,
        is_featured: true,
        created_at: true,
        updated_at: true,
        user: {
          select: {
            id: true,
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
      },
    });

    if (!product || product.status === "inactive") {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      product,
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

    const product = await prisma.product.create({
      data: {
        user_id: req.user.id,
        category_id: Number(category_id),
        title: title.trim(),
        slug,
        short_description: short_description || null,
        description: description || null,
        price: Number(price),
        thumbnail_url: thumbnail_url || null,
        status: status || "draft",
        is_featured: Boolean(is_featured) || false,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        short_description: true,
        description: true,
        price: true,
        thumbnail_url: true,
        status: true,
        is_featured: true,
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
            name: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
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
    const { id } = req.params;

    const {
      category_id,
      title,
      short_description,
      description,
      price,
      thumbnail_url,
      status,
      is_featured,
    } = req.body;

    const product = await prisma.product.findUnique({
      where: {
        id: Number(id),
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

    const updatedProduct = await prisma.product.update({
      where: {
        id: Number(id),
      },
      data: {
        category_id: category_id ? Number(category_id) : product.category_id,
        title: title ? title.trim() : product.title,
        slug: newSlug,
        short_description:
          short_description !== undefined
            ? short_description
            : product.short_description,
        description:
          description !== undefined ? description : product.description,
        price: price !== undefined ? Number(price) : product.price,
        thumbnail_url:
          thumbnail_url !== undefined ? thumbnail_url : product.thumbnail_url,
        status: status || product.status,
        is_featured:
          is_featured !== undefined ? Boolean(is_featured) : product.is_featured,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        short_description: true,
        description: true,
        price: true,
        thumbnail_url: true,
        status: true,
        is_featured: true,
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
            name: true,
            role: true,
            avatar_url: true,
            headline: true,
          },
        },
      },
    });

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
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
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: Number(id),
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
        id: Number(id),
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