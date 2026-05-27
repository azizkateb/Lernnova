const CACHE_DURATION_SECONDS = 45;

const PUBLIC_GET_PREFIXES = [
  "/api/categories",
  "/api/product-categories",
  "/api/services",
  "/api/products",
];

const cacheControl = (req, res, next) => {
  if (req.method !== "GET") {
    return next();
  }

  const url = req.originalUrl || req.url;

  const shouldCache = PUBLIC_GET_PREFIXES.some((prefix) => {
    if (url.startsWith(prefix)) {
      const remaining = url.slice(prefix.length);
      return remaining === "" || remaining.startsWith("?") || remaining.startsWith("/");
    }
    return false;
  });

  if (shouldCache) {
    res.set("Cache-Control", `public, max-age=0, s-maxage=${CACHE_DURATION_SECONDS}, must-revalidate`);
  }

  next();
};

module.exports = cacheControl;
