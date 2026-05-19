const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =======================
// Order Files Directory
// =======================
const orderFilesDir = path.join(__dirname, "../../uploads/order-files");

if (!fs.existsSync(orderFilesDir)) {
  fs.mkdirSync(orderFilesDir, { recursive: true });
}

// =======================
// Product Files Directory
// =======================
const productFilesDir = path.join(__dirname, "../../uploads/product-files");

if (!fs.existsSync(productFilesDir)) {
  fs.mkdirSync(productFilesDir, { recursive: true });
}

// =======================
// Allowed file types
// =======================
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/plain",
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

// =======================
// Helper filename
// =======================
const generateFileName = (originalname) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = path.extname(originalname);
  const baseName = path.basename(originalname, ext).replace(/\s+/g, "-");

  return `${baseName}-${uniqueSuffix}${ext}`;
};

// =======================
// Order file upload
// =======================
const orderStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, orderFilesDir);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname));
  },
});

const uploadOrderFile = multer({
  storage: orderStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter,
}).single("file");

// =======================
// Product file upload
// =======================
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productFilesDir);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname));
  },
});

const uploadProductFile = multer({
  storage: productStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for digital products
  },
  fileFilter,
}).single("file");

module.exports = {
  uploadOrderFile,
  uploadProductFile,
};