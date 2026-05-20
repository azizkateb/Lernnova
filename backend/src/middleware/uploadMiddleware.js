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
// Avatar Directory
// =======================
const avatarsDir = path.join(__dirname, "../../uploads/avatars");

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// =======================
// Service Thumbnails Directory
// =======================
const serviceThumbnailsDir = path.join(__dirname, "../../uploads/service-thumbnails");

if (!fs.existsSync(serviceThumbnailsDir)) {
  fs.mkdirSync(serviceThumbnailsDir, { recursive: true });
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

const imageTypes = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

const imageFilter = (req, file, cb) => {
  if (imageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
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

// =======================
// Avatar upload
// =======================
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname));
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
  fileFilter: imageFilter,
}).single("avatar");

// =======================
// Service thumbnail upload
// =======================
const serviceThumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, serviceThumbnailsDir);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname));
  },
});

const uploadServiceThumbnail = multer({
  storage: serviceThumbnailStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
}).single("thumbnail");

module.exports = {
  uploadOrderFile,
  uploadProductFile,
  uploadAvatar,
  uploadServiceThumbnail,
};
