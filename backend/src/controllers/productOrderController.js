const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");
const stripe = require("../config/stripe");
const notificationService = require("../services/notificationService");
const { getApplicationFeeAmount } = require("../utils/stripeCommission");

// Helper: check access to product order
const canAccessProductOrder = async (orderId, user) => {
  const order = await prisma.productOrder.findUnique({
    where: {
      id: Number(orderId),
    },
    select: {
      id: true,
      product_id: true,
      buyer_id: true,
      seller_id: true,
      payment_status: true,
      order_status: true,
    },
  });

  if (!order) {
    return {
      allowed: false,
      reason: "not_found",
      order: null,
    };
  }

  const isBuyer = order.buyer_id === user.id;
  const isSeller = order.seller_id === user.id;
  const isAdmin = user.role === "admin";

  if (!isBuyer && !isSeller && !isAdmin) {
    return {
      allowed: false,
      reason: "forbidden",
      order,
    };
  }

  return {
    allowed: true,
    reason: null,
    order,
  };
};
// POST /api/product-orders/create-checkout-session
const createStripeCheckoutSession = async (req, res) => {
  try {
    if (!stripe) {
      console.error("Stripe not configured - STRIPE_SECRET_KEY is missing or invalid");
      return res.status(503).json({
        message:
          "Stripe is not configured yet. Please add a valid STRIPE_SECRET_KEY (must start with sk_).",
      });
    }

    const { product_id } = req.body || {};
    const productId = Number(product_id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "A valid product_id is required",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        user_id: true,
        title: true,
        short_description: true,
        price: true,
        status: true,
        files: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!product || product.status !== "active") {
      return res.status(404).json({
        message: "Product not found or not active",
      });
    }

    if (product.user_id === req.user.id) {
      return res.status(400).json({
        message: "You cannot buy your own product",
      });
    }

    if (!product.files || product.files.length === 0) {
      return res.status(400).json({
        message: "This product has no downloadable files yet",
      });
    }

    const price = Number(product.price);
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        message: "Product price must be greater than 0. Free products do not require checkout.",
      });
    }

    // Check if seller is a non-admin user who needs Stripe Connect
    const seller = await prisma.user.findUnique({
      where: { id: product.user_id },
      select: {
        id: true,
        role: true,
        stripe_account_id: true,
        stripe_charges_enabled: true,
        stripe_details_submitted: true,
      },
    });

    let connectedAccountId = null;

    if (seller && seller.role !== "admin") {
      if (!seller.stripe_account_id || !seller.stripe_charges_enabled || !seller.stripe_details_submitted) {
        return res.status(400).json({
          message: "This seller cannot receive payments yet. Please contact the seller.",
        });
      }
      connectedAccountId = seller.stripe_account_id;
    }

    // Create pending product order first
    const order = await prisma.productOrder.create({
      data: {
        product_id: product.id,
        buyer_id: req.user.id,
        seller_id: product.user_id,
        price,
        payment_method: "stripe",
        payment_status: "pending",
        order_status: "new",
      },
      select: {
        id: true,
        price: true,
        product_id: true,
      },
    });

    // Notify seller of new product order
    await notificationService.createNotification({
      userId: product.user_id,
      type: "product_order_created",
      title: "New product order",
      message: `${req.user.name || "A buyer"} ordered ${product.title}.`,
      link: "/seller/product-orders",
      metadata: { order_id: order.id, product_id: product.id },
    });

    const currency = process.env.STRIPE_CURRENCY || "usd";
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      console.error("FRONTEND_URL env variable is missing");
      return res.status(503).json({
        message: "Server configuration error: FRONTEND_URL is not set",
      });
    }

    const unitAmount = Math.round(price * 100);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return res.status(400).json({
        message: "Invalid product price",
      });
    }

    if (unitAmount < 50) {
      console.warn(`Warning: Product ${product.id} price is ${product.price} (${unitAmount} cents). Stripe requires minimum 50 cents in test mode.`);
    }

    console.log(`Creating Stripe checkout session for product ${product.id} (${product.title}), order ${order.id}, amount ${unitAmount} ${currency}`);

    const sessionPayload = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: product.title,
              description:
                product.short_description || "Digital product from Lernnova",
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "product_order",
        product_order_id: String(order.id),
        product_id: String(product.id),
        buyer_id: String(req.user.id),
        seller_id: String(product.user_id),
      },
      client_reference_id: String(order.id),
      success_url: `${frontendUrl}/payment-success?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment-cancel?order_id=${order.id}`,
    };

    if (connectedAccountId) {
      const applicationFeeAmount = getApplicationFeeAmount(unitAmount);
      sessionPayload.payment_intent_data = {
        transfer_data: {
          destination: connectedAccountId,
        },
      };
      if (applicationFeeAmount) {
        sessionPayload.payment_intent_data.application_fee_amount =
          applicationFeeAmount;
      }
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);

    const updateData = { stripe_session_id: session.id };
    if (connectedAccountId) {
      updateData.connected_account_id = connectedAccountId;
    }

    await prisma.productOrder.update({
      where: { id: order.id },
      data: updateData,
    });

    console.log(`Stripe checkout session created successfully: ${session.id}`);

    res.status(201).json({
      message: "Stripe checkout session created successfully",
      order_id: order.id,
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    const isPermissionError =
      error.code === "PermissionError" ||
      error.message?.includes("permission") ||
      error.message?.includes("Permission");

    console.error("Create Stripe checkout session error:", {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      stripeError: error.raw ? error.raw.message : undefined,
      isPermissionError,
    });

    // Provide helpful error message based on error type
    let errorMessage = error.message;
    if (isPermissionError) {
      errorMessage =
        process.env.NODE_ENV === "production"
          ? "Checkout session creation is not available. Please contact support."
          : "Stripe restricted key lacks permission to create checkout sessions. Ensure the key has Checkout Sessions permission or provide a secret key (sk" + "_test_).";
    } else if (!process.env.NODE_ENV || process.env.NODE_ENV === "production") {
      errorMessage = "Could not create checkout session. Please try again or contact support.";
    }

    res.status(500).json({
      message: "Server error while creating Stripe checkout session",
      error: errorMessage,
    });
  }
};

