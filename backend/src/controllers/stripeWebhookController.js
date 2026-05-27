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
  const allowInsecureWebhook =
    !isProduction && process.env.STRIPE_ALLOW_INSECURE_WEBHOOKS === "true";

  let event;

  if (!webhookSecret || webhookSecret.trim() === "") {
    if (!allowInsecureWebhook) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured.");
      return res.status(503).json({
        message: "Stripe webhook is not configured.",
      });
    }

    console.warn(
      "STRIPE_WEBHOOK_SECRET not set. Accepting unsigned Stripe webhooks only because STRIPE_ALLOW_INSECURE_WEBHOOKS=true in development."
    );
    try {
      const rawBody = Buffer.isBuffer(req.body)
        ? req.body.toString("utf8")
        : String(req.body || "");
      event = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("Failed to parse webhook body as JSON:", parseError.message);
      return res.status(400).json({
        message: "Invalid webhook payload",
      });
    }
  } else {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(400).json({
        message: "Missing Stripe signature header",
      });
    }

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (error) {
      console.error("[Stripe Webhook] signature verification failed:", error.message);
      return res.status(400).json({
        message: "Webhook signature verification failed",
      });
    }
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : null;

      if (session.payment_status !== "paid") {
        return res.json({
          received: true,
        });
      }

      // Handle service order payment
      if (session.metadata?.type === "service_order" && session.metadata?.service_order_id) {
        const serviceOrderId = parseInt(session.metadata.service_order_id);

        const serviceOrder = await prisma.serviceOrder.findUnique({
          where: { id: serviceOrderId },
          select: {
            id: true,
            payment_status: true,
            stripe_session_id: true,
            stripe_payment_intent_id: true,
          },
        });

        if (serviceOrder) {
          const alreadyProcessed =
            serviceOrder.payment_status === "paid" ||
            (paymentIntentId &&
              serviceOrder.stripe_payment_intent_id === paymentIntentId);

          if (!alreadyProcessed) {
            await prisma.serviceOrder.update({
              where: { id: serviceOrderId },
              data: {
                payment_status: "paid",
                stripe_session_id: session.id,
                stripe_payment_intent_id: paymentIntentId,
                paid_at: new Date(),
              },
            });

            const serviceOrderDetails = await prisma.serviceOrder.findUnique({
              where: { id: serviceOrderId },
              include: {
                service: { select: { title: true } },
                buyer: { select: { id: true, name: true, avatar_url: true } },
                seller: { select: { id: true, name: true, avatar_url: true } },
              },
            });

            if (serviceOrderDetails) {
              await notificationService.createNotification({
                userId: serviceOrderDetails.buyer.id,
                type: "service_payment_paid",
                title: "Service payment confirmed",
                message: `Your service order is ready. You can message the seller.`,
                link: `/service-orders/${serviceOrderId}`,
                metadata: { order_id: serviceOrderId },
              });

              await notificationService.createNotification({
                userId: serviceOrderDetails.seller.id,
                type: "service_payment_paid_seller",
                title: "Service payment received",
                message: `Payment was confirmed for ${serviceOrderDetails.service?.title || "service order"}.`,
                link: `/service-orders/${serviceOrderId}`,
                metadata: { order_id: serviceOrderId },
              });
            }
          }
        } else {
          console.warn(`[Stripe Webhook] Service order ${serviceOrderId} not found for webhook`);
        }
      } else if (session.metadata?.type === "service_order") {
        console.log("[Stripe Webhook] Service order metadata present but service_order_id missing");
      }

      // Handle product order payment
      const orderId = Number(session.metadata?.product_order_id);

      if (orderId) {
        const existingOrder = await prisma.productOrder.findUnique({
          where: { id: orderId },
          select: {
            id: true,
            payment_status: true,
            stripe_session_id: true,
            stripe_payment_intent_id: true,
          },
        });

        if (!existingOrder) {
          console.warn(`[Stripe Webhook] Product order ${orderId} not found for webhook`);
        }

        const alreadyProcessed =
            !existingOrder ||
            existingOrder.payment_status === "paid" ||
            (paymentIntentId &&
              existingOrder.stripe_payment_intent_id === paymentIntentId);

        if (!alreadyProcessed) {
          await prisma.productOrder.update({
            where: {
              id: orderId,
            },
            data: {
              payment_status: "paid",
              order_status: "completed",
              stripe_session_id: session.id,
              stripe_payment_intent_id: paymentIntentId,
            },
          });

          const productOrderDetails = await prisma.productOrder.findUnique({
            where: { id: orderId },
            include: {
              product: { select: { title: true } },
              buyer: { select: { id: true, name: true, avatar_url: true } },
              seller: { select: { id: true, name: true, avatar_url: true } },
            },
          });

          if (productOrderDetails) {
            await notificationService.createNotification({
              userId: productOrderDetails.buyer.id,
              type: "product_payment_paid",
              title: "Your product is ready",
              message: `Your payment was confirmed. You can now download ${productOrderDetails.product?.title || "your product"}.`,
              link: "/buyer/product-orders",
              metadata: { order_id: orderId },
            });

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
    }

    // Sync Stripe Connect account status on account.updated
    if (event.type === "account.updated") {
      const account = event.data.object;

      console.log("[Stripe Webhook] account.updated for:", account.id);

      const seller = await prisma.user.findFirst({
        where: { stripe_account_id: account.id },
      });

      if (seller) {
        await prisma.user.update({
          where: { id: seller.id },
          data: {
            stripe_onboarding_complete: account.details_submitted && account.charges_enabled,
            stripe_charges_enabled: account.charges_enabled,
            stripe_payouts_enabled: account.payouts_enabled,
            stripe_details_submitted: account.details_submitted,
          },
        });
        console.log(`[Stripe Webhook] Updated seller ${seller.id} connect status`);
      } else {
        console.log(`[Stripe Webhook] No seller found for account ${account.id}`);
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;

      // Handle service order expiry
      if (session.metadata?.type === "service_order" && session.metadata?.service_order_id) {
        const serviceOrderId = parseInt(session.metadata.service_order_id);
        const serviceOrder = await prisma.serviceOrder.findUnique({
          where: { id: serviceOrderId },
          select: { id: true, payment_status: true },
        });

        if (serviceOrder?.payment_status === "pending") {
          await prisma.serviceOrder
            .update({
              where: { id: serviceOrderId },
              data: { payment_status: "failed" },
            })
            .catch((err) =>
              console.warn(
                `Failed to update expired service order ${serviceOrderId}:`,
                err.message
              )
            );
        }
      }

      // Handle product order expiry
      const orderId = Number(session.metadata?.product_order_id);

      if (orderId) {
        const productOrder = await prisma.productOrder.findUnique({
          where: { id: orderId },
          select: { id: true, payment_status: true },
        });

        if (productOrder?.payment_status === "pending") {
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
        }
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
