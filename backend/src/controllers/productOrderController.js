const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");

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

// POST /api/product-orders
const createProductOrder = async (req, res) => {
  try {
    const { product_id, payment_method } = req.body;

    if (!product_id) {
      return res.status(400).json({
        message: "product_id is required",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: Number(product_id),
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

    const order = await prisma.productOrder.create({
      data: {
        product_id: product.id,
        buyer_id: req.user.id,
        seller_id: product.user_id,
        price: product.price,
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
    const { payment_status } = req.body || {};
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
        id: Number(id),
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Product order not found",
      });
    }

    const isSeller = order.seller_id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isSeller && !isAdmin) {
      return res.status(403).json({
        message: "Only seller or admin can update payment status",
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
        id: Number(id),
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

module.exports = {
  createProductOrder,
  getMyProductOrders,
  getProductOrderById,
  updateProductOrderPaymentStatus,
  getPurchasedProductFiles,
  downloadPurchasedProductFile,
};