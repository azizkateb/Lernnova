const express = require("express");
const router = express.Router();

const {
  createProductOrder,
  createStripeCheckoutSession,
  getMyProductOrders,
  getProductOrderById,
  updateProductOrderPaymentStatus,
  getPurchasedProductFiles,
  downloadPurchasedProductFile,
} = require("../controllers/productOrderController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createProductOrder);

router.post(
  "/create-checkout-session",
  protect,
  createStripeCheckoutSession
);

router.get("/my-orders", protect, getMyProductOrders);

router.get("/:id/files", protect, getPurchasedProductFiles);
router.get("/:id/files/:fileId/download", protect, downloadPurchasedProductFile);

router.get("/:id", protect, getProductOrderById);
router.patch("/:id/payment-status", protect, updateProductOrderPaymentStatus);

module.exports = router;