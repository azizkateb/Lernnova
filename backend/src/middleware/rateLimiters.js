const rateLimit = require("express-rate-limit");

const isProduction = process.env.NODE_ENV === "production";

const createLimiter = ({ windowMs, maxProd, maxDev, message }) =>
  rateLimit({
    windowMs,
    max: isProduction ? maxProd : maxDev,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });

const authLoginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  maxProd: 5,
  maxDev: 25,
  message: "Too many login attempts. Please wait a few minutes and try again.",
});

const authRegisterLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  maxProd: 5,
  maxDev: 20,
  message: "Too many registration attempts. Please try again later.",
});

const forgotPasswordLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  maxProd: 3,
  maxDev: 10,
  message:
    "Too many password reset requests. Please wait a few minutes before trying again.",
});

const resendVerificationLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  maxProd: 3,
  maxDev: 10,
  message:
    "Too many verification email requests. Please wait a few minutes before trying again.",
});

const resetPasswordLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  maxProd: 5,
  maxDev: 20,
  message: "Too many password reset attempts. Please try again later.",
});

const stripeConnectLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  maxProd: 10,
  maxDev: 30,
  message:
    "Too many Stripe Connect requests. Please wait a bit before trying again.",
});

const checkoutSessionLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  maxProd: 20,
  maxDev: 60,
  message:
    "Too many checkout attempts. Please wait a moment before trying again.",
});

const uploadActionLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  maxProd: 30,
  maxDev: 120,
  message: "Too many upload attempts. Please wait a bit and try again.",
});

const messageActionLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  maxProd: 60,
  maxDev: 240,
  message: "Too many messages sent. Please slow down and try again shortly.",
});

module.exports = {
  authLoginLimiter,
  authRegisterLimiter,
  checkoutSessionLimiter,
  forgotPasswordLimiter,
  messageActionLimiter,
  resendVerificationLimiter,
  resetPasswordLimiter,
  stripeConnectLimiter,
  uploadActionLimiter,
};
