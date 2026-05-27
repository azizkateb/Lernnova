const express = require("express");
const router = express.Router();

const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  uploadServiceThumbnailHandler,
} = require("../controllers/serviceController");

const { protect, allowRoles } = require("../middleware/authMiddleware");
const { uploadServiceThumbnail } = require("../middleware/uploadMiddleware");
const { uploadActionLimiter } = require("../middleware/rateLimiters");

// Public routes
router.get("/", getServices);

// Seller/Admin routes (must come before /:id dynamic routes)
router.post("/", protect, allowRoles("seller", "admin"), uploadActionLimiter, createService);

// Thumbnail upload route (must come before /:id routes to avoid conflicts)
router.post(
  "/:serviceId/thumbnail",
  protect,
  allowRoles("seller", "admin"),
  uploadActionLimiter,
  uploadServiceThumbnail,
  uploadServiceThumbnailHandler
);

// Dynamic /:id routes (must come last)
router.get("/:id", getServiceById);
router.put("/:id", protect, allowRoles("seller", "admin"), uploadActionLimiter, updateService);
router.delete("/:id", protect, allowRoles("seller", "admin"), deleteService);

module.exports = router;
