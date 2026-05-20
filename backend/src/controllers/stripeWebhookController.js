const stripe = require("../config/stripe");
const prisma = require("../config/prisma");

const stripeWebhookHandler = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      message: "Stripe is not configured yet.",
    });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret || webhookSecret.trim() === "") {
    console.warn("Stripe webhook secret is not configured. Webhook events will not be verified.");
    return res.status(400).json({
      message: "Webhook secret is not configured. Please set STRIPE_WEBHOOK_SECRET in your environment.",
    });
  }

  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error.message);

    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const orderId = Number(session.metadata?.product_order_id);

      if (orderId) {
        await prisma.productOrder.update({
          where: {
            id: orderId,
          },
          data: {
            payment_status: "paid",
            order_status: "completed",
            stripe_session_id: session.id,
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
          },
        });

        console.log(`Product order ${orderId} marked as paid/completed`);
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;

      const orderId = Number(session.metadata?.product_order_id);

      if (orderId) {
        await prisma.productOrder.update({
          where: {
            id: orderId,
          },
          data: {
            payment_status: "failed",
            order_status: "cancelled",
            stripe_session_id: session.id,
          },
        });

        console.log(`Product order ${orderId} marked as failed/cancelled`);
      }
    }

    return res.json({
      received: true,
    });
  } catch (error) {
    console.error("Stripe webhook handling error:", error);

    return res.status(500).json({
      message: "Webhook handling failed",
    });
  }
};

module.exports = {
  stripeWebhookHandler,
};