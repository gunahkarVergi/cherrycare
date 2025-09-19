import { getUserNotifications, markAsRead, markAllAsRead, deleteNotification as deleteNotif } from "../models/notificationModel.js";

export const fetchNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const notifications = await getUserNotifications(user_id);
    res.json({ notifications });
  } catch (err) {
    console.error("Fetch notifications error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const readNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await markAsRead(id);
    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    console.error("Mark as read error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await markAllAsRead();
    res.json({ message: "All notifications marked as read"});
  } catch (err) {
    console.error("All notifications mark as read error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await deleteNotif(id);
    res.json({ message: "Notification deleted", notification });
  } catch (err) {
    console.error("Delete notification error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
