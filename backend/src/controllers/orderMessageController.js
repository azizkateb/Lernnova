const prisma = require("../config/prisma");

// Helper: check if user is part of order
const canAccessOrder = async (orderId, user) => {
  const order = await prisma.serviceOrder.findUnique({
    where: {
      id: Number(orderId),
    },
    select: {
      id: true,
      buyer_id: true,
      seller_id: true,
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

// GET /api/service-orders/:orderId/messages
const getOrderMessages = async (req, res) => {
  try {
    const { orderId } = req.params;

    const access = await canAccessOrder(orderId, req.user);

    if (!access.allowed) {
      if (access.reason === "not_found") {
        return res.status(404).json({
          message: "Service order not found",
        });
      }

      return res.status(403).json({
        message: "You are not allowed to view messages for this order",
      });
    }

    const messages = await prisma.orderMessage.findMany({
      where: {
        order_id: Number(orderId),
      },
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
    });

    res.json({
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get order messages error:", error);
    res.status(500).json({
      message: "Server error while fetching order messages",
    });
  }
};

// POST /api/service-orders/:orderId/messages
const createOrderMessage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const access = await canAccessOrder(orderId, req.user);

    if (!access.allowed) {
      if (access.reason === "not_found") {
        return res.status(404).json({
          message: "Service order not found",
        });
      }

      return res.status(403).json({
        message: "You are not allowed to send messages for this order",
      });
    }

    const newMessage = await prisma.orderMessage.create({
      data: {
        order_id: Number(orderId),
        sender_id: req.user.id,
        message: message.trim(),
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
    });

    res.status(201).json({
      message: "Message sent successfully",
      order_message: newMessage,
    });
  } catch (error) {
    console.error("Create order message error:", error);
    res.status(500).json({
      message: "Server error while sending message",
    });
  }
};

module.exports = {
  getOrderMessages,
  createOrderMessage,
};