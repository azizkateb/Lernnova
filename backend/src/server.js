const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const multer = require("multer");
require("dotenv").config();
const { getAllowedCorsOrigins, validateRuntimeEnv } = require("./config/env");
const prisma = require("./config/prisma");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const serviceOrderRoutes = require("./routes/serviceOrderRoutes");
const serviceInquiryRoutes = require("./routes/serviceInquiryRoutes");
const productCategoryRoutes = require("./routes/productCategoryRoutes");
const productRoutes = require("./routes/productRoutes");
const productOrderRoutes = require("./routes/productOrderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const profileRoutes = require("./routes/profileRoutes");
const stripeWebhookRoutes = require("./routes/stripeWebhookRoutes");
const stripeConnectRoutes = require("./routes/stripeConnectRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const path = require("path");

validateRuntimeEnv();

const app = express();
let isShuttingDown = false;

// Trust proxy for Cloudflare / ngrok / reverse proxy setups
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
app.use(compression());

const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = getAllowedCorsOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (!isProduction) {
      console.warn("Blocked by CORS:", origin);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "ngrok-skip-browser-warning",
  ],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Stripe webhook must be before express.json()
app.use(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookRoutes
);
app.use(
  "/uploads/avatars",
  express.static(path.join(__dirname, "../uploads/avatars"))
);

app.use(
  "/uploads/service-thumbnails",
  express.static(path.join(__dirname, "../uploads/service-thumbnails"))
);

app.use(
  "/uploads/product-thumbnails",
  express.static(path.join(__dirname, "../uploads/product-thumbnails"))
);

app.use(
  "/uploads/product-gallery",
  express.static(path.join(__dirname, "../uploads/product-gallery"))
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.status(isShuttingDown ? 503 : 200).json({
    status: isShuttingDown ? "shutting_down" : "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/ready", async (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({
      status: "shutting_down",
    });
  }

  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return res.json({
      status: "ready",
    });
  } catch (error) {
    console.error("Readiness check failed:", error?.message || error);
    return res.status(503).json({
      status: "not_ready",
    });
  }
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 300 : 5000,
  message: {
    message: "Too many requests, please try again later",
  },
});

app.use(limiter);

app.get("/", (req, res) => {
  res.json({
    message: "Lernnova API is running successfully",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/service-orders", serviceOrderRoutes);
app.use("/api/service-inquiries", serviceInquiryRoutes);
app.use("/api/product-categories", productCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-orders", productOrderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/stripe/connect", stripeConnectRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    console.error("Global error:", err);
  } else {
    console.error("Global error:", err?.message || "Unknown error");
  }

  if (typeof err?.message === "string" && err.message.startsWith("Not allowed by CORS")) {
    return res.status(403).json({
      message: "This origin is not allowed to access the API.",
    });
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      const url = String(req.originalUrl || "");
      const isProductFileUpload = url.includes("/api/products/") && url.includes("/files");
      return res.status(413).json({
        message: isProductFileUpload ? "File is too large" : "Image must be 3MB or smaller.",
        code: "FILE_TOO_LARGE",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(413).json({
        message: "Too many files uploaded",
        code: "TOO_MANY_FILES",
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "Unexpected file field",
        code: "UNEXPECTED_FILE",
      });
    }

    return res.status(400).json({
      message: err.message,
      code: err.code,
    });
  }

  if (
    typeof err?.message === "string" &&
    (err.message.includes("Only JPG, PNG, and WebP images are allowed") ||
      err.message.includes("Only image files are allowed") ||
      err.message.includes("File type not allowed"))
  ) {
    return res.status(400).json({
      message: err.message,
      code: "INVALID_FILE_TYPE",
    });
  }

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    message:
      statusCode >= 500 && isProduction
        ? "Something went wrong. Please try again later."
        : err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const shutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  const forceExitTimer = setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10000);

  if (typeof forceExitTimer.unref === "function") {
    forceExitTimer.unref();
  }

  try {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    await prisma.$disconnect();
    clearTimeout(forceExitTimer);
    console.log("HTTP server closed and Prisma disconnected.");
    process.exit(0);
  } catch (error) {
    console.error("Graceful shutdown failed:", error?.message || error);
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error(
        "Prisma disconnect during shutdown failed:",
        disconnectError?.message || disconnectError
      );
    }
    clearTimeout(forceExitTimer);
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
