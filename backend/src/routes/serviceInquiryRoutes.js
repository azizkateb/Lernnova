const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { uploadConversationAttachment } = require("../middleware/uploadMiddleware");
const {
  createServiceInquiry,
  getServiceInquiries,
  getServiceInquiryById,
  sendServiceInquiryMessage,
  downloadServiceInquiryMessageAttachment,
  closeServiceInquiry,
} = require("../controllers/serviceInquiryController");

const maybeUploadConversationAttachment = (req, res, next) => {
  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  if (!contentType.includes("multipart/form-data")) return next();
  uploadConversationAttachment(req, res, (err) => {
    if (!err) return next();
    const message = err.message === "File type not allowed" ? "File type not allowed" : err.message;
    res.status(400).json({ message });
  });
};

router.post("/", protect, createServiceInquiry);
router.get("/", protect, getServiceInquiries);
router.get("/:id", protect, getServiceInquiryById);
router.post("/:id/messages", protect, maybeUploadConversationAttachment, sendServiceInquiryMessage);
router.get("/:inquiryId/messages/:messageId/attachment", protect, downloadServiceInquiryMessageAttachment);
router.patch("/:id/close", protect, closeServiceInquiry);

module.exports = router;
