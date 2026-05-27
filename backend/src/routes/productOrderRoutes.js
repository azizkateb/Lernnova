const express = require("express");
const router = express.Router();

const {
  createProductOrder,
  createStripeCheckoutSession,
  getMyProductOrders,
  getProductOrderById,
  updateProductOrderPaymentStatus,
  updateProductOrderStatus,
  getPurchasedProductFiles,
  downloadPurchasedProductFile,
} = require("../controllers/productOrderController");

const { protect, allowRoles } = require("../middleware/authMiddleware");
const { checkoutSessionLimiter } = require("../middleware/rateLimiters");

router.post("/", protect, createProductOrder);

router.post(
  "/create-checkout-session",
  protect,
  checkoutSessionLimiter,
  createStripeCheckoutSession
);

router.get("/my-orders", protect, getMyProductOrders);

router.get("/:id/files", protect, getPurchasedProductFiles);
router.get("/:id/files/:fileId/download", protect, downloadPurchasedProductFile);

router.get("/:id", protect, getProductOrderById);
router.patch("/:id/payment-status", protect, allowRoles("admin"), updateProductOrderPaymentStatus);
router.patch("/:id/order-status", protect, updateProductOrderStatus);

module.exports = router;
