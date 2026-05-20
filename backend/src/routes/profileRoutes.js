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

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.post(
  "/avatar",
  protect,
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
router.get("/:id", getPublicProfile);

module.exports = router;
