const prisma = require("../config/prisma");

const createNotification = async ({ userId, type, title, message, link, metadata }) => {
  try {
    if (!userId || !type || !title || !message) {
      console.warn("createNotification: missing required fields", { userId, type, title });
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        user_id: userId,
        type,
        title,
        message,
        link: link || null,
        metadata: metadata || null,
      },
    });

    return notification;
  } catch (error) {
    // Log but don't throw — notifications should never break main flows
    console.error("Failed to create notification:", error.message);
    return null;
  }
};

const createManyNotifications = async (notifications) => {
  try {
    const results = await Promise.allSettled(
      notifications.map((n) => createNotification(n))
    );
    return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  } catch (error) {
    console.error("Failed to create batch notifications:", error.message);
    return [];
  }
};

module.exports = { createNotification, createManyNotifications };
