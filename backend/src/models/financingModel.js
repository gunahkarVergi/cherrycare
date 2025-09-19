import pool from "../config/db.js";

export const createApplication = async ({
  user_id,
  service_name,
  reason,
  payment_plan,
}) => {
  const result = await pool.query(
    `INSERT INTO financing_applications (user_id, service_name, reason, payment_plan)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [user_id, service_name, reason, payment_plan]
  );
  return result.rows[0];
};

export const getApplicationsByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT * FROM financing_applications WHERE user_id = $1 ORDER BY created_at DESC`,
    [user_id]
  );
  return result.rows;
};

export const getAllApplications = async () => {
  const result = await pool.query(
    `SELECT fa.*, u.first_name, u.last_name, u.email
     FROM financing_applications fa
     JOIN users u ON fa.user_id = u.id
     ORDER BY fa.created_at DESC`
  );
  return result.rows;
};

export const updateApplication = async (status, id) => {
  const result = await pool.query(
    `UPDATE financing_applications
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );
  return result.rows;
};
