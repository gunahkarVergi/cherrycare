import pool from "../config/db.js";
import bcrypt from "bcrypt";
import redisClient from "../config/redisClient.js";
import { createUser, updateUserById, getUserByEmail } from "../models/userModel.js";
import { createToken, getTokenTTL, verifyToken } from "../utils/jwt.js";
import { REDIS_BLACKLIST_PREFIX } from "../config/constants.js";

export const signup = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUser = await createUser({
      first_name,
      last_name,
      email,
      password_hash,
      role: role || "user", // default role
    });

    // Create token using helper
    const token = createToken(
      { id: newUser.id, first_name: newUser.first_name, last_name: newUser.last_name, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      "1h"
    );

    res.status(201).json({ message: "User created", user: newUser, token });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: "Invalid email or password" });

    // Create token using helper
    const token = createToken(
      { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      "1h"
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Logout
export const logout = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    const ttl = getTokenTTL(token); // calculate expiry in seconds

    await redisClient.set(`${REDIS_BLACKLIST_PREFIX}${decoded.jti}`, "true", { EX: ttl });

    res.json({ message: "Successfully logged out" });
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, password } = req.body;

    const fieldsToUpdate = {};

    if (first_name) fieldsToUpdate.first_name = first_name;
    if (last_name) fieldsToUpdate.last_name = last_name;

    if (password) {
      const saltRounds = 10;
      fieldsToUpdate.password_hash = await bcrypt.hash(password, saltRounds);
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updatedUser = await updateUserById(userId, fieldsToUpdate);

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("Update me error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMe = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    res.json({ message: "Your account has been deleted" });
  } catch (err) {
    console.error("Delete me error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
