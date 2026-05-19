const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  uploadProductFileHandler,
  getProductFiles,
  deleteProductFile,
} = require("../controllers/productFileController");

const { protect, allowRoles } = require("../middleware/authMiddleware");
const { uploadProductFile } = require("../middleware/uploadMiddleware");

// Public routes
router.get("/", getProducts);

// Product files routes
router.get("/:productId/files", protect, getProductFiles);
router.post(
  "/:productId/files",
  protect,
  allowRoles("seller", "admin"),
  uploadProductFile,
  uploadProductFileHandler
);
router.delete(
  "/:productId/files/:fileId",
  protect,
  allowRoles("seller", "admin"),
  deleteProductFile
);

// Public single product
router.get("/:id", getProductById);

// Seller/Admin routes
router.post("/", protect, allowRoles("seller", "admin"), createProduct);
router.put("/:id", protect, allowRoles("seller", "admin"), updateProduct);
router.delete("/:id", protect, allowRoles("seller", "admin"), deleteProduct);

module.exports = router;