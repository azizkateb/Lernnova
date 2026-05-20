const express = require("express");
const router = express.Router();

const {
  stripeWebhookHandler,
} = require("../controllers/stripeWebhookController");

router.post("/", stripeWebhookHandler);

module.exports = router;