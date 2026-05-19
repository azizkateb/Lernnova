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
    const existingService = await prisma.service.findUnique({
      where: { slug },
    });

    if (!existingService) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// GET /api/services
const getServices = async (req, res) => {
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

    const [services, total] = await Promise.all([
      prisma.service.findMany({
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
          delivery_time: true,
          status: true,
          is_featured: true,
          created_at: true,
          updated_at: true,
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            select: {
              id: true,
              image_url: true,
              is_cover: true,
              order_index: true,
            },
            orderBy: {
              order_index: "asc",
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),

      prisma.service.count({ where }),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      services,
    });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({
      message: "Server error while fetching services",
    });
  }
};

// GET /api/services/:id
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
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
        delivery_time: true,
        status: true,
        is_featured: true,
        created_at: true,
        updated_at: true,
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          select: {
            id: true,
            image_url: true,
            is_cover: true,
            order_index: true,
          },
          orderBy: {
            order_index: "asc",
          },
        },
      },
    });

    if (!service || service.status === "inactive") {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.json({
      service,
    });
  } catch (error) {
    console.error("Get service error:", error);
    res.status(500).json({
      message: "Server error while fetching service",
    });
  }
};

// POST /api/services
const createService = async (req, res) => {
  try {
    const {
      category_id,
      title,
      short_description,
      description,
      price,
      delivery_time,
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
        message: "Service title must be at least 3 characters",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        message: "Price must be greater than or equal to 0",
      });
    }

    const category = await prisma.category.findUnique({
      where: {
        id: Number(category_id),
      },
    });

    if (!category || !category.is_active) {
      return res.status(404).json({
        message: "Category not found or inactive",
      });
    }

    const slug = await generateUniqueSlug(title);

    const service = await prisma.service.create({
      data: {
        user_id: req.user.id,
        category_id: Number(category_id),
        title: title.trim(),
        slug,
        short_description: short_description || null,
        description: description || null,
        price: Number(price),
        delivery_time: delivery_time ? Number(delivery_time) : null,
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
        delivery_time: true,
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
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({
      message: "Server error while creating service",
    });
  }
};

// PUT /api/services/:id
const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      category_id,
      title,
      short_description,
      description,
      price,
      delivery_time,
      status,
      is_featured,
    } = req.body;

    const service = await prisma.service.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    const isOwner = service.user_id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to update this service",
      });
    }

    let newSlug = service.slug;

    if (title && title.trim() !== service.title) {
      newSlug = await generateUniqueSlug(title);
    }

    if (category_id) {
      const category = await prisma.category.findUnique({
        where: {
          id: Number(category_id),
        },
      });

      if (!category || !category.is_active) {
        return res.status(404).json({
          message: "Category not found or inactive",
        });
      }
    }

    const updatedService = await prisma.service.update({
      where: {
        id: Number(id),
      },
      data: {
        category_id: category_id ? Number(category_id) : service.category_id,
        title: title ? title.trim() : service.title,
        slug: newSlug,
        short_description:
          short_description !== undefined
            ? short_description
            : service.short_description,
        description:
          description !== undefined ? description : service.description,
        price: price !== undefined ? Number(price) : service.price,
        delivery_time:
          delivery_time !== undefined ? Number(delivery_time) : service.delivery_time,
        status: status || service.status,
        is_featured:
          is_featured !== undefined ? Boolean(is_featured) : service.is_featured,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        short_description: true,
        description: true,
        price: true,
        delivery_time: true,
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

    res.json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({
      message: "Server error while updating service",
    });
  }
};

// DELETE /api/services/:id
// Soft delete: status = inactive
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    const isOwner = service.user_id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to delete this service",
      });
    }

    await prisma.service.update({
      where: {
        id: Number(id),
      },
      data: {
        status: "inactive",
      },
    });

    res.json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({
      message: "Server error while deleting service",
    });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};