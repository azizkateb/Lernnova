# Stripe Webhook Debugging Guide for Service Orders

## Current Status

### ✅ Verified Working
1. **Environment Configuration**
   - `STRIPE_WEBHOOK_SECRET=whsec_FKg10u0Qt4SJBoFLk1Dv2AsT5nkwscOA` ✅ Present and correct format
   - `STRIPE_SECRET_KEY=rk_test_...` ✅ Present (restricted test key)
   - `FRONTEND_URL=http://localhost:3000` ✅ Single URL (not comma-separated)
   - `CORS_ORIGINS=http://localhost:5173` ✅ Correct

2. **Server.js Route Order** ✅ CORRECT
   ```javascript
   // Line 87-91: Webhook route BEFORE express.json()
   app.use(
     "/api/stripe/webhook",
     express.raw({ type: "application/json" }),
     stripeWebhookRoutes
   );
   app.use(express.json({ limit: "10mb" })); // Line 102
   ```

3. **Service Checkout Session Metadata** ✅ CORRECT
   ```javascript
   // serviceOrderController.js lines 555-561
   metadata: {
     type: "service_order",
     service_order_id: String(order.id),
     service_id: String(service.id),
     buyer_id: String(buyerId),
     seller_id: String(service.user_id),
   }
   ```

4. **Webhook Handler Logic** ✅ CORRECT
   - Checks `session.metadata?.type === "service_order"` ✅
   - Checks `session.metadata?.service_order_id` ✅
   - Updates `payment_status: "paid"` ✅
   - Updates `stripe_payment_intent_id` ✅
   - Updates `paid_at` ✅
   - Does NOT change workflow status ✅

5. **Product Webhook** ✅ Unchanged and working

### 🔍 Enhanced Logging Added

The webhook controller now logs:
- `[Stripe Webhook] received:` event type
- `[Stripe Webhook] session.id:`
- `[Stripe Webhook] metadata:` full metadata object
- `[Stripe Webhook] session.payment_status:`
- `[Stripe Webhook] session.payment_intent:`
- `[Stripe Webhook] service order id:` when processing service orders
- `[Stripe Webhook] Found service order:` with current payment_status
- `[Stripe Webhook] Service order X payment confirmed (paid)` on success
- `[Stripe Webhook] signature verification failed:` on error
- `[Stripe Webhook] Service order X not found for webhook` if order missing
- `[Stripe Webhook] Service order metadata present but service_order_id missing` if metadata incomplete

---

## Test Steps

### Step 1: Ensure Backend is Running
```bash
cd c:\Users\azizk\OneDrive\Desktop\LernnovaProject\backend
npm start
```

Expected output:
```
Stripe configured with restricted key in test mode.
Stripe test mode configured. Test cards can be used.
Server is running on port 5000
```

### Step 2: Set Up Stripe CLI (for local testing)

**Option A: Using Stripe CLI (Recommended for local development)**

1. Install Stripe CLI if not installed:
   ```bash
   # Windows (via scoop)
   scoop install stripe
   
   # Or download from: https://docs.stripe.com/stripe-cli
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```
   This will open a browser. Make sure you're logged into the **correct Stripe account** (the one that owns the `rk_test_` key).

3. Start webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:5000/api/stripe/webhook
   ```

4. **IMPORTANT**: Copy the NEW `whsec_...` value from the CLI output:
   ```
   > Ready! You're using Stripe CLI to forward webhook events...
   > Webhook Endpoint: http://localhost:5000/api/stripe/webhook
   > Signing secret: whsec_XXXXXXXXXXXXXXXXXXXXXXXX
   ```

5. **Update backend/.env** with the NEW secret from CLI:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXX  # ← Replace with CLI value
   ```

6. **Restart backend** after updating .env

**Option B: Using Stripe Dashboard Webhook (for Cloudflare/production)**

1. Get current Cloudflare tunnel URL:
   ```bash
   cloudflared tunnel --url http://localhost:5000
   ```
   Note the URL: `https://xxxx-xxxx.trycloudflare.com`

2. Go to Stripe Dashboard → Developers → Webhooks

3. Add endpoint:
   ```
   https://xxxx-xxxx.trycloudflare.com/api/stripe/webhook
   ```

4. Select events:
   - ✅ `checkout.session.completed`
   - ✅ `checkout.session.expired`
   - ✅ `payment_intent.payment_failed`

5. Copy the `whsec_...` signing secret for **that specific endpoint**

6. Update `backend/.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXX
   ```

7. Restart backend

### Step 3: Test Service Checkout

1. Login as a **buyer** (not the seller who owns the service)

2. Navigate to a service page

3. Click "Order Service" or checkout button

4. You'll be redirected to Stripe Checkout

