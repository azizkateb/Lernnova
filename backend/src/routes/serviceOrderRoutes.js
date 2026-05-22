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
  downloadOrderMessageAttachment,
} = require("../controllers/orderMessageController");

const {
  uploadOrderFileHandler,
  getOrderFiles,
  downloadOrderFile,
} = require("../controllers/orderFileController");

const { protect } = require("../middleware/authMiddleware");
const { uploadOrderFile, uploadConversationAttachment } = require("../middleware/uploadMiddleware");

const maybeUploadConversationAttachment = (req, res, next) => {
  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  if (!contentType.includes("multipart/form-data")) return next();
  uploadConversationAttachment(req, res, (err) => {
    if (!err) return next();
    const message = err.message === "File type not allowed" ? "File type not allowed" : err.message;
    res.status(400).json({ message });
  });
};

router.post("/", protect, createServiceOrder);
router.post("/create-checkout-session", protect, createServiceCheckoutSession);
router.get("/my-orders", protect, getMyServiceOrders);

// Messages
router.get("/:orderId/messages", protect, getOrderMessages);
router.post("/:orderId/messages", protect, maybeUploadConversationAttachment, createOrderMessage);
router.get("/:orderId/messages/:messageId/attachment", protect, downloadOrderMessageAttachment);

// Files
router.get("/:orderId/files", protect, getOrderFiles);
router.post("/:orderId/files", protect, uploadOrderFile, uploadOrderFileHandler);
router.get("/:orderId/files/:fileId/download", protect, downloadOrderFile);

// Order details
router.get("/:id", protect, getServiceOrderById);
router.patch("/:id/status", protect, updateServiceOrderStatus);

module.exports = router;
