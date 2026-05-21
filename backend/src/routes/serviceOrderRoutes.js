const express = require("express");
const router = express.Router();

const {
  createServiceOrder,
  getMyServiceOrders,
  getServiceOrderById,
  updateServiceOrderStatus,
  createServiceCheckoutSession,
} = require("../controllers/serviceOrderController");

const {
  getOrderMessages,
  createOrderMessage,
} = require("../controllers/orderMessageController");

const {
  uploadOrderFileHandler,
  getOrderFiles,
  downloadOrderFile,
} = require("../controllers/orderFileController");

const { protect } = require("../middleware/authMiddleware");
const { uploadOrderFile } = require("../middleware/uploadMiddleware");

router.post("/", protect, createServiceOrder);
router.post("/create-checkout-session", protect, createServiceCheckoutSession);
router.get("/my-orders", protect, getMyServiceOrders);

// Messages
router.get("/:orderId/messages", protect, getOrderMessages);
router.post("/:orderId/messages", protect, createOrderMessage);

// Files
router.get("/:orderId/files", protect, getOrderFiles);
router.post("/:orderId/files", protect, uploadOrderFile, uploadOrderFileHandler);
router.get("/:orderId/files/:fileId/download", protect, downloadOrderFile);

// Order details
router.get("/:id", protect, getServiceOrderById);
router.patch("/:id/status", protect, updateServiceOrderStatus);

module.exports = router;