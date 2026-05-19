const express = require("express");
const router = express.Router();

const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const { protect, allowRoles } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getServices);
router.get("/:id", getServiceById);

// Seller/Admin routes
router.post("/", protect, allowRoles("seller", "admin"), createService);
router.put("/:id", protect, allowRoles("seller", "admin"), updateService);
router.delete("/:id", protect, allowRoles("seller", "admin"), deleteService);

module.exports = router;