const prisma = require("../config/prisma");
const stripe = require("../config/stripe");
const notificationService = require("../services/notificationService");

// POST /api/service-orders
// NOTE: This endpoint is now restricted for paid services.
// Paid services MUST use POST /api/service-orders/create-checkout-session
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

    // PROTECT: Paid services must use Stripe checkout
    const servicePrice = Number(service.price);
    if (servicePrice > 0 && req.user.role !== "admin") {
      return res.status(400).json({
        message: "Paid services must be ordered through checkout. Please use create-checkout-session endpoint.",
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
        payment_status: "paid", // Free services are auto-paid
        delivery_deadline: deliveryDeadline,
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
            name: true,
            email: true,
            avatar_url: true,
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
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
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

    const sanitizedOrders = orders.map((order) => {
      const cover = order?.service?.images?.[0]?.image_url || null;
      const { images, ...service } = order.service || {};
      return {
        ...order,
        service: order.service ? { ...service, thumbnail_url: cover } : null,
      };
    });

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      orders: sanitizedOrders,
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
        payment_status: true,
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
            avatar_url: true,
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
                avatar_url: true,
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
            avatar_url: true,
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
    });

    // Notify the other party about status change
    const recipientId = req.user.id === updatedOrder.buyer?.id
      ? updatedOrder.seller?.id
      : updatedOrder.buyer?.id;

    if (recipientId) {
      await notificationService.createNotification({
        userId: recipientId,
        type: "service_status_updated",
        title: "Service order updated",
        message: `Service order #${id} status is now ${status}.`,
        link: `/service-orders/${id}`,
        metadata: { order_id: Number(id), status },
      });
    }

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

// POST /api/service-orders/create-checkout-session
const createServiceCheckoutSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        message: "Stripe is not configured. Please add a valid STRIPE_SECRET_KEY.",
      });
    }

    const { service_id, requirements } = req.body;
    const buyerId = req.user.id;

    if (!service_id) {
      return res.status(400).json({ message: "service_id is required" });
    }

    // Fetch service
    const service = await prisma.service.findUnique({
      where: { id: parseInt(service_id) },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.status !== "active") {
      return res.status(400).json({ message: "This service is not currently available" });
    }

    // Prevent self-order
    if (service.user_id === buyerId) {
      return res.status(400).json({ message: "You cannot order your own service" });
    }

    // Validate price
    const price = Number(service.price);
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ message: "Free services do not require checkout." });
    }

    // Calculate delivery deadline
    const deliveryDeadline = service.delivery_time
      ? new Date(Date.now() + service.delivery_time * 24 * 60 * 60 * 1000)
      : null;

    // Create service order with pending payment
    const order = await prisma.serviceOrder.create({
      data: {
        service_id: service.id,
        buyer_id: buyerId,
        seller_id: service.user_id,
        price: price,
        status: "pending",
        payment_status: "pending",
        payment_method: "stripe",
        delivery_deadline: deliveryDeadline,
      },
      include: {
        service: { select: { id: true, title: true } },
        buyer: { select: { id: true, name: true, email: true, avatar_url: true } },
        seller: { select: { id: true, name: true, email: true, avatar_url: true } },
      },
    });

    // Notify seller of new service order
    await notificationService.createNotification({
      userId: service.user_id,
      type: "service_order_created",
      title: "New service order",
      message: `${req.user.name || "A buyer"} ordered ${service.title}.`,
      link: "/seller/service-orders",
      metadata: { order_id: order.id, service_id: service.id },
    });

    const currency = process.env.STRIPE_CURRENCY || "usd";
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      return res.status(503).json({ message: "Server configuration error: FRONTEND_URL is not set" });
    }

    const unitAmount = Math.round(price * 100);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: service.title || "Service Order",
              description: `Service order #${order.id}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/payment-success?type=service&order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment-cancel?type=service&order_id=${order.id}`,
      metadata: {
        type: "service_order",
        service_order_id: String(order.id),
        service_id: String(service.id),
        buyer_id: String(buyerId),
        seller_id: String(service.user_id),
      },
      client_reference_id: String(order.id),
    });

    // Store stripe session id
    await prisma.serviceOrder.update({
      where: { id: order.id },
      data: { stripe_session_id: session.id },
    });

    res.status(201).json({
      message: "Stripe checkout session created successfully",
      order_id: order.id,
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    console.error("Create service checkout session error:", error.message);
    res.status(500).json({
      message: "Server error while creating checkout session",
      error: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
};

module.exports = {
  createServiceOrder,
  getMyServiceOrders,
  getServiceOrderById,
  updateServiceOrderStatus,
  createServiceCheckoutSession,
};
