const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
require("dotenv").config();

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
const notificationRoutes = require("./routes/notificationRoutes");
const path = require("path");

const app = express();

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

// Build the allowed origins list from env variables
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGINS,
]
  .filter(Boolean)
  .flatMap((origin) =>
    origin
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, Postman, curl, etc.)
    if (!origin) return callback(null, true);

    // In development, allow all origins
    if (!isProduction) {
      return callback(null, true);
    }

    // In production, only allow explicitly listed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "ngrok-skip-browser-warning",
  ],
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

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

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
app.use("/api/notifications", notificationRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Global error:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
