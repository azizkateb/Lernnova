const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");

// Helper: check product owner/admin
const canManageProduct = async (productId, user) => {
  const product = await prisma.product.findUnique({
    where: {
      id: Number(productId),
    },
    select: {
      id: true,
      user_id: true,
      title: true,
    },
  });

  if (!product) {
    return {
      allowed: false,
      reason: "not_found",
      product: null,
    };
  }

  const isOwner = product.user_id === user.id;
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    return {
      allowed: false,
      reason: "forbidden",
      product,
    };
  }

  return {
    allowed: true,
    reason: null,
    product,
  };
};

// POST /api/products/:productId/files
const uploadProductFileHandler = async (req, res) => {
  try {
    const { productId } = req.params;

    const access = await canManageProduct(productId, req.user);

    if (!access.allowed) {
      if (access.reason === "not_found") {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      return res.status(403).json({
        message: "You are not allowed to upload files for this product",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const relativePath = `uploads/product-files/${req.file.filename}`;

    const productFile = await prisma.productFile.create({
      data: {
        product_id: Number(productId),
        file_url: relativePath,
        file_name: req.file.originalname,
        file_size: req.file.size,
      },
      select: {
        id: true,
        file_name: true,
        file_size: true,
        created_at: true,
        product: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Product file uploaded successfully",
      file: productFile,
    });
  } catch (error) {
    console.error("Upload product file error:", error);

    res.status(500).json({
      message: error.message || "Server error while uploading product file",
    });
  }
};

// GET /api/products/:productId/files
const getProductFiles = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: Number(productId),
      },
      select: {
        id: true,
        user_id: true,
        status: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const isOwner = product.user_id === req.user?.id;
    const isAdmin = req.user?.role === "admin";

    // في هذه المرحلة، نعرض معلومات الملفات فقط لصاحب المنتج أو الأدمن
    // لاحقاً المشتري سيحصل على التحميل من route منفصل بعد الدفع
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to view product files",
      });
    }

    const files = await prisma.productFile.findMany({
      where: {
        product_id: Number(productId),
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
    });
  } catch (error) {
    console.error("Get product files error:", error);

    res.status(500).json({
      message: "Server error while fetching product files",
    });
  }
};

// DELETE /api/products/:productId/files/:fileId
const deleteProductFile = async (req, res) => {
  try {
    const { productId, fileId } = req.params;

    const access = await canManageProduct(productId, req.user);

    if (!access.allowed) {
      if (access.reason === "not_found") {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      return res.status(403).json({
        message: "You are not allowed to delete files for this product",
      });
    }

    const file = await prisma.productFile.findUnique({
      where: {
        id: Number(fileId),
      },
    });

    if (!file || file.product_id !== Number(productId)) {
      return res.status(404).json({
        message: "Product file not found",
      });
    }

    const filePath = path.join(__dirname, "../../", file.file_url);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.productFile.delete({
      where: {
        id: Number(fileId),
      },
    });

    res.json({
      message: "Product file deleted successfully",
    });
  } catch (error) {
    console.error("Delete product file error:", error);

    res.status(500).json({
      message: "Server error while deleting product file",
    });
  }
};

module.exports = {
  uploadProductFileHandler,
  getProductFiles,
  deleteProductFile,
};