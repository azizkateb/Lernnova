const Stripe = require("stripe");
require("dotenv").config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const isStripeConfigured =
  stripeSecretKey &&
  !stripeSecretKey.includes("xxxx") &&
  (stripeSecretKey.startsWith("sk_") || stripeSecretKey.startsWith("rk_"));

if (!isStripeConfigured && process.env.NODE_ENV !== "production") {
  console.warn("Stripe secret key is missing or not configured correctly.");
}

if (isStripeConfigured) {
  if (stripeSecretKey.startsWith("rk_test_") || stripeSecretKey.startsWith("sk_test_")) {
    console.warn("Stripe test mode configured. Test cards can be used.");
  } else if (stripeSecretKey.startsWith("rk_live_") || stripeSecretKey.startsWith("sk_live_")) {
    console.warn("Stripe live mode configured. Test cards will not work.");
  }
}

const stripe = isStripeConfigured ? new Stripe(stripeSecretKey) : null;

module.exports = stripe;