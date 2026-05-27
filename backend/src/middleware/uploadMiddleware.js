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
// Product Thumbnails Directory
// =======================
const productThumbnailsDir = path.join(__dirname, "../../uploads/product-thumbnails");

if (!fs.existsSync(productThumbnailsDir)) {
  fs.mkdirSync(productThumbnailsDir, { recursive: true });
}

// =======================
// Product Gallery Directory
// =======================
const productGalleryDir = path.join(__dirname, "../../uploads/product-gallery");

if (!fs.existsSync(productGalleryDir)) {
  fs.mkdirSync(productGalleryDir, { recursive: true });
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
// Conversation Attachments Directory
// =======================
const conversationAttachmentsDir = path.join(
  __dirname,
  "../../uploads/conversation-attachments"
);

if (!fs.existsSync(conversationAttachmentsDir)) {
  fs.mkdirSync(conversationAttachmentsDir, { recursive: true });
}

// =======================
// Allowed file types
// =======================
const allowedFileTypes = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
  ".gif": ["image/gif"],
  ".pdf": ["application/pdf"],
  ".zip": ["application/zip", "application/x-zip-compressed"],
  ".rar": ["application/vnd.rar", "application/x-rar-compressed"],
  ".doc": ["application/msword"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ".ppt": ["application/vnd.ms-powerpoint"],
  ".pptx": [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  ".xls": ["application/vnd.ms-excel"],
  ".xlsx": [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  ".txt": ["text/plain"],
};

const allowedImageTypes = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
  ".gif": ["image/gif"],
};

const allowedProductImageTypes = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
};

const hasAllowedExtensionAndMime = (file, allowedMap) => {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const allowedMimes = allowedMap[extension];
  return Boolean(allowedMimes && allowedMimes.includes(file.mimetype));
};

const fileFilter = (req, file, cb) => {
  if (hasAllowedExtensionAndMime(file, allowedFileTypes)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

const imageFilter = (req, file, cb) => {
  if (hasAllowedExtensionAndMime(file, allowedImageTypes)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const productImageFilter = (req, file, cb) => {
  if (hasAllowedExtensionAndMime(file, allowedProductImageTypes)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WebP images are allowed"), false);
  }
};

// =======================
// Helper filename
// =======================
const generateFileName = (originalname) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = path.extname(originalname || "").toLowerCase();
  const baseName = path
    .basename(originalname || "file", ext)
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "file";

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
// Product image upload (thumbnail + gallery)
// =======================
const productImagesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "thumbnail") {
      cb(null, productThumbnailsDir);
      return;
    }
    cb(null, productGalleryDir);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname));
  },
});

const uploadProductImagesMulter = multer({
  storage: productImagesStorage,
  limits: {
    fileSize: 3 * 1024 * 1024,
    files: 4,
  },
  fileFilter: productImageFilter,
}).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "galleryImages", maxCount: 3 },
]);

const uploadProductImages = (req, res, next) => {
  const contentType = String(req.headers["content-type"] || "");
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return next();
  }
  return uploadProductImagesMulter(req, res, next);
};

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

// =======================
// Conversation attachment upload
// =======================
const conversationAttachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, conversationAttachmentsDir);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname));
  },
});

const uploadConversationAttachment = multer({
  storage: conversationAttachmentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
}).single("file");

module.exports = {
  uploadOrderFile,
  uploadProductFile,
  uploadProductImages,
  uploadAvatar,
  uploadServiceThumbnail,
  uploadConversationAttachment,
};
