const express = require("express");
const router = express.Router();

const {
  createConnectAccount,
  getConnectStatus,
  refreshConnectLink,
} = require("../controllers/stripeConnectController");

const { protect } = require("../middleware/authMiddleware");
const { stripeConnectLimiter } = require("../middleware/rateLimiters");

router.post("/create-account", protect, stripeConnectLimiter, createConnectAccount);
router.get("/status", protect, getConnectStatus);
router.post("/refresh-link", protect, refreshConnectLink);

module.exports = router;