// POST /api/product-orders
const createProductOrder = async (req, res) => {
  try {
    const { product_id, payment_method } = req.body;
    const productId = Number(product_id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "A valid product_id is required",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        user_id: true,
        title: true,
        price: true,
        status: true,
        files: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!product || product.status !== "active") {
      return res.status(404).json({
        message: "Product not found or not active",
      });
    }

    if (product.user_id === req.user.id) {
      return res.status(400).json({
        message: "You cannot buy your own product",
      });
    }

    if (!product.files || product.files.length === 0) {
      return res.status(400).json({
        message: "This product has no downloadable files yet",
      });
    }

    const price = Number(product.price);
    if (!Number.isFinite(price)) {
      return res.status(400).json({
        message: "Invalid product price",
      });
    }

    const order = await prisma.productOrder.create({
      data: {
        product_id: product.id,
        buyer_id: req.user.id,
        seller_id: product.user_id,
        price,
        payment_method: payment_method || "manual",
        payment_status: "pending",
        order_status: "new",
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
      message: "Product order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create product order error:", error);
    res.status(500).json({
      message: "Server error while creating product order",
    });
  }
};

// GET /api/product-orders/my-orders
const getMyProductOrders = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const { role, payment_status, order_status } = req.query;

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

    if (payment_status) {
      where.payment_status = payment_status;
    }

    if (order_status) {
      where.order_status = order_status;
    }

    const [orders, total] = await Promise.all([
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
      }),

      prisma.productOrder.count({ where }),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    console.error("Get my product orders error:", error);
    res.status(500).json({
      message: "Server error while fetching product orders",
    });
  }
};

// GET /api/product-orders/:id
const getProductOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.productOrder.findUnique({
      where: {
        id: Number(id),
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
            short_description: true,
            description: true,
            thumbnail_url: true,
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

    if (!order) {
      return res.status(404).json({
        message: "Product order not found",
      });
    }

    const isBuyer = order.buyer.id === req.user.id;
    const isSeller = order.seller.id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to view this product order",
      });
    }

    res.json({
      order,
    });
  } catch (error) {
    console.error("Get product order error:", error);
    res.status(500).json({
      message: "Server error while fetching product order",
    });
  }
};

// PATCH /api/product-orders/:id/payment-status
const updateProductOrderPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = Number(id);
    const { payment_status } = req.body || {};
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid product order ID",
      });
    }
    if (!payment_status) {
      return res.status(400).json({
        message: "payment_status is required",
      });
    }

    const allowedStatuses = ["pending", "paid", "failed", "refunded"];

    if (!allowedStatuses.includes(payment_status)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    const order = await prisma.productOrder.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Product order not found",
      });
    }

    const isAdmin = req.user.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        message: "Only admin can manually update payment status",
      });
    }

    let orderStatus = order.order_status;

    if (payment_status === "paid") {
      orderStatus = "completed";
    }

    if (payment_status === "failed" || payment_status === "refunded") {
      orderStatus = "cancelled";
    }

    if (payment_status === "pending") {
      orderStatus = "new";
    }

    const updatedOrder = await prisma.productOrder.update({
      where: {
        id: orderId,
      },
      data: {
        payment_status,
        order_status: orderStatus,
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
      message: "Product order payment status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update product payment status error:", error);
    res.status(500).json({
      message: "Server error while updating payment status",
    });
  }
};

