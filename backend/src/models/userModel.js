import pool from "../config/db.js";

export const createUser = async ({
  first_name,
  last_name,
  email,
  password_hash,
  role,
}) => {
  const result = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, role`,
    [first_name, last_name, email, password_hash, role]
  );
  return result.rows[0];
};

export const getUserByEmail = async (email) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  return result.rows[0];
};

export const getUsers = async () => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, role FROM users ORDER BY id`
  );
  return result.rows;
};

export const updateUserRole = async (role, id) => {
  const result = await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, first_name, last_name, email, role`,
      [role, id]
    );
  return result;
};

export const updateUserById = async (id, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);

  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const query = `
    UPDATE users
    SET ${setClause}
    WHERE id = $${keys.length + 1}
    RETURNING id, first_name, last_name, email, role
  `;

  const result = await pool.query(query, [...values, id]);
  return result.rows[0];
};
