const slugify = require("slugify");
const prisma = require("../config/prisma");

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
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
            services: true,
          },
        },
      },
    });

    res.json({
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      message: "Server error while fetching categories",
    });
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
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
        message: "Category not found",
      });
    }

    res.json({
      category,
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      message: "Server error while fetching category",
    });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        message: "Category name is required and must be at least 2 characters",
      });
    }

    const slug = slugify(name, {
      lower: true,
      strict: true,
      trim: true,
    });

    const existingCategory = await prisma.category.findUnique({
      where: {
        slug,
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description || null,
      },
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      message: "Server error while creating category",
    });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const category = await prisma.category.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    let newSlug = category.slug;

    if (name && name.trim() !== category.name) {
      newSlug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
      });

      const existingCategory = await prisma.category.findUnique({
        where: {
          slug: newSlug,
        },
      });

      if (existingCategory && existingCategory.id !== Number(id)) {
        return res.status(400).json({
          message: "Category name already exists",
        });
      }
    }

    const updatedCategory = await prisma.category.update({
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
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      message: "Server error while updating category",
    });
  }
};

// DELETE /api/categories/:id
// Soft delete: لا نحذف فعلياً، فقط نجعل is_active = false
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    await prisma.category.update({
      where: {
        id: Number(id),
      },
      data: {
        is_active: false,
      },
    });

    res.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      message: "Server error while deleting category",
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};