const prisma = require("../config/prisma");

const decimalToNumber = (value) => Number(value || 0);

const paidServiceOrderWhere = (where = {}) => ({
  ...where,
  payment_status: "paid",
  status: {
    not: "cancelled",
  },
});

// GET /api/dashboard/seller/overview
const getSellerOverview = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const [
      totalServices,
      activeServices,
      totalProducts,
      activeProducts,
      totalServiceOrders,
      pendingServiceOrders,
      completedServiceOrders,
      paidServiceOrders,
      serviceRevenueAggregate,
      totalProductOrders,
      paidProductOrders,
      productRevenueAggregate,
      recentServiceOrders,
      recentProductOrders,
      topProducts,
    ] = await Promise.all([
      prisma.service.count({
        where: {
          user_id: sellerId,
        },
      }),

      prisma.service.count({
        where: {
          user_id: sellerId,
          status: "active",
        },
      }),

      prisma.product.count({
        where: {
          user_id: sellerId,
        },
      }),

      prisma.product.count({
        where: {
          user_id: sellerId,
          status: "active",
        },
      }),

      prisma.serviceOrder.count({
        where: {
          seller_id: sellerId,
        },
      }),

      prisma.serviceOrder.count({
        where: {
          seller_id: sellerId,
          status: "pending",
        },
      }),

      prisma.serviceOrder.count({
        where: {
          seller_id: sellerId,
          status: "completed",
        },
      }),

      prisma.serviceOrder.count({
        where: paidServiceOrderWhere({
          seller_id: sellerId,
        }),
      }),

      prisma.serviceOrder.aggregate({
        where: paidServiceOrderWhere({
          seller_id: sellerId,
        }),
        _sum: {
          price: true,
        },
      }),

      prisma.productOrder.count({
        where: {
          seller_id: sellerId,
        },
      }),

      prisma.productOrder.count({
        where: {
          seller_id: sellerId,
          payment_status: "paid",
        },
      }),

      prisma.productOrder.aggregate({
        where: {
          seller_id: sellerId,
          payment_status: "paid",
        },
        _sum: {
          price: true,
        },
      }),

      prisma.serviceOrder.findMany({
        where: {
          seller_id: sellerId,
        },
        take: 5,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          price: true,
          status: true,
          created_at: true,
          service: {
            select: {
              id: true,
              title: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
            },
          },
        },
      }),

      prisma.productOrder.findMany({
        where: {
          seller_id: sellerId,
        },
        take: 5,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          price: true,
          payment_status: true,
          order_status: true,
          created_at: true,
          product: {
            select: {
              id: true,
              title: true,
            },
          },
          buyer: {
            select: {
              id: true,
              profile_slug: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
          seller: {
            select: {
              id: true,
              profile_slug: true,
              name: true,
              avatar_url: true,
            },
          },
        },
      }),

      prisma.product.findMany({
        where: {
          user_id: sellerId,
        },
        take: 6,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          title: true,
          price: true,
          thumbnail_url: true,
          status: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
    ]);
    const serviceRevenue = decimalToNumber(serviceRevenueAggregate._sum.price);
    const productRevenue = decimalToNumber(productRevenueAggregate._sum.price);

    res.json({
      overview: {
        services: {
          total: totalServices,
          active: activeServices,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
        },
        service_orders: {
          total: totalServiceOrders,
          pending: pendingServiceOrders,
          completed: completedServiceOrders,
        },
        product_orders: {
          total: totalProductOrders,
          paid: paidProductOrders,
        },
        revenue: {
          services: serviceRevenue,
          products: productRevenue,
          total: serviceRevenue + productRevenue,
        },
        paid_service_orders: paidServiceOrders,
      },
      recent: {
        service_orders: recentServiceOrders,
        product_orders: recentProductOrders,
      },
      topProducts: topProducts.map(product => ({
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail_url,
        status: product.status,
        salesCount: product._count.orders,
      })),
    });
  } catch (error) {
    console.error("Seller dashboard overview error:", error);

    res.status(500).json({
      message: "Server error while fetching seller dashboard overview",
    });
  }
};

