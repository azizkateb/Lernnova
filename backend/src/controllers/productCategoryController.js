const slugify = require("slugify");
const prisma = require("../config/prisma");

// GET /api/product-categories
const getProductCategories = async (req, res) => {
  try {
    const categories = await prisma.productCategory.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    res.json({
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get product categories error:", error);
    res.status(500).json({
      message: "Server error while fetching product categories",
    });
  }
};

// GET /api/product-categories/:id
const getProductCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.productCategory.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!category || !category.is_active) {
      return res.status(404).json({
        message: "Product category not found",
      });
    }

    res.json({
      category,
    });
  } catch (error) {
    console.error("Get product category error:", error);
    res.status(500).json({
      message: "Server error while fetching product category",
    });
  }
};

// POST /api/product-categories
const createProductCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        message: "Product category name is required and must be at least 2 characters",
      });
    }

    const slug = slugify(name, {
      lower: true,
      strict: true,
      trim: true,
    });

    const existingCategory = await prisma.productCategory.findUnique({
      where: {
        slug,
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Product category already exists",
      });
    }

    const category = await prisma.productCategory.create({
      data: {
        name: name.trim(),
        slug,
        description: description || null,
      },
    });

    res.status(201).json({
      message: "Product category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create product category error:", error);
    res.status(500).json({
      message: "Server error while creating product category",
    });
  }
};

// PUT /api/product-categories/:id
const updateProductCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const category = await prisma.productCategory.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Product category not found",
      });
    }

    let newSlug = category.slug;

    if (name && name.trim() !== category.name) {
      newSlug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
      });

      const existingCategory = await prisma.productCategory.findUnique({
        where: {
          slug: newSlug,
        },
      });

      if (existingCategory && existingCategory.id !== Number(id)) {
        return res.status(400).json({
          message: "Product category name already exists",
        });
      }
    }

    const updatedCategory = await prisma.productCategory.update({
      where: {
        id: Number(id),
      },
      data: {
        name: name ? name.trim() : category.name,
        slug: newSlug,
        description:
          description !== undefined ? description : category.description,
        is_active:
          is_active !== undefined ? Boolean(is_active) : category.is_active,
      },
    });

    res.json({
      message: "Product category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Update product category error:", error);
    res.status(500).json({
      message: "Server error while updating product category",
    });
  }
};

// DELETE /api/product-categories/:id
// Soft delete
const deleteProductCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.productCategory.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Product category not found",
      });
    }

    await prisma.productCategory.update({
      where: {
        id: Number(id),
      },
      data: {
        is_active: false,
      },
    });

    res.json({
      message: "Product category deleted successfully",
    });
  } catch (error) {
    console.error("Delete product category error:", error);
    res.status(500).json({
      message: "Server error while deleting product category",
    });
  }
};

module.exports = {
  getProductCategories,
  getProductCategoryById,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
};