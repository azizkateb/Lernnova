require("dotenv").config();
const prisma = require("../src/config/prisma");
const Stripe = require("stripe");

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY is not set");
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey);

const args = process.argv.slice(2);
const days = parseInt(args.find((a) => a.startsWith("--days="))?.split("=")[1] || "7", 10);
const limit = parseInt(args.find((a) => a.startsWith("--limit="))?.split("=")[1] || "100", 10);

const createdAfter = new Date();
createdAfter.setDate(createdAfter.getDate() - days);

async function reconcile() {
  console.log(`Reconciling Stripe checkout sessions...`);
  console.log(`  Period: last ${days} days (since ${createdAfter.toISOString().split("T")[0]})`);
  console.log(`  Max sessions: ${limit}`);
  console.log("");

  const sessions = await stripe.checkout.sessions.list({
    limit,
    status: "complete",
    created: { gte: Math.floor(createdAfter.getTime() / 1000) },
  });

  const paidSessions = sessions.data.filter((s) => s.payment_status === "paid");

  console.log(`Total sessions fetched: ${sessions.data.length}`);
  console.log(`Completed & paid:       ${paidSessions.length}`);
  console.log("");

  let updated = 0;
  let skippedAlreadyPaid = 0;
  let skippedUnknown = 0;
  let missing = 0;

  for (const session of paidSessions) {
    const metadata = session.metadata || {};
    const type = metadata.type;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || null;

    if (type === "product_order") {
      const orderId = parseInt(metadata.product_order_id, 10);
      if (!orderId) {
        console.warn(`  [SKIP] Session ${session.id}: missing product_order_id in metadata`);
        skippedUnknown++;
        continue;
      }

      const order = await prisma.productOrder.findUnique({ where: { id: orderId } });
      if (!order) {
        console.warn(`  [MISS] Session ${session.id}: ProductOrder ${orderId} not found in DB`);
        missing++;
        continue;
      }

      if (order.payment_status === "paid") {
        console.log(`  [SKIP] Session ${session.id}: ProductOrder ${orderId} already paid`);
        skippedAlreadyPaid++;
        continue;
      }

      await prisma.productOrder.update({
        where: { id: orderId },
        data: {
          payment_status: "paid",
          order_status: "completed",
          stripe_session_id: session.id,
          stripe_payment_intent_id: paymentIntentId,
        },
      });
      console.log(`  [ OK ] Session ${session.id}: ProductOrder ${orderId} set to paid`);
      updated++;
    } else if (type === "service_order") {
      const orderId = parseInt(metadata.service_order_id, 10);
      if (!orderId) {
        console.warn(`  [SKIP] Session ${session.id}: missing service_order_id in metadata`);
        skippedUnknown++;
        continue;
      }

      const order = await prisma.serviceOrder.findUnique({ where: { id: orderId } });
      if (!order) {
        console.warn(`  [MISS] Session ${session.id}: ServiceOrder ${orderId} not found in DB`);
        missing++;
        continue;
      }

      if (order.payment_status === "paid") {
        console.log(`  [SKIP] Session ${session.id}: ServiceOrder ${orderId} already paid`);
        skippedAlreadyPaid++;
        continue;
      }

      await prisma.serviceOrder.update({
        where: { id: orderId },
        data: {
          payment_status: "paid",
          stripe_session_id: session.id,
          stripe_payment_intent_id: paymentIntentId,
          paid_at: new Date(),
        },
      });
      console.log(`  [ OK ] Session ${session.id}: ServiceOrder ${orderId} set to paid`);
      updated++;
    } else {
      console.log(`  [SKIP] Session ${session.id}: unknown metadata type "${type}"`);
      skippedUnknown++;
    }
  }

  console.log("");
  console.log("=== Reconciliation Summary ===");
  console.log(`  Sessions checked:      ${paidSessions.length}`);
  console.log(`  Orders updated:        ${updated}`);
  console.log(`  Already paid (skipped): ${skippedAlreadyPaid}`);
  console.log(`  Unknown type (skipped): ${skippedUnknown}`);
  console.log(`  Order not found (missing): ${missing}`);
  console.log("");

  if (updated === 0) {
    console.log("No updates needed.");
  } else {
    console.log(`Done. ${updated} order(s) reconciled.`);
  }

  await prisma.$disconnect?.();
}

reconcile().catch(async (err) => {
  console.error("Reconciliation failed:", err);
  await prisma.$disconnect?.();
  process.exit(1);
});