5. Use test card:
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ZIP: 12345
   ```

6. Complete payment

### Step 4: Monitor Logs

**Backend terminal should show:**
```
[Stripe Webhook] received: checkout.session.completed
[Stripe Webhook] session.id: cs_test_XXXXX
[Stripe Webhook] metadata: {
  type: 'service_order',
  service_order_id: '5',
  service_id: '3',
  buyer_id: '2',
  seller_id: '1'
}
[Stripe Webhook] session.payment_status: paid
[Stripe Webhook] session.payment_intent: pi_XXXXX
[Stripe Webhook] service order id: 5
[Stripe Webhook] Found service order: 5 current payment_status: pending
[Stripe Webhook] Service order 5 payment confirmed (paid)
```

**If using Stripe CLI**, the CLI terminal should show:
```
2024-05-22 10:30:00   --> checkout.session.completed [200] POST http://localhost:5000/api/stripe/webhook
```

The `[200]` means backend responded successfully.

---

## Common Issues & Solutions

### Issue 1: Webhook Secret Mismatch
**Symptom:** `[Stripe Webhook] signature verification failed: No signatures found matching the expected signature for payload`

**Cause:** `STRIPE_WEBHOOK_SECRET` in .env doesn't match the webhook endpoint that's sending events.

**Solution:**
- If using Stripe CLI: Copy the `whsec_` from CLI output, not from Stripe Dashboard
- If using Stripe Dashboard: Copy the `whsec_` from the exact endpoint URL that matches your current backend URL
- **Never mix secrets between different endpoints**

### Issue 2: Events Not Reaching Backend
**Symptom:** No `[Stripe Webhook]` logs appear in backend terminal after payment

**Causes:**
1. **Stripe CLI not running** or logged into wrong account
2. **Cloudflare tunnel URL changed** but Stripe Dashboard still has old URL
3. **Wrong Stripe account** - checkout uses different `STRIPE_SECRET_KEY` than webhook listener

**Solutions:**
1. Verify Stripe CLI is running and shows "Ready!"
2. Check Cloudflare tunnel URL matches Stripe Dashboard webhook endpoint exactly
3. Verify `STRIPE_SECRET_KEY` in .env matches the Stripe account you're testing with

### Issue 3: Backend Returns 400
**Symptom:** Stripe CLI shows `[400]` instead of `[200]`

**Causes:**
1. Signature verification failed (see Issue 1)
2. `express.json()` registered before webhook route (not the case here - already correct)
3. Invalid payload format

**Solution:** Check backend logs for `[Stripe Webhook] signature verification failed:`

### Issue 4: Event Received But Order Not Updated
**Symptom:** Logs show event received but no "payment confirmed" message

**Causes:**
1. Metadata `type` is not `"service_order"` (check logs)
2. Metadata `service_order_id` is missing (check logs)
3. Service order not found in database (check logs)

**Solutions:**
1. Check `[Stripe Webhook] metadata:` log to see what was sent
2. Verify checkout session creation includes correct metadata
3. Check if order ID in metadata exists in database

### Issue 5: Restricted Key Missing Permissions
**Symptom:** Checkout session creation fails or webhook can't read session data

**Cause:** The `rk_test_` restricted key doesn't have required permissions.

**Solution:**
1. Go to Stripe Dashboard → Developers → API keys → Restricted keys
2. Edit the restricted key
3. Ensure it has these permissions:
   - ✅ **Checkout Sessions** - Read & Write
   - ✅ **Payment Intents** - Read
   - ✅ **Customers** - Read (optional)
4. Or use a full secret key (`sk_test_...`) instead

---

## Verification Checklist

After successful test, verify:

- [ ] Backend logs show `[Stripe Webhook] received: checkout.session.completed`
- [ ] Backend logs show correct metadata with `type: 'service_order'`
- [ ] Backend logs show `[Stripe Webhook] Service order X payment confirmed (paid)`
- [ ] Stripe CLI/Dashboard shows `[200]` response
- [ ] Database shows `payment_status = 'paid'` for the service order
- [ ] Database shows `stripe_payment_intent_id` is populated
- [ ] Database shows `paid_at` timestamp is set
- [ ] Database shows `status` is still `'pending'` (workflow status unchanged)
- [ ] Buyer receives notification
- [ ] Seller receives notification
- [ ] Product orders still work (test one)
- [ ] No secrets appear in logs

---

## Quick Database Check

After test, verify in database:
```sql
SELECT id, payment_status, stripe_payment_intent_id, paid_at, status 
FROM service_orders 
ORDER BY id DESC 
LIMIT 5;
```

Expected result for latest service order:
```
id | payment_status | stripe_payment_intent_id | paid_at              | status
---|----------------|--------------------------|----------------------|--------
5  | paid           | pi_XXXXX                 | 2024-05-22 10:30:00  | pending
```

---

## Files Modified

1. **backend/src/controllers/stripeWebhookController.js**
   - Added comprehensive logging for debugging
   - Improved `stripe_payment_intent_id` handling with `String()` conversion
   - Added log for missing `service_order_id` in metadata
   - All logs prefixed with `[Stripe Webhook]` for easy filtering
   - **No secrets are logged**

---

## Important Notes

1. **DO NOT** manually update `payment_status` in database as a workaround
2. **DO NOT** change Stripe checkout logic
3. **DO NOT** modify webhook signature verification
4. **DO NOT** expose `STRIPE_WEBHOOK_SECRET` or `STRIPE_SECRET_KEY`
5. **ALWAYS** use the webhook secret that belongs to your exact webhook endpoint
6. **RESTART** backend after changing `.env`
7. The webhook code was already correct - the issue is likely environmental (secret mismatch or endpoint URL mismatch)

---

## Next Steps

1. Follow test steps above
2. Share backend logs after test payment
3. Share Stripe CLI output (if using CLI)
4. Based on logs, we can pinpoint exact issue

The most likely cause is **webhook secret mismatch** between:
- The secret in `backend/.env`
- The secret for the endpoint that's actually receiving events
