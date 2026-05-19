const Stripe = require("stripe");
require("dotenv").config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey || stripeSecretKey.includes("xxxx")) {
  console.warn("Stripe secret key is missing or not configured correctly.");
}

const stripe =
  stripeSecretKey && !stripeSecretKey.includes("xxxx")
    ? new Stripe(stripeSecretKey)
    : null;

module.exports = stripe;