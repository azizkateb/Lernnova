const prisma = require("../config/prisma");
const notificationService = require("../services/notificationService");
const path = require("path");
const fs = require("fs");

const conversationAttachmentsDir = path.join(
  __dirname,
  "../../uploads/conversation-attachments"
);

const canAccessInquiry = async (inquiryId, user) => {
  const inquiry = await prisma.serviceInquiry.findUnique({
    where: { id: Number(inquiryId) },
    select: { id: true, buyer_id: true, seller_id: true },
  });

  if (!inquiry) {
    return { allowed: false, reason: "not_found", inquiry: null };
  }

  const isBuyer = inquiry.buyer_id === user.id;
  const isSeller = inquiry.seller_id === user.id;
  const isAdmin = user.role === "admin";

  if (!isBuyer && !isSeller && !isAdmin) {
    return { allowed: false, reason: "forbidden", inquiry };
  }

  return { allowed: true, reason: null, inquiry };
};

const normalizeInquiry = (inquiry) => {
  if (!inquiry) return inquiry;
  const messages = Array.isArray(inquiry.messages) ? inquiry.messages : [];
  return {
    ...inquiry,
    messages,
  };
};

const createServiceInquiry = async (req, res) => {
  try {
    const { service_id, message } = req.body || {};

    if (!service_id) {
      return res.status(400).json({ message: "service_id is required" });
    }

    const service = await prisma.service.findUnique({
      where: { id: Number(service_id) },
      select: {
        id: true,
        user_id: true,
        title: true,
        status: true,
      },
    });

    if (!service || service.status !== "active") {
      return res.status(404).json({ message: "Service not found or not active" });
    }

    if (service.user_id === req.user.id) {
      return res.status(400).json({ message: "You cannot contact yourself" });
    }

    const buyerId = req.user.id;
    const sellerId = service.user_id;

    let inquiry = await prisma.serviceInquiry.findFirst({
      where: {
        service_id: service.id,
        buyer_id: buyerId,
        seller_id: sellerId,
        status: "open",
      },
      select: { id: true },
    });

    if (!inquiry) {
      inquiry = await prisma.serviceInquiry.create({
        data: {
          service_id: service.id,
          buyer_id: buyerId,
          seller_id: sellerId,
          status: "open",
        },
        select: { id: true },
      });
    }

    if (typeof message === "string" && message.trim().length > 0) {
      await prisma.serviceInquiryMessage.create({
        data: {
          inquiry_id: inquiry.id,
          sender_id: buyerId,
          message: message.trim(),
        },
      });
    }

    const fullInquiry = await prisma.serviceInquiry.findUnique({
      where: { id: inquiry.id },
      select: {
        id: true,
        status: true,
        created_at: true,
        updated_at: true,
        service: { select: { id: true, title: true } },
        buyer: { select: { id: true, name: true, role: true, avatar_url: true } },
        seller: { select: { id: true, name: true, role: true, avatar_url: true } },
        messages: {
          orderBy: { created_at: "asc" },
          select: {
            id: true,
            message: true,
            attachment_url: true,
            attachment_name: true,
            attachment_type: true,
            attachment_size: true,
            created_at: true,
            sender: { select: { id: true, name: true, role: true, avatar_url: true } },
          },
        },
      },
    });

    const buyerName = req.user.name || "Someone";
    await notificationService.createNotification({
      userId: sellerId,
      type: "service_inquiry_created",
      title: "New service inquiry",
      message: `${buyerName} asked about ${service.title}.`,
      link: `/service-inquiries/${inquiry.id}`,
      metadata: { inquiry_id: inquiry.id, service_id: service.id },
    });

    res.status(201).json({
      message: "Service inquiry opened successfully",
      inquiry: normalizeInquiry(fullInquiry),
    });
  } catch (error) {
    console.error("Create service inquiry error:", error);
    res.status(500).json({ message: "Server error while creating service inquiry" });
  }
};

const getServiceInquiries = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;
    const { role, status } = req.query;

    const where = {};
    if (status) where.status = status;

    if (role === "buyer") {
      where.buyer_id = req.user.id;
    } else if (role === "seller") {
      where.seller_id = req.user.id;
    } else if (req.user.role !== "admin") {
      where.OR = [{ buyer_id: req.user.id }, { seller_id: req.user.id }];
    }

    const [inquiries, total] = await Promise.all([
      prisma.serviceInquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updated_at: "desc" },
        select: {
          id: true,
          status: true,
          created_at: true,
          updated_at: true,
          service: { select: { id: true, title: true } },
          buyer: { select: { id: true, name: true, role: true, avatar_url: true } },
          seller: { select: { id: true, name: true, role: true, avatar_url: true } },
          messages: {
            take: 1,
            orderBy: { created_at: "desc" },
            select: {
              id: true,
              message: true,
              attachment_url: true,
              attachment_name: true,
              attachment_type: true,
              attachment_size: true,
              created_at: true,
              sender: { select: { id: true, name: true, role: true, avatar_url: true } },
            },
          },
        },
      }),
      prisma.serviceInquiry.count({ where }),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      inquiries: inquiries.map(normalizeInquiry),
    });
  } catch (error) {
    console.error("Get service inquiries error:", error);
    res.status(500).json({ message: "Server error while fetching service inquiries" });
  }
};

const getServiceInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const access = await canAccessInquiry(id, req.user);

    if (!access.allowed) {
      if (access.reason === "not_found") {
        return res.status(404).json({ message: "Service inquiry not found" });
      }
      return res.status(403).json({ message: "You do not have permission to view this inquiry" });
    }

    const inquiry = await prisma.serviceInquiry.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        status: true,
        created_at: true,
        updated_at: true,
        service: { select: { id: true, title: true } },
        buyer: { select: { id: true, name: true, role: true, avatar_url: true } },
        seller: { select: { id: true, name: true, role: true, avatar_url: true } },
        messages: {
          orderBy: { created_at: "asc" },
          select: {
            id: true,
            message: true,
            attachment_url: true,
            attachment_name: true,
            attachment_type: true,
            attachment_size: true,
            created_at: true,
            sender: { select: { id: true, name: true, role: true, avatar_url: true } },
          },
        },
      },
    });

    res.json({ inquiry: normalizeInquiry(inquiry) });
  } catch (error) {
    console.error("Get service inquiry by id error:", error);
    res.status(500).json({ message: "Server error while fetching service inquiry" });
  }
};

const sendServiceInquiryMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body || {};
    const trimmedMessage = typeof message === "string" ? message.trim() : "";
    const file = req.file || null;

    if ((!trimmedMessage || trimmedMessage.length === 0) && !file) {
      return res.status(400).json({ message: "Message or attachment is required" });
    }

    const access = await canAccessInquiry(id, req.user);
    if (!access.allowed) {
      if (access.reason === "not_found") {
        return res.status(404).json({ message: "Service inquiry not found" });
      }
      return res.status(403).json({ message: "You are not allowed to send messages for this inquiry" });
    }

    const newMessage = await prisma.serviceInquiryMessage.create({
      data: {
        inquiry_id: Number(id),
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
        created_at: true,
        sender: { select: { id: true, name: true, role: true, avatar_url: true } },
      },
    });

    const inquiry = await prisma.serviceInquiry.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        buyer_id: true,
        seller_id: true,
        service: { select: { id: true, title: true } },
      },
    });

    if (inquiry) {
      const senderId = req.user.id;
      const recipientIds = [];
      if (senderId !== inquiry.buyer_id) recipientIds.push(inquiry.buyer_id);
      if (senderId !== inquiry.seller_id) recipientIds.push(inquiry.seller_id);

      const senderName = req.user.name || "Someone";
      const serviceTitle = inquiry.service?.title || "a service";
      const hasText = Boolean(trimmedMessage && trimmedMessage.length > 0);
      const notificationMessage = hasText
        ? `${senderName} sent a message about ${serviceTitle}.`
        : `${senderName} sent an attachment.`;

      await notificationService.createManyNotifications(
        recipientIds.map((recipientId) => ({
          userId: recipientId,
          type: "service_inquiry_message",
          title: "New inquiry message",
          message: notificationMessage,
          link: `/service-inquiries/${inquiry.id}`,
          metadata: { inquiry_id: inquiry.id, service_id: inquiry.service?.id, message_id: newMessage.id },
        }))
      );
    }

    await prisma.serviceInquiry.update({
      where: { id: Number(id) },
      data: { updated_at: new Date() },
      select: { id: true },
    });

    res.status(201).json({
      message: "Message sent successfully",
      inquiry_message: newMessage,
    });
  } catch (error) {
    console.error("Send service inquiry message error:", error);
    res.status(500).json({ message: "Server error while sending inquiry message" });
  }
};

// GET /api/service-inquiries/:inquiryId/messages/:messageId/attachment
const downloadServiceInquiryMessageAttachment = async (req, res) => {
  try {
    const { inquiryId, messageId } = req.params;

    const access = await canAccessInquiry(inquiryId, req.user);
    if (!access.allowed) {
      if (access.reason === "not_found") {
        return res.status(404).json({ message: "Service inquiry not found" });
      }
      return res.status(403).json({ message: "You are not allowed to access this attachment" });
    }

    const msg = await prisma.serviceInquiryMessage.findFirst({
      where: { id: Number(messageId), inquiry_id: Number(inquiryId) },
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
    console.error("Download inquiry message attachment error:", error);
    res.status(500).json({ message: "Server error while downloading attachment" });
  }
};

const closeServiceInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const access = await canAccessInquiry(id, req.user);
    if (!access.allowed) {
      if (access.reason === "not_found") {
        return res.status(404).json({ message: "Service inquiry not found" });
      }
      return res.status(403).json({ message: "Not authorized" });
    }

    const inquiry = await prisma.serviceInquiry.update({
      where: { id: Number(id) },
      data: { status: "closed" },
      select: {
        id: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({ message: "Inquiry closed", inquiry });
  } catch (error) {
    console.error("Close service inquiry error:", error);
    res.status(500).json({ message: "Server error while closing inquiry" });
  }
};

module.exports = {
  createServiceInquiry,
  getServiceInquiries,
  getServiceInquiryById,
  sendServiceInquiryMessage,
  downloadServiceInquiryMessageAttachment,
  closeServiceInquiry,
};
