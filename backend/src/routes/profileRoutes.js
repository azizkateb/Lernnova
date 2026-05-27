const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
  getPublicProfile,
} = require("../controllers/profileController");

const { protect } = require("../middleware/authMiddleware");
const { uploadAvatar } = require("../middleware/uploadMiddleware");
const { uploadActionLimiter } = require("../middleware/rateLimiters");

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.post(
  "/avatar",
  protect,
  uploadActionLimiter,
  (req, res, next) => {
    uploadAvatar(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  uploadMyAvatar
);
router.get("/:identifier", getPublicProfile);

module.exports = router;
