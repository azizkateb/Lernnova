const Stripe = require("stripe");
require("dotenv").config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Valid backend Stripe key prefixes: secret keys (sk_) and restricted keys (rk_)
const isValidBackendStripeKey = (key) =>
  key &&
  !key.includes("xxxx") &&
  (key.startsWith("sk_test_") ||
    key.startsWith("sk_live_") ||
    key.startsWith("rk_test_") ||
    key.startsWith("rk_live_"));

// Reject publishable keys - they must never be used in backend
if (stripeSecretKey?.startsWith("pk_")) {
  console.error(
    "ERROR: STRIPE_SECRET_KEY is a publishable key (pk_*). Publishable keys must never be used in backend. Use a secret key (sk_*) or restricted key (rk_*) instead."
  );
}

const isStripeConfigured = isValidBackendStripeKey(stripeSecretKey);

if (!isStripeConfigured && process.env.NODE_ENV !== "production") {
  if (!stripeSecretKey) {
    console.warn("Stripe backend key is missing or not configured correctly.");
  } else if (stripeSecretKey.startsWith("pk_")) {
    console.error(
      "ERROR: Invalid Stripe backend key (publishable key detected). Use a secret key (sk_*) or restricted key (rk_*) with Checkout Sessions permission."
    );
  } else {
    console.warn(
      `Stripe backend key format not recognized: ${stripeSecretKey.substring(0, 8)}...`
    );
  }
}

if (isStripeConfigured) {
  const keyMode = stripeSecretKey.startsWith("rk_") ? "restricted" : "secret";
  const keyEnv = stripeSecretKey.startsWith("live") ? "live" : "test";
  console.log(`Stripe configured with ${keyMode} key in ${keyEnv} mode.`);

  if (
    stripeSecretKey.startsWith("sk_test_") ||
    stripeSecretKey.startsWith("rk_test_")
  ) {
    console.warn("Stripe test mode configured. Test cards can be used.");
  } else if (
    stripeSecretKey.startsWith("sk_live_") ||
    stripeSecretKey.startsWith("rk_live_")
  ) {
    console.warn("Stripe live mode configured. Test cards will not work.");
  }
}

const stripe = isStripeConfigured ? new Stripe(stripeSecretKey) : null;

module.exports = stripe;