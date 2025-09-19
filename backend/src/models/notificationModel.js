import pool from "../config/db.js";

export const createNotification = async ({ user_id, message }) => {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *`,
    [user_id, message]
  );
  return result.rows[0];
};

export const getUserNotifications = async (user_id) => {
  const result = await pool.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
    [user_id]
  );
  return result.rows;
};

export const markAsRead = async (id) => {
  const result = await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

export const markAllAsRead = async () => {
};

export const deleteNotification = async (id) => {
  const result = await pool.query(
    `DELETE FROM notifications WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};
