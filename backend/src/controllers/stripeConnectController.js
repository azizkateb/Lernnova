const stripe = require("../config/stripe");
const prisma = require("../config/prisma");

const isStripeReady = () => {
  if (!stripe) {
    if (process.env.NODE_ENV === "development") {
      const configuredKey = String(process.env.STRIPE_SECRET_KEY || "");
      const hint = configuredKey ? configuredKey.slice(0, 8) : "missing";
      console.error(`Stripe is unavailable for Connect requests. Key hint: ${hint}`);
    }
    return {
      ready: false,
      message: "Stripe is not configured right now. Please try again later.",
    };
  }
  return { ready: true };
};

const getDisconnectedStatus = (overrides = {}) => ({
  connected: false,
  needsReconnect: false,
  onboardingComplete: false,
  chargesEnabled: false,
  payoutsEnabled: false,
  detailsSubmitted: false,
  accountId: null,
  onboarding_complete: false,
  charges_enabled: false,
  payouts_enabled: false,
  details_submitted: false,
  account_id: null,
  ...overrides,
});

const isConnectNotEnabledError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("signed up for connect") ||
    message.includes("not enabled for connect") ||
    message.includes("connect is not enabled")
  );
};

const isStripeAuthOrConfigError = (error) => {
  return (
    error?.type === "StripeAuthenticationError" ||
    error?.statusCode === 401 ||
    error?.code === "api_key_expired" ||
    error?.code === "invalid_api_key"
  );
};

const isRecoverableConnectAccountError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return (
    error?.statusCode === 404 ||
    error?.code === "resource_missing" ||
    error?.code === "account_invalid" ||
    error?.type === "invalid_request_error" ||
    message.includes("no such account") ||
    message.includes("account does not exist") ||
    message.includes("does not belong to your platform") ||
    message.includes("does not have access to account") ||
    message.includes("application access may have been revoked") ||
    message.includes("platform controls")
  );
};

const clearStripeConnectState = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripe_account_id: null,
      stripe_onboarding_complete: false,
      stripe_charges_enabled: false,
      stripe_payouts_enabled: false,
      stripe_details_submitted: false,
    },
  });
};

// POST /api/stripe/connect/create-account
const createConnectAccount = async (req, res) => {
  try {
    const check = isStripeReady();
    if (!check.ready) {
      return res.status(503).json({ message: check.message });
    }

    if (req.user.role !== "seller" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only sellers can connect a Stripe account." });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        stripe_account_id: true,
        stripe_onboarding_complete: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    let accountId = user.stripe_account_id;

    if (accountId) {
      // Onboarding was completed; return existing account
      if (user.stripe_onboarding_complete) {
        return res.status(200).json({
          message: "Stripe account already connected.",
          account_id: accountId,
          onboarding_complete: true,
        });
      }
    } else {
      // Create new Express connected account
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        business_profile: {
          name: user.name || user.email,
          url: process.env.FRONTEND_URL,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      accountId = account.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripe_account_id: accountId },
      });
    }

    // Create onboarding link
    const refreshUrl = process.env.STRIPE_CONNECT_REFRESH_URL || `${process.env.FRONTEND_URL}/seller/earnings`;
    const returnUrl = process.env.STRIPE_CONNECT_RETURN_URL || `${process.env.FRONTEND_URL}/seller/earnings`;

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    res.status(201).json({
      message: "Stripe Connect onboarding link created.",
      account_id: accountId,
      onboarding_url: accountLink.url,
      onboarding_complete: false,
    });
  } catch (error) {
    if (isConnectNotEnabledError(error)) {
      if (process.env.NODE_ENV === "development") {
        console.error("Stripe Connect not enabled:", error.message);
      }
      return res.status(503).json({
        message: "Stripe Connect is not enabled for this platform account. Please enable Connect in Stripe Dashboard.",
        connectNotEnabled: true,
      });
    }
    console.error("Stripe Connect create account error:", error.message);
    res.status(500).json({
      message: "Failed to create Stripe Connect account.",
    });
  }
};