// GET /api/dashboard/admin/overview
const getAdminOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      totalAdmins,
      totalServices,
      activeServices,
      totalProducts,
      activeProducts,
      totalServiceOrders,
      paidServiceOrders,
      serviceRevenueAggregate,
      totalProductOrders,
      paidProductOrders,
      productRevenueAggregate,
      recentUsers,
      recentServiceOrders,
      recentProductOrders,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: {
          role: "buyer",
        },
      }),

      prisma.user.count({
        where: {
          role: "seller",
        },
      }),

      prisma.user.count({
        where: {
          role: "admin",
        },
      }),

      prisma.service.count(),

      prisma.service.count({
        where: {
          status: "active",
        },
      }),

      prisma.product.count(),

      prisma.product.count({
        where: {
          status: "active",
        },
      }),

      prisma.serviceOrder.count(),

      prisma.serviceOrder.count({
        where: paidServiceOrderWhere(),
      }),

      prisma.serviceOrder.aggregate({
        where: paidServiceOrderWhere(),
        _sum: {
          price: true,
        },
      }),

      prisma.productOrder.count(),

      prisma.productOrder.count({
        where: {
          payment_status: "paid",
        },
      }),

      prisma.productOrder.aggregate({
        where: {
          payment_status: "paid",
        },
        _sum: {
          price: true,
        },
      }),

      prisma.user.findMany({
        take: 5,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          is_active: true,
          created_at: true,
        },
      }),

      prisma.serviceOrder.findMany({
        take: 5,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          price: true,
          status: true,
          created_at: true,
          service: {
            select: {
              id: true,
              title: true,
            },
          },
          buyer: {
            select: {
              id: true,
              profile_slug: true,
              name: true,
              avatar_url: true,
            },
          },
          seller: {
            select: {
              id: true,
              profile_slug: true,
              name: true,
              avatar_url: true,
            },
          },
        },
      }),

      prisma.productOrder.findMany({
        take: 5,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          price: true,
          payment_status: true,
          order_status: true,
          created_at: true,
          product: {
            select: {
              id: true,
              title: true,
            },
          },
          buyer: {
            select: {
              id: true,
              profile_slug: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
          seller: {
            select: {
              id: true,
              profile_slug: true,
              name: true,
            avatar_url: true,
            },
          },
        },
      }),
    ]);
    const serviceRevenue = decimalToNumber(serviceRevenueAggregate._sum.price);
    const productRevenue = decimalToNumber(productRevenueAggregate._sum.price);

    res.json({
      overview: {
        users: {
          total: totalUsers,
          buyers: totalBuyers,
          sellers: totalSellers,
          admins: totalAdmins,
        },
        services: {
          total: totalServices,
          active: activeServices,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
        },
        service_orders: {
          total: totalServiceOrders,
          paid: paidServiceOrders,
        },
        product_orders: {
          total: totalProductOrders,
          paid: paidProductOrders,
        },
        revenue: {
          services: serviceRevenue,
          products: productRevenue,
          total: serviceRevenue + productRevenue,
        },
      },
      recent: {
        users: recentUsers,
        service_orders: recentServiceOrders,
        product_orders: recentProductOrders,
      },
    });
  } catch (error) {
    console.error("Admin dashboard overview error:", error);

    res.status(500).json({
      message: "Server error while fetching admin dashboard overview",
    });
  }
};

// GET /api/dashboard/admin/users
const getAdminUsers = async (req, res) => {
  try {
    const { page, limit, role, is_active, search } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};

    if (role) {
      where.role = role;
    }

    if (typeof is_active !== "undefined") {
      where.is_active = is_active === "true" || is_active === true;
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        {
          name: {
            contains: searchTerm,
          },
        },
        {
          email: {
            contains: searchTerm,
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          public_id: true,
          profile_slug: true,
          name: true,
          email: true,
          role: true,
          is_active: true,
          avatar_url: true,
          headline: true,
          created_at: true,
          updated_at: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
      data: users,
    });
  } catch (error) {
    console.error("Get admin users error:", error);
    res.status(500).json({
      message: "Server error while fetching admin users",
      error: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
};

// GET /api/dashboard/admin/services
const getAdminServices = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const status = req.query.status;
    const categoryId = req.query.category_id;
    const search = req.query.search;
    const language = req.query.language;

    const skip = (page - 1) * limit;
    const where = {};

    if (status && ["draft", "active", "inactive"].includes(status)) {
      where.status = status;
    }

    if (categoryId) {
      const categoryIdNum = Number(categoryId);
      if (!Number.isNaN(categoryIdNum)) {
        where.category_id = categoryIdNum;
      }
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          short_description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
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
              email: true,
            },
          },
          _count: {
            select: {
              orders: true,
              images: true,
            },
          },
        },
      }),
      prisma.service.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      data: services,
    });
  } catch (error) {
    console.error("Get admin services error:", error);

    res.status(500).json({
      message: "Server error while fetching admin services",
    });
  }
};

