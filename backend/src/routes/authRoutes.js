const express = require("express");
const router = express.Router();

const {
  register,
  login,
  me,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const {
  authLoginLimiter,
  authRegisterLimiter,
  forgotPasswordLimiter,
  resendVerificationLimiter,
  resetPasswordLimiter,
} = require("../middleware/rateLimiters");

router.post("/register", authRegisterLimiter, register);
router.post("/login", authLoginLimiter, login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationLimiter, resendVerification);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPasswordLimiter, resetPassword);
router.get("/me", protect, me);

module.exports = router;
