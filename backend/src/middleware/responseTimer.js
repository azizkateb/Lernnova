const SLOW_REQUEST_THRESHOLD_MS = 1000;

const responseTimer = (req, res, next) => {
  if (process.env.NODE_ENV === "production" && !process.env.LOG_SLOW_REQUESTS) {
    return next();
  }

  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration > SLOW_REQUEST_THRESHOLD_MS) {
      const method = req.method;
      const url = req.originalUrl || req.url;
      console.warn(`[SLOW] ${method} ${url} - ${duration}ms`);
    }
  });

  next();
};

module.exports = responseTimer;