// GET /api/dashboard/admin/products
const getAdminProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const status = req.query.status;
    const categoryId = req.query.category_id;
    const search = req.query.search;
    const language = req.query.language;

    const skip = (page - 1) * limit;
    const where = {};

    if (status && ["draft", "active", "inactive"].includes(status)) {
      where.status = status;
    }

    if (categoryId) {
      const categoryIdNum = Number(categoryId);
      if (!Number.isNaN(categoryIdNum)) {
        where.category_id = categoryIdNum;
      }
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          short_description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (language && ["ar", "en", "de"].includes(language)) {
      where.language = language;
    }

    const baseSelect = {
      id: true,
      title: true,
      slug: true,
      short_description: true,
      description: true,
      price: true,
      thumbnail_url: true,
      language: true,
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
          email: true,
        },
      },
      _count: {
        select: {
          orders: true,
          files: true,
        },
      },
    };

    const fetchWithSelect = async (select, whereClause) => {
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: {
            created_at: "desc",
          },
          select,
        }),
        prisma.product.count({ where: whereClause }),
      ]);

      return { products, total };
    };

    let products;
    let total;

    try {
      ({ products, total } = await fetchWithSelect(baseSelect, where));
    } catch (error) {
      console.error("[Admin Products] failed:", error);
      console.error(error.message);
      console.error(error.stack);

      const message = String(error?.message || "");
      const isLanguageColumnError =
        /language/i.test(message) &&
        (/(unknown\s+argument|unknown\s+field|unknown\s+column)/i.test(message) ||
          /column.*does\s+not\s+exist/i.test(message));

      if (!isLanguageColumnError) throw error;

      const fallbackWhere = { ...where };
      delete fallbackWhere.language;

      const fallbackSelect = { ...baseSelect };
      delete fallbackSelect.language;

      ({ products, total } = await fetchWithSelect(fallbackSelect, fallbackWhere));
    }

    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      data: products,
    });
  } catch (error) {
    console.error("[Admin Products] failed:", error);
    console.error(error.message);
    console.error(error.stack);
    console.error("Get admin products error:", error);

    res.status(500).json({
      message: "Server error while fetching admin products",
    });
  }
};

// GET /api/dashboard/admin/service-orders
const getAdminServiceOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const status = req.query.status;
    const buyerId = req.query.buyer_id;
    const sellerId = req.query.seller_id;

    const skip = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (buyerId) {
      where.buyer_id = Number(buyerId);
    }

    if (sellerId) {
      where.seller_id = Number(sellerId);
    }

    const [serviceOrders, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          price: true,
          status: true,
          payment_status: true,
          delivery_deadline: true,
          created_at: true,
          updated_at: true,
          service: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          buyer: {
            select: {
              id: true,
              profile_slug: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
          seller: {
            select: {
              id: true,
              profile_slug: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
          _count: {
            select: {
              messages: true,
              files: true,
            },
          },
        },
      }),
      prisma.serviceOrder.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      data: serviceOrders,
    });
  } catch (error) {
    console.error("Get admin service orders error:", error);

    res.status(500).json({
      message: "Server error while fetching admin service orders",
    });
  }
};

// GET /api/dashboard/admin/product-orders
const getAdminProductOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const paymentStatus = req.query.payment_status;
    const orderStatus = req.query.order_status;
    const buyerId = req.query.buyer_id;
    const sellerId = req.query.seller_id;

    const skip = (page - 1) * limit;
    const where = {};

    if (paymentStatus) {
      where.payment_status = paymentStatus;
    }

    if (orderStatus) {
      where.order_status = orderStatus;
    }

    if (buyerId) {
      where.buyer_id = Number(buyerId);
    }

    if (sellerId) {
      where.seller_id = Number(sellerId);
    }

    const [productOrders, total] = await Promise.all([
      prisma.productOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          price: true,
          payment_method: true,
          payment_status: true,
          order_status: true,
          created_at: true,
          updated_at: true,
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          buyer: {
            select: {
              id: true,
              profile_slug: true,
              name: true,
              email: true,
            },
          },
          seller: {
            select: {
              id: true,
              profile_slug: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.productOrder.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      data: productOrders,
    });
  } catch (error) {
    console.error("Get admin product orders error:", error);

    res.status(500).json({
      message: "Server error while fetching admin product orders",
    });
  }
};

