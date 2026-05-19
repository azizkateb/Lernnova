const express = require("express");
const router = express.Router();

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const { protect, allowRoles } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin routes
router.post("/", protect, allowRoles("admin"), createCategory);
router.put("/:id", protect, allowRoles("admin"), updateCategory);
router.delete("/:id", protect, allowRoles("admin"), deleteCategory);

module.exports = router;