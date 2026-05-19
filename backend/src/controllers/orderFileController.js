const fs = require("fs");
const path = require("path");
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

// POST /api/service-orders/:orderId/files
const uploadOrderFileHandler = async (req, res) => {
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
        message: "You are not allowed to upload files for this order",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const relativePath = `uploads/order-files/${req.file.filename}`;

    const orderFile = await prisma.orderFile.create({
      data: {
        order_id: Number(orderId),
        uploaded_by: req.user.id,
        file_url: relativePath,
        file_name: req.file.originalname,
        file_size: req.file.size,
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
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file: orderFile,
    });
  } catch (error) {
    console.error("Upload order file error:", error);

    res.status(500).json({
      message: error.message || "Server error while uploading file",
    });
  }
};

// GET /api/service-orders/:orderId/files
const getOrderFiles = async (req, res) => {
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
        message: "You are not allowed to view files for this order",
      });
    }

    const files = await prisma.orderFile.findMany({
      where: {
        order_id: Number(orderId),
      },
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
    });

    res.json({
      count: files.length,
      files,
    });
  } catch (error) {
    console.error("Get order files error:", error);

    res.status(500).json({
      message: "Server error while fetching order files",
    });
  }
};

// GET /api/service-orders/:orderId/files/:fileId/download
const downloadOrderFile = async (req, res) => {
  try {
    const { orderId, fileId } = req.params;

    const access = await canAccessOrder(orderId, req.user);

    if (!access.allowed) {
      if (access.reason === "not_found") {
        return res.status(404).json({
          message: "Service order not found",
        });
      }

      return res.status(403).json({
        message: "You are not allowed to download files for this order",
      });
    }

    const file = await prisma.orderFile.findUnique({
      where: {
        id: Number(fileId),
      },
      select: {
        id: true,
        order_id: true,
        file_url: true,
        file_name: true,
      },
    });

    if (!file || file.order_id !== Number(orderId)) {
      return res.status(404).json({
        message: "File not found",
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
    console.error("Download order file error:", error);

    res.status(500).json({
      message: "Server error while downloading file",
    });
  }
};

module.exports = {
  uploadOrderFileHandler,
  getOrderFiles,
  downloadOrderFile,
};