// GET /api/dashboard/seller/services
const getSellerServices = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const status = req.query.status; // optional: active, inactive, archived

    const skip = (page - 1) * limit;

    const where = {
      user_id: sellerId,
    };

    if (status) {
      where.status = status;
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
  _count: {
    select: {
      orders: true,
      images: true,
    },
  },
}
      }),
      prisma.service.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      data: services,
    });
  } catch (error) {
    console.error("Get seller services error:", error);

    res.status(500).json({
      message: "Server error while fetching seller services",
    });
  }
};

// GET /api/dashboard/seller/products
const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const status = req.query.status; // optional: active, inactive, archived

    const skip = (page - 1) * limit;

    const where = {
      user_id: sellerId,
    };

    if (status) {
      where.status = status;
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
          description: true,
          price: true,
          thumbnail_url: true,
          language: true,
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

    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      data: products,
    });
  } catch (error) {
    console.error("Get seller products error:", error);

    res.status(500).json({
      message: "Server error while fetching seller products",
    });
  }
};
// GET /api/dashboard/seller/service-orders
const getSellerServiceOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const status = req.query.status; // optional: pending, in_progress, completed, cancelled

    const skip = (page - 1) * limit;

    const where = {
      seller_id: sellerId,
    };

    if (status) {
      where.status = status;
    }

    const [serviceOrders, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          price: true,
          status: true,
          payment_status: true,
          created_at: true,
          updated_at: true,
          service: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      }),
      prisma.serviceOrder.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      data: serviceOrders,
    });
  } catch (error) {
    console.error("Get seller service orders error:", error);

    res.status(500).json({
      message: "Server error while fetching seller service orders",
    });
  }
};

// GET /api/dashboard/seller/product-orders
const getSellerProductOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const paymentStatus = req.query.payment_status; // optional: pending, paid, refunded, failed
    const orderStatus = req.query.order_status; // optional: new, delivered, cancelled

    const skip = (page - 1) * limit;

    const where = {
      seller_id: sellerId,
    };

    if (paymentStatus) {
      where.payment_status = paymentStatus;
    }

    if (orderStatus) {
      where.order_status = orderStatus;
    }

    const [productOrders, total] = await Promise.all([
      prisma.productOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          price: true,
          payment_status: true,
          order_status: true,
          payment_method: true,
          created_at: true,
          updated_at: true,
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.productOrder.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      data: productOrders,
    });
  } catch (error) {
    console.error("Get seller product orders error:", error);

    res.status(500).json({
      message: "Server error while fetching seller product orders",
    });
  }
};

