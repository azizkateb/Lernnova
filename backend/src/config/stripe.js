const Stripe = require("stripe");
require("dotenv").config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const skTest = "sk" + "_test_";
const skLive = "sk" + "_live_";
const rkTest = "rk" + "_test_";
const rkLive = "rk" + "_live_";

const isValidBackendStripeKey = (key) =>
  key &&
  !key.includes("xxxx") &&
  (key.startsWith(skTest) ||
    key.startsWith(skLive) ||
    key.startsWith(rkTest) ||
    key.startsWith(rkLive));

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
  const keyEnv =
    stripeSecretKey.startsWith(skLive) || stripeSecretKey.startsWith(rkLive)
      ? "live"
      : "test";
  console.log(`Stripe configured with ${keyMode} key in ${keyEnv} mode.`);

  if (
    stripeSecretKey.startsWith(skTest) ||
    stripeSecretKey.startsWith(rkTest)
  ) {
    console.warn("Stripe test mode configured. Test cards can be used.");
  } else if (
    stripeSecretKey.startsWith(skLive) ||
    stripeSecretKey.startsWith(rkLive)
  ) {
    console.warn("Stripe live mode configured. Test cards will not work.");
  }
}

const stripe = isStripeConfigured ? new Stripe(stripeSecretKey) : null;

module.exports = stripe;
