const DEFAULT_LOCAL_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];
const DEFAULT_DB_CONNECTION_LIMIT = 5;

let validated = false;

const readEnv = (name) => String(process.env[name] || "").trim();
const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseOriginList = (...values) =>
  values
    .filter(Boolean)
    .flatMap((value) =>
      String(value)
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
    );

const hasDatabaseConfig = () => {
  const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  return required.every((name) => readEnv(name));
};

const getAllowedCorsOrigins = () => {
  const configuredOrigins = parseOriginList(
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGINS
  );

  if (process.env.NODE_ENV === "production") {
    return [...new Set(configuredOrigins)];
  }

  const localOrigins = parseOriginList(process.env.LOCAL_FRONTEND_URL);
  return [...new Set([...DEFAULT_LOCAL_ORIGINS, ...localOrigins, ...configuredOrigins])];
};

const getDatabaseConnectionLimit = () =>
  parsePositiveInteger(
    process.env.DB_CONNECTION_LIMIT,
    DEFAULT_DB_CONNECTION_LIMIT
  );

const warnOptionalService = (condition, message) => {
  if (condition && process.env.NODE_ENV !== "production") {
    console.warn(message);
  }
};

const validateRuntimeEnv = () => {
  if (validated) return;

  const missing = [];

  if (!readEnv("JWT_SECRET")) {
    missing.push("JWT_SECRET");
  }

  if (!hasDatabaseConfig()) {
    missing.push("DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME");
  }

  const uniqueMissing = [...new Set(missing)];

  if (uniqueMissing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${uniqueMissing.join(
        ", "
      )}. Copy backend/.env.example to backend/.env and set safe values before starting the server.`
    );
  }

  const jwtSecret = readEnv("JWT_SECRET");
  const insecureJwtSecret =
    jwtSecret.length < 16 ||
    /^change_this_secret$/i.test(jwtSecret) ||
    /^your[_-]/i.test(jwtSecret);

  if (insecureJwtSecret) {
    const message =
      "JWT_SECRET looks like a placeholder or is too short. Use a long random secret before production.";
    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    }
    console.warn(message);
  }

  warnOptionalService(
    !readEnv("FRONTEND_URL"),
    "FRONTEND_URL is not configured. Email links and Stripe redirects may not work correctly."
  );
  warnOptionalService(
    !readEnv("DATABASE_URL"),
    "DATABASE_URL is not configured. Prisma CLI commands such as generate and migrate require it even though runtime uses DB_* variables."
  );
  warnOptionalService(
    !readEnv("BREVO_API_KEY"),
    "BREVO_API_KEY is not configured. Verification and password reset emails will be skipped."
  );
  warnOptionalService(
    !readEnv("BREVO_SENDER_EMAIL"),
    "BREVO_SENDER_EMAIL is not configured. Outbound emails may fail once BREVO_API_KEY is added."
  );
  warnOptionalService(
    !readEnv("STRIPE_SECRET_KEY"),
    "STRIPE_SECRET_KEY is not configured. Stripe Checkout and Connect features will be unavailable."
  );
  warnOptionalService(
    !!readEnv("STRIPE_SECRET_KEY") && !readEnv("STRIPE_WEBHOOK_SECRET"),
    "STRIPE_WEBHOOK_SECRET is not configured. Stripe webhooks will be rejected until it is set."
  );

  validated = true;
};

module.exports = {
  getDatabaseConnectionLimit,
  getAllowedCorsOrigins,
  validateRuntimeEnv,
};