// GET /api/dashboard/buyer/overview
const getBuyerOverview = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const [
      totalServiceOrders,
      pendingServiceOrders,
      completedServiceOrders,
      totalProductOrders,
      paidProductOrders,
      totalServiceSpentAggregate,
      totalProductSpentAggregate,
      recentServiceOrders,
      recentProductOrders,
    ] = await Promise.all([
      prisma.serviceOrder.count({
        where: {
          buyer_id: buyerId,
        },
      }),

      prisma.serviceOrder.count({
        where: {
          buyer_id: buyerId,
          status: "pending",
        },
      }),

      prisma.serviceOrder.count({
        where: {
          buyer_id: buyerId,
          status: "completed",
        },
      }),

      prisma.productOrder.count({
        where: {
          buyer_id: buyerId,
        },
      }),

      prisma.productOrder.count({
        where: {
          buyer_id: buyerId,
          payment_status: "paid",
        },
      }),

      prisma.serviceOrder.aggregate({
        where: paidServiceOrderWhere({
          buyer_id: buyerId,
        }),
        _sum: {
          price: true,
        },
      }),

      prisma.productOrder.aggregate({
        where: {
          buyer_id: buyerId,
          payment_status: "paid",
        },
        _sum: {
          price: true,
        },
      }),

      prisma.serviceOrder.findMany({
        where: {
          buyer_id: buyerId,
        },
        take: 5,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          price: true,
          status: true,
          created_at: true,
          service: {
            select: {
              id: true,
              title: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
            },
          },
        },
      }),

      prisma.productOrder.findMany({
        where: {
          buyer_id: buyerId,
        },
        take: 5,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          price: true,
          payment_status: true,
          order_status: true,
          created_at: true,
          product: {
            select: {
              id: true,
              title: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);
    const totalServiceSpent = decimalToNumber(totalServiceSpentAggregate._sum.price);
    const totalProductSpent = decimalToNumber(totalProductSpentAggregate._sum.price);

    res.json({
      overview: {
        service_orders: {
          total: totalServiceOrders,
          pending: pendingServiceOrders,
          completed: completedServiceOrders,
        },
        product_orders: {
          total: totalProductOrders,
          paid: paidProductOrders,
        },
        spent: {
          services: totalServiceSpent,
          products: totalProductSpent,
          total: totalServiceSpent + totalProductSpent,
        },
      },
      recent: {
        service_orders: recentServiceOrders,
        product_orders: recentProductOrders,
      },
    });
  } catch (error) {
    console.error("Buyer dashboard overview error:", error);

    res.status(500).json({
      message: "Server error while fetching buyer dashboard overview",
    });
  }
};

// GET /api/dashboard/buyer/service-orders
const getBuyerServiceOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const status = req.query.status;

    const skip = (page - 1) * limit;

    const where = {
      buyer_id: buyerId,
    };

    if (status) {
      where.status = status;
    }

    const [serviceOrders, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          price: true,
          status: true,
          payment_status: true,
          delivery_deadline: true,
          created_at: true,
          updated_at: true,
          service: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: {
                select: {
                  image_url: true,
                  is_cover: true,
                  order_index: true,
                },
                orderBy: [
                  { is_cover: "desc" },
                  { order_index: "asc" },
                  { id: "asc" },
                ],
                take: 1,
              },
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
          _count: {
            select: {
              messages: true,
              files: true,
            },
          },
        },
      }),
      prisma.serviceOrder.count({ where }),
    ]);

    const sanitizedOrders = serviceOrders.map((order) => {
      const cover = order?.service?.images?.[0]?.image_url || null;
      const { images, ...service } = order.service || {};
      return {
        ...order,
        service: order.service ? { ...service, thumbnail_url: cover } : null,
      };
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      data: sanitizedOrders,
    });
  } catch (error) {
    console.error("Get buyer service orders error:", error);

    res.status(500).json({
      message: "Server error while fetching buyer service orders",
    });
  }
};

// GET /api/dashboard/buyer/product-orders
const getBuyerProductOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const paymentStatus = req.query.payment_status;
    const orderStatus = req.query.order_status;

    const skip = (page - 1) * limit;

    const where = {
      buyer_id: buyerId,
    };

    if (paymentStatus) {
      where.payment_status = paymentStatus;
    }

    if (orderStatus) {
      where.order_status = orderStatus;
    }

    const [productOrders, total] = await Promise.all([
      prisma.productOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          price: true,
          payment_method: true,
          payment_status: true,
          order_status: true,
          created_at: true,
          updated_at: true,
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail_url: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.productOrder.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      data: productOrders,
    });
  } catch (error) {
    console.error("Get buyer product orders error:", error);

    res.status(500).json({
      message: "Server error while fetching buyer product orders",
    });
  }
};

// PATCH /api/dashboard/admin/users/:id/status
const updateAdminUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    // Validate is_active is boolean
    if (typeof is_active !== "boolean") {
      return res
        .status(400)
        .json({ message: "is_active must be a boolean value" });
    }

    // Parse and validate id
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from changing their own status
    if (userId === req.user.id) {
      return res
        .status(400)
        .json({ message: "You cannot change your own account status." });
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deactivating the last active admin
    if (targetUser.role === "admin" && is_active === false) {
      const activeAdminCount = await prisma.user.count({
        where: { role: "admin", is_active: true },
      });
      if (activeAdminCount <= 1) {
        return res
          .status(400)
          .json({ message: "You cannot deactivate the last active admin." });
      }
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { is_active },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    return res.status(200).json({
      message: "User status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return res.status(500).json({ message: "Failed to update user status" });
  }
};

module.exports = {
  getSellerOverview,
  getAdminOverview,
  getAdminUsers,
  getAdminServices,
  getAdminProducts,
  getAdminServiceOrders,
  getAdminProductOrders,
  getSellerServices,
  getSellerProducts,
  getSellerServiceOrders,
  getSellerProductOrders,
  getBuyerOverview,
  getBuyerServiceOrders,
  getBuyerProductOrders,
  updateAdminUserStatus,
};
