const prisma = require("../config/prisma");

// POST /api/service-orders
const createServiceOrder = async (req, res) => {
  try {
    const { service_id } = req.body;

    if (!service_id) {
      return res.status(400).json({
        message: "service_id is required",
      });
    }

    const service = await prisma.service.findUnique({
      where: {
        id: Number(service_id),
      },
      select: {
        id: true,
        user_id: true,
        price: true,
        delivery_time: true,
        status: true,
      },
    });

    if (!service || service.status !== "active") {
      return res.status(404).json({
        message: "Service not found or not active",
      });
    }

    if (service.user_id === req.user.id) {
      return res.status(400).json({
        message: "You cannot order your own service",
      });
    }

    let deliveryDeadline = null;

    if (service.delivery_time) {
      deliveryDeadline = new Date();
      deliveryDeadline.setDate(deliveryDeadline.getDate() + service.delivery_time);
    }

    const order = await prisma.serviceOrder.create({
      data: {
        service_id: service.id,
        buyer_id: req.user.id,
        seller_id: service.user_id,
        price: service.price,
        status: "pending",
        delivery_deadline: deliveryDeadline,
      },
      select: {
        id: true,
        price: true,
        status: true,
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
            name: true,
            email: true,
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
    });

    res.status(201).json({
      message: "Service order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create service order error:", error);
    res.status(500).json({
      message: "Server error while creating service order",
    });
  }
};

// GET /api/service-orders/my-orders
const getMyServiceOrders = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const { status, role } = req.query;

    const where = {};

    if (role === "seller") {
      where.seller_id = req.user.id;
    } else if (role === "buyer") {
      where.buyer_id = req.user.id;
    } else {
      where.OR = [
        { buyer_id: req.user.id },
        { seller_id: req.user.id },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
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
              name: true,
              email: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
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

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    console.error("Get my service orders error:", error);
    res.status(500).json({
      message: "Server error while fetching service orders",
    });
  }
};

// GET /api/service-orders/:id
const getServiceOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.serviceOrder.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        price: true,
        status: true,
        delivery_deadline: true,
        created_at: true,
        updated_at: true,
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
            short_description: true,
            description: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: {
            created_at: "asc",
          },
          select: {
            id: true,
            message: true,
            is_read: true,
            created_at: true,
            sender: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
        files: {
          orderBy: {
            uploaded_at: "desc",
          },
          select: {
            id: true,
            file_url: true,
            file_name: true,
            file_size: true,
            uploaded_at: true,
            uploader: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Service order not found",
      });
    }

    const isBuyer = order.buyer.id === req.user.id;
    const isSeller = order.seller.id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to view this order",
      });
    }

    res.json({
      order,
    });
  } catch (error) {
    console.error("Get service order error:", error);
    res.status(500).json({
      message: "Server error while fetching service order",
    });
  }
};

// PATCH /api/service-orders/:id/status
const updateServiceOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "in_progress",
      "delivered",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await prisma.serviceOrder.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Service order not found",
      });
    }

    const isBuyer = order.buyer_id === req.user.id;
    const isSeller = order.seller_id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to update this order",
      });
    }

    // Basic permission rules
    if (status === "in_progress" && !isSeller && !isAdmin) {
      return res.status(403).json({
        message: "Only seller or admin can start the order",
      });
    }

    if (status === "delivered" && !isSeller && !isAdmin) {
      return res.status(403).json({
        message: "Only seller or admin can deliver the order",
      });
    }

    if (status === "completed" && !isBuyer && !isAdmin) {
      return res.status(403).json({
        message: "Only buyer or admin can complete the order",
      });
    }

    const updatedOrder = await prisma.serviceOrder.update({
      where: {
        id: Number(id),
      },
      data: {
        status,
      },
      select: {
        id: true,
        price: true,
        status: true,
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
            name: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      message: "Service order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update service order status error:", error);
    res.status(500).json({
      message: "Server error while updating order status",
    });
  }
};

module.exports = {
  createServiceOrder,
  getMyServiceOrders,
  getServiceOrderById,
  updateServiceOrderStatus,
};