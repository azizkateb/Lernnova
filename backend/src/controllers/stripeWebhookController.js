const stripe = require("../config/stripe");
const prisma = require("../config/prisma");

const stripeWebhookHandler = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      message: "Stripe is not configured yet.",
    });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  let event;

  if (!webhookSecret || webhookSecret.trim() === "") {
    // Secret not configured
    if (isProduction) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured in production!");
      return res.status(500).json({
        message: "Webhook secret not configured",
      });
    }

    // Dev mode: skip signature verification
    console.warn(
      "\u26a0\ufe0f STRIPE_WEBHOOK_SECRET not set. Skipping signature verification (dev mode only)."
    );
    try {
      event = JSON.parse(req.body);
    } catch (parseError) {
      console.error("Failed to parse webhook body as JSON:", parseError.message);
      return res.status(400).json({
        message: "Invalid webhook payload",
      });
    }
  } else {
    // Normal path: verify signature
    const signature = req.headers["stripe-signature"];

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
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Handle service order payment
      if (session.metadata?.type === "service_order" && session.metadata?.service_order_id) {
        const serviceOrderId = parseInt(session.metadata.service_order_id);

        const serviceOrder = await prisma.serviceOrder.findUnique({
          where: { id: serviceOrderId },
        });

        if (serviceOrder) {
          await prisma.serviceOrder.update({
            where: { id: serviceOrderId },
            data: {
              payment_status: "paid",
              stripe_payment_intent_id: session.payment_intent || null,
              paid_at: new Date(),
            },
          });
          console.log(`Service order ${serviceOrderId} payment confirmed (paid)`);
        } else {
          console.warn(`Service order ${serviceOrderId} not found for webhook`);
        }
      }

      // Handle product order payment
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

      // Handle service order expiry
      if (session.metadata?.type === "service_order" && session.metadata?.service_order_id) {
        const serviceOrderId = parseInt(session.metadata.service_order_id);
        await prisma.serviceOrder.update({
          where: { id: serviceOrderId },
          data: { payment_status: "failed" },
        }).catch(err => console.warn(`Failed to update expired service order ${serviceOrderId}:`, err.message));
      }

      // Handle product order expiry
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