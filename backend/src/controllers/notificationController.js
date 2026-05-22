const prisma = require("../config/prisma");

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { user_id: userId } }),
    ]);

    res.json({
      data: notifications,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get notifications error:", error.message);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { user_id: req.user.id, is_read: false },
    });
    res.json({ count });
  } catch (error) {
    console.error("Get unread count error:", error.message);
    res.status(500).json({ message: "Failed to get unread count" });
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid notification id" });
    }
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error.message);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

// PATCH /api/notifications/mark-all-read
const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { user_id: req.user.id, is_read: false },
      data: { is_read: true },
    });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all as read error:", error.message);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid notification id" });
    }
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.notification.delete({ where: { id } });
    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error.message);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