// GET /api/stripe/connect/status
const getConnectStatus = async (req, res) => {
  try {
    const check = isStripeReady();
    if (!check.ready) {
      return res.status(503).json({ message: check.message });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        stripe_account_id: true,
        stripe_onboarding_complete: true,
        stripe_charges_enabled: true,
        stripe_payouts_enabled: true,
        stripe_details_submitted: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    if (!user.stripe_account_id) {
      return res.json(getDisconnectedStatus());
    }

    // Sync status from Stripe
    try {
      const account = await stripe.accounts.retrieve(user.stripe_account_id);

      const chargesEnabled = account.charges_enabled;
      const payoutsEnabled = account.payouts_enabled;
      const detailsSubmitted = account.details_submitted;
      const onboardingComplete = detailsSubmitted && chargesEnabled;

      if (
        onboardingComplete !== user.stripe_onboarding_complete ||
        chargesEnabled !== user.stripe_charges_enabled ||
        payoutsEnabled !== user.stripe_payouts_enabled ||
        detailsSubmitted !== user.stripe_details_submitted
      ) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripe_onboarding_complete: onboardingComplete,
            stripe_charges_enabled: chargesEnabled,
            stripe_payouts_enabled: payoutsEnabled,
            stripe_details_submitted: detailsSubmitted,
          },
        });
      }

      return res.json({
        connected: true,
        needsReconnect: false,
        onboardingComplete: onboardingComplete,
        chargesEnabled: chargesEnabled,
        payoutsEnabled: payoutsEnabled,
        detailsSubmitted: detailsSubmitted,
        accountId: user.stripe_account_id,
        onboarding_complete: onboardingComplete,
        charges_enabled: chargesEnabled,
        payouts_enabled: payoutsEnabled,
        details_submitted: detailsSubmitted,
        account_id: user.stripe_account_id,
      });
    } catch (stripeError) {
      if (isRecoverableConnectAccountError(stripeError)) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Stripe Connect account needs reconnect:",
            stripeError?.message || stripeError
          );
        }

        await clearStripeConnectState(user.id);

        return res.json(
          getDisconnectedStatus({
            needsReconnect: true,
            message: "Stripe account needs to be reconnected.",
          })
        );
      }

      if (isStripeAuthOrConfigError(stripeError)) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "Stripe Connect status config/auth error:",
            stripeError?.message || stripeError
          );
        }
        return res.status(503).json({
          message: "Stripe is not configured right now. Please try again later.",
        });
      }

      throw stripeError;
    }
  } catch (error) {
    if (isConnectNotEnabledError(error)) {
      if (process.env.NODE_ENV === "development") {
        console.error("Stripe Connect not enabled:", error.message);
      }
      return res.status(503).json({
        message: "Stripe Connect is not enabled for this platform account. Please enable Connect in Stripe Dashboard.",
        connectNotEnabled: true,
      });
    }
    if (isStripeAuthOrConfigError(error)) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "Stripe Connect status config/auth error:",
          error?.message || error
        );
      }
      return res.status(503).json({
        message: "Stripe is not configured right now. Please try again later.",
      });
    }

    console.error("Stripe Connect status error:", error.message);
    res.status(500).json({
      message: "Failed to retrieve Stripe Connect status.",
    });
  }
};

// POST /api/stripe/connect/refresh-link
const refreshConnectLink = async (req, res) => {
  try {
    const check = isStripeReady();
    if (!check.ready) {
      return res.status(503).json({ message: check.message });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, stripe_account_id: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    if (!user.stripe_account_id) {
      return res.status(400).json({ message: "No Stripe account found. Create one first." });
    }

    const refreshUrl = process.env.STRIPE_CONNECT_REFRESH_URL || `${process.env.FRONTEND_URL}/seller/earnings`;
    const returnUrl = process.env.STRIPE_CONNECT_RETURN_URL || `${process.env.FRONTEND_URL}/seller/earnings`;

    const accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    res.json({
      message: "New onboarding link created.",
      onboarding_url: accountLink.url,
    });
  } catch (error) {
    if (isConnectNotEnabledError(error)) {
      if (process.env.NODE_ENV === "development") {
        console.error("Stripe Connect not enabled:", error.message);
      }
      return res.status(503).json({
        message: "Stripe Connect is not enabled for this platform account. Please enable Connect in Stripe Dashboard.",
        connectNotEnabled: true,
      });
    }
    console.error("Stripe Connect refresh link error:", error.message);
    res.status(500).json({
      message: "Failed to create new onboarding link.",
    });
  }
};

module.exports = {
  createConnectAccount,
  getConnectStatus,
  refreshConnectLink,
};
