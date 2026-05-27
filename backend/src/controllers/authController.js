const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { generateRawToken, hashToken } = require("../utils/tokenHelper");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/emailService");
const { generateProfileSlug, ensureUniqueSlug } = require("../utils/slugify");

const MIN_PASSWORD_LENGTH = 8;
const PUBLIC_ROLES = new Set(["buyer", "seller"]);

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const normalizeRole = (value) => String(value || "buyer").trim().toLowerCase();

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// Register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const requestedRole = normalizeRole(role);

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    if (!PUBLIC_ROLES.has(requestedRole)) {
      return res.status(400).json({
        message: "Invalid account role selected",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const rawToken = generateRawToken();
    const hashedVerificationToken = hashToken(rawToken);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const trimmedName = String(name).trim();
    const baseSlug = generateProfileSlug(trimmedName);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        password: hashedPassword,
        role: requestedRole,
        profile_slug: baseSlug ? await ensureUniqueSlug(prisma, baseSlug) : null,
        email_verified: false,
        email_verification_token: hashedVerificationToken,
        email_verification_expires: verificationExpires,
      },
    });

    try {
      await sendVerificationEmail(normalizedEmail, rawToken);
    } catch (emailError) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to send verification email:", emailError.message);
      }

      return res.status(201).json({
        message:
          "Account created, but we could not send the verification email right now. Please try resending verification later.",
        emailVerificationRequired: true,
      });
    }

    res.status(201).json({
      message: "Account created. Please check your email to verify your account.",
      emailVerificationRequired: true,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Server error during registration",
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        message: "Your account is disabled",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        emailVerificationRequired: true,
      });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        public_id: user.public_id,
        profile_slug: user.profile_slug,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        avatar_url: user.avatar_url,
        headline: user.headline,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login",
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required",
      });
    }

    const hashedToken = hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        email_verification_token: hashedToken,
        email_verification_expires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Verification link is invalid or has expired.",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        email_verification_token: null,
        email_verification_expires: null,
      },
    });

    res.json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({
      message: "Server error during email verification",
    });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const genericMessage =
      "If your account exists and is not verified, a new verification email has been sent.";

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || user.email_verified) {
      return res.json({ message: genericMessage });
    }

    const rawToken = generateRawToken();
    const hashedVerificationToken = hashToken(rawToken);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verification_token: hashedVerificationToken,
        email_verification_expires: verificationExpires,
      },
    });

    try {
      await sendVerificationEmail(normalizedEmail, rawToken);
    } catch (emailError) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to resend verification email:", emailError.message);
      }
    }

    res.json({ message: genericMessage });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const genericMessage =
      "If an account exists with this email, a reset link has been sent.";

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return res.json({ message: genericMessage });
    }

    const rawToken = generateRawToken();
    const hashedResetToken = hashToken(rawToken);
    const resetExpires = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_reset_token: hashedResetToken,
        password_reset_expires: resetExpires,
      },
    });

    try {
      await sendPasswordResetEmail(normalizedEmail, rawToken);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError.message);
    }

    res.json({ message: genericMessage });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const hashedToken = hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        password_reset_token: hashedToken,
        password_reset_expires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "This reset link is invalid or has expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null,
      },
    });

    res.json({
      message: "Your password has been reset. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get current user
const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        public_id: true,
        profile_slug: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        avatar_url: true,
        headline: true,
        bio: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({
      user,
    });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  register,
  login,
  me,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};
