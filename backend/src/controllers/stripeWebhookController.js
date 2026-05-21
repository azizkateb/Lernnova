const stripe = require("../config/stripe");
const prisma = require("../config/prisma");
const notificationService = require("../services/notificationService");

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

          // Fetch order details for notification
          const serviceOrderDetails = await prisma.serviceOrder.findUnique({
            where: { id: serviceOrderId },
            include: {
              service: { select: { title: true } },
              buyer: { select: { id: true, name: true, avatar_url: true } },
              seller: { select: { id: true, name: true, avatar_url: true } },
            },
          });

          if (serviceOrderDetails) {
            // Notify buyer
            await notificationService.createNotification({
              userId: serviceOrderDetails.buyer.id,
              type: "service_payment_paid",
              title: "Service payment confirmed",
              message: `Your service order is ready. You can message the seller.`,
              link: `/service-orders/${serviceOrderId}`,
              metadata: { order_id: serviceOrderId },
            });

            // Notify seller
            await notificationService.createNotification({
              userId: serviceOrderDetails.seller.id,
              type: "service_payment_paid_seller",
              title: "Service payment received",
              message: `Payment was confirmed for ${serviceOrderDetails.service?.title || "service order"}.`,
              link: `/service-orders/${serviceOrderId}`,
              metadata: { order_id: serviceOrderId },
            });
          }
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

        // Fetch order details for notification
        const productOrderDetails = await prisma.productOrder.findUnique({
          where: { id: orderId },
          include: {
            product: { select: { title: true } },
            buyer: { select: { id: true, name: true, avatar_url: true } },
            seller: { select: { id: true, name: true, avatar_url: true } },
          },
        });

        if (productOrderDetails) {
          // Notify buyer
          await notificationService.createNotification({
            userId: productOrderDetails.buyer.id,
            type: "product_payment_paid",
            title: "Your product is ready",
            message: `Your payment was confirmed. You can now download ${productOrderDetails.product?.title || "your product"}.`,
            link: "/buyer/product-orders",
            metadata: { order_id: orderId },
          });

          // Notify seller
          await notificationService.createNotification({
            userId: productOrderDetails.seller.id,
            type: "product_payment_paid_seller",
            title: "Product payment received",
            message: `Payment was confirmed for ${productOrderDetails.product?.title || "product order"}.`,
            link: "/seller/product-orders",
            metadata: { order_id: orderId },
          });
        }
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