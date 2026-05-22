const prisma = require("../config/prisma");
const notificationService = require("../services/notificationService");
const path = require("path");
const fs = require("fs");

const conversationAttachmentsDir = path.join(
  __dirname,
  "../../uploads/conversation-attachments"
);

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
        attachment_url: true,
        attachment_name: true,
        attachment_type: true,
        attachment_size: true,
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
    const trimmedMessage = typeof message === "string" ? message.trim() : "";
    const file = req.file || null;

    if ((!trimmedMessage || trimmedMessage.length === 0) && !file) {
      return res.status(400).json({
        message: "Message or attachment is required",
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
        message: trimmedMessage || "",
        ...(file
          ? {
              attachment_url: `uploads/conversation-attachments/${file.filename}`,
              attachment_name: file.originalname,
              attachment_type: file.mimetype,
              attachment_size: file.size,
            }
          : {}),
      },
      select: {
        id: true,
        message: true,
        attachment_url: true,
        attachment_name: true,
        attachment_type: true,
        attachment_size: true,
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
    });

    // Notify other participant(s)
    const order = await prisma.serviceOrder.findUnique({
      where: { id: Number(orderId) },
      select: { buyer_id: true, seller_id: true },
    });

    if (order) {
      const senderId = req.user.id;
      const recipientIds = [];

      if (senderId !== order.buyer_id) recipientIds.push(order.buyer_id);
      if (senderId !== order.seller_id) recipientIds.push(order.seller_id);

      const senderName = req.user.name || "Someone";
      const hasText = Boolean(trimmedMessage && trimmedMessage.length > 0);
      const notificationMessage = hasText
        ? `${senderName} sent a message about order #${orderId}.`
        : `${senderName} sent an attachment.`;

      await notificationService.createManyNotifications(
        recipientIds.map((recipientId) => ({
          userId: recipientId,
          type: "service_message_received",
          title: "New message",
          message: notificationMessage,
          link: `/service-orders/${orderId}`,
          metadata: { order_id: Number(orderId), message_id: newMessage.id },
        }))
      );
    }

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

// GET /api/service-orders/:orderId/messages/:messageId/attachment
const downloadOrderMessageAttachment = async (req, res) => {
  try {
    const { orderId, messageId } = req.params;

    const access = await canAccessOrder(orderId, req.user);
    if (!access.allowed) {
      if (access.reason === "not_found") {
        return res.status(404).json({ message: "Service order not found" });
      }
      return res.status(403).json({ message: "You are not allowed to access this attachment" });
    }

    const msg = await prisma.orderMessage.findFirst({
      where: { id: Number(messageId), order_id: Number(orderId) },
      select: {
        id: true,
        attachment_url: true,
        attachment_name: true,
        attachment_type: true,
      },
    });

    if (!msg || !msg.attachment_url) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    const filename = path.basename(msg.attachment_url);
    const fullPath = path.join(conversationAttachmentsDir, filename);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    res.download(fullPath, msg.attachment_name || "attachment");
  } catch (error) {
    console.error("Download order message attachment error:", error);
    res.status(500).json({ message: "Server error while downloading attachment" });
  }
};

module.exports = {
  getOrderMessages,
  createOrderMessage,
  downloadOrderMessageAttachment,
};
