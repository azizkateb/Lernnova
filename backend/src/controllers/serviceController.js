const slugify = require("slugify");
const path = require("path");
const fs = require("fs");
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
          images: {
            where: {
              is_cover: true,
            },
            select: {
              id: true,
              image_url: true,
              is_cover: true,
              order_index: true,
            },
            take: 1,
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
            profile_slug: true,
            public_id: true,
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
            profile_slug: true,
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
            avatar_url: true,
            headline: true,
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

// POST /api/services/:serviceId/thumbnail
const uploadServiceThumbnailHandler = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // Find service
    const service = await prisma.service.findUnique({
      where: {
        id: Number(serviceId),
      },
      include: {
        images: {
          where: {
            is_cover: true,
          },
        },
      },
    });

    if (!service) {
      // Delete uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete file:", err);
      });
      return res.status(404).json({
        message: "Service not found",
      });
    }

    // Check authorization
    const isOwner = service.user_id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      // Delete uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete file:", err);
      });
      return res.status(403).json({
        message: "You are not allowed to upload thumbnail for this service",
      });
    }

    // Generate relative path for storage
    const relativePath = `uploads/service-thumbnails/${req.file.filename}`;

    // Delete previous cover image if exists
    if (service.images && service.images.length > 0) {
      const previousCover = service.images[0];
      // Delete from database
      await prisma.serviceImage.delete({
        where: {
          id: previousCover.id,
        },
      });
      // Try to delete from filesystem
      if (previousCover.image_url) {
        const previousPath = path.join(
          __dirname,
          "../../",
          previousCover.image_url
        );
        fs.unlink(previousPath, (err) => {
          if (err) console.warn("Could not delete previous thumbnail:", err);
        });
      }
    }

    // Create new ServiceImage with is_cover=true
    const newImage = await prisma.serviceImage.create({
      data: {
        service_id: service.id,
        image_url: relativePath,
        is_cover: true,
        order_index: 0,
      },
    });

    // Fetch updated service with images
    const updatedService = await prisma.service.findUnique({
      where: {
        id: Number(serviceId),
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
            profile_slug: true,
            name: true,
            role: true,
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

    res.json({
      message: "Service thumbnail uploaded successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Upload service thumbnail error:", error);
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete file:", err);
      });
    }
    res.status(500).json({
      message: "Server error while uploading service thumbnail",
    });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  uploadServiceThumbnailHandler,
};