// GET /api/product-orders/:id/files
const getPurchasedProductFiles = async (req, res) => {
  try {
    const { id } = req.params;

    const access = await canAccessProductOrder(id, req.user);

    if (!access.allowed) {
      if (access.reason === "not_found") {
        return res.status(404).json({
          message: "Product order not found",
        });
      }

      return res.status(403).json({
        message: "You are not allowed to view files for this order",
      });
    }

    const order = access.order;

    const isBuyer = order.buyer_id === req.user.id;
    const isSeller = order.seller_id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (isBuyer) {
      if (order.payment_status !== "paid" || order.order_status !== "completed") {
        return res.status(403).json({
          message: "Files are available only after payment confirmation",
        });
      }
    }

    const files = await prisma.productFile.findMany({
      where: {
        product_id: order.product_id,
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        file_name: true,
        file_size: true,
        created_at: true,
      },
    });

    res.json({
      count: files.length,
      files,
      can_download: isBuyer
        ? order.payment_status === "paid" && order.order_status === "completed"
        : isSeller || isAdmin,
    });
  } catch (error) {
    console.error("Get purchased product files error:", error);
    res.status(500).json({
      message: "Server error while fetching purchased product files",
    });
  }
};

// GET /api/product-orders/:id/files/:fileId/download
const downloadPurchasedProductFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;

    const access = await canAccessProductOrder(id, req.user);

    if (!access.allowed) {
      if (access.reason === "not_found") {
        return res.status(404).json({
          message: "Product order not found",
        });
      }

      return res.status(403).json({
        message: "You are not allowed to download files for this order",
      });
    }

    const order = access.order;

    const isBuyer = order.buyer_id === req.user.id;
    const isSeller = order.seller_id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (isBuyer) {
      if (order.payment_status !== "paid" || order.order_status !== "completed") {
        return res.status(403).json({
          message: "Download is available only after payment confirmation",
        });
      }
    }

    const file = await prisma.productFile.findUnique({
      where: {
        id: Number(fileId),
      },
      select: {
        id: true,
        product_id: true,
        file_url: true,
        file_name: true,
      },
    });

    if (!file || file.product_id !== order.product_id) {
      return res.status(404).json({
        message: "Product file not found",
      });
    }

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to download this file",
      });
    }

    const filePath = path.join(__dirname, "../../", file.file_url);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "File does not exist on server",
      });
    }

    res.download(filePath, file.file_name);
  } catch (error) {
    console.error("Download purchased product file error:", error);
    res.status(500).json({
      message: "Server error while downloading product file",
    });
  }
};

// PATCH /api/product-orders/:id/order-status
const updateProductOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = Number(id);
    const { order_status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid product order ID",
      });
    }

    // Validate order_status
    const allowedStatuses = ["new", "completed", "cancelled"];
    if (!order_status || !allowedStatuses.includes(order_status)) {
      return res.status(400).json({
        message: `Invalid order_status. Must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    // Find order
    const order = await prisma.productOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Product order not found" });
    }

    // Authorization: seller of this order or admin
    if (userRole !== "admin" && order.seller_id !== userId) {
      return res.status(403).json({
        message: "You are not authorized to update this order",
      });
    }

    if (
      order_status === "completed" &&
      order.payment_status !== "paid" &&
      userRole !== "admin"
    ) {
      return res.status(400).json({
        message: "Only paid orders can be marked as completed.",
      });
    }

    if (
      order_status === "cancelled" &&
      order.payment_status === "paid" &&
      userRole !== "admin"
    ) {
      return res.status(400).json({
        message: "Paid orders cannot be cancelled manually.",
      });
    }

    // Update order_status only (NOT payment_status)
    const updatedOrder = await prisma.productOrder.update({
      where: { id: orderId },
      data: { order_status },
      include: {
        product: { select: { id: true, title: true } },
        buyer: { select: { id: true, name: true, email: true, avatar_url: true } },
        seller: { select: { id: true, name: true, email: true, avatar_url: true } },
      },
    });

    return res.status(200).json({
      message: "Product order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating product order status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createProductOrder,
  getMyProductOrders,
  getProductOrderById,
  updateProductOrderPaymentStatus,
  updateProductOrderStatus,
  getPurchasedProductFiles,
  downloadPurchasedProductFile,
  createStripeCheckoutSession,
};
