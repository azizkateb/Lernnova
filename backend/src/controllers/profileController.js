const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");

// GET /api/profile/me
const getMyProfile = async (req, res) => {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        avatar_url: true,
        headline: true,
        bio: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!profile) {
      return res.status(404).json({
        message: "User profile not found",
      });
    }

    res.json({
      profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      message: "Server error while fetching profile",
    });
  }
};

// PUT /api/profile/me
const updateMyProfile = async (req, res) => {
  try {
    const { name, headline, bio } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
          message: "Name must be at least 2 characters",
        });
      }
      updateData.name = name.trim();
    }

    if (headline !== undefined) {
      if (headline !== null && typeof headline === "string" && headline.length > 150) {
        return res.status(400).json({
          message: "Headline must be 150 characters or less",
        });
      }
      updateData.headline = headline === "" ? null : headline;
    }

    if (bio !== undefined) {
      if (bio !== null && typeof bio === "string" && bio.length > 2000) {
        return res.status(400).json({
          message: "Bio must be 2000 characters or less",
        });
      }
      updateData.bio = bio === "" ? null : bio;
    }

    const profile = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        avatar_url: true,
        headline: true,
        bio: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: "Server error while updating profile",
    });
  }
};

// POST /api/profile/avatar
const uploadMyAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No avatar file provided",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        avatar_url: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Delete old avatar if it exists
    if (user.avatar_url) {
      const oldAvatarPath = path.join(__dirname, "../../", user.avatar_url);
      if (fs.existsSync(oldAvatarPath)) {
        try {
          fs.unlinkSync(oldAvatarPath);
        } catch (err) {
          console.error("Error deleting old avatar:", err);
        }
      }
    }

    // Construct relative avatar path
    const avatarPath = `uploads/avatars/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        avatar_url: avatarPath,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        avatar_url: true,
        headline: true,
        bio: true,
      },
    });

    res.json({
      message: "Avatar uploaded successfully",
      avatar_url: updatedUser.avatar_url,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({
      message: "Server error while uploading avatar",
    });
  }
};

// GET /api/profile/:id
const getPublicProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        avatar_url: true,
        headline: true,
        bio: true,
        is_active: true,
        created_at: true,
      },
    });

    if (!user || !user.is_active) {
      return res.status(404).json({
        message: "User profile not found",
      });
    }

    // Get seller stats if user is seller
    const stats = {
      services_count: 0,
      products_count: 0,
      completed_service_orders_count: 0,
      completed_product_orders_count: 0,
    };

    if (user.role === "seller") {
      const [
        servicesCount,
        productsCount,
        completedServiceOrders,
        completedProductOrders,
      ] = await Promise.all([
        prisma.service.count({
          where: {
            user_id: userId,
            status: "active",
          },
        }),
        prisma.product.count({
          where: {
            user_id: userId,
            status: "active",
          },
        }),
        prisma.serviceOrder.count({
          where: {
            seller_id: userId,
            status: "completed",
          },
        }),
        prisma.productOrder.count({
          where: {
            seller_id: userId,
            payment_status: "paid",
            order_status: "completed",
          },
        }),
      ]);

      stats.services_count = servicesCount;
      stats.products_count = productsCount;
      stats.completed_service_orders_count = completedServiceOrders;
      stats.completed_product_orders_count = completedProductOrders;
    }

    const profile = {
      id: user.id,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      headline: user.headline,
      bio: user.bio,
      created_at: user.created_at,
    };

    res.json({
      profile,
      stats,
    });
  } catch (error) {
    console.error("Get public profile error:", error);
    res.status(500).json({
      message: "Server error while fetching profile",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
  getPublicProfile,
};
