const express = require("express");
const router = express.Router();

const {
  getProductCategories,
  getProductCategoryById,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
} = require("../controllers/productCategoryController");

const { protect, allowRoles } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getProductCategories);
router.get("/:id", getProductCategoryById);

// Admin routes
router.post("/", protect, allowRoles("admin"), createProductCategory);
router.put("/:id", protect, allowRoles("admin"), updateProductCategory);
router.delete("/:id", protect, allowRoles("admin"), deleteProductCategory);

module.exports = router;