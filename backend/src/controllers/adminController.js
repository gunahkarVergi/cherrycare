import { getUsers, updateUserRole } from "../models/userModel.js";
import { getAllApplications as getApplicationsOfAllUsers } from "../models/financingModel.js";

export const getAllUsers = async (req, res) => {
  try {
    const result = await getUsers();
    res.json({ users: result });
  } catch (err) {
    console.error("Get all users error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Change user role (admin only)
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params; // user id from URL
    const { role } = req.body; // new role

    // only allow specific roles (safety check)
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const result = await updateUserRole(role, id);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Role updated successfully", user: result.rows[0] });
  } catch (err) {
    console.error("Change role error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const result = await getApplicationsOfAllUsers();
    res.json({ applications: result });
  } catch (err) {
    console.error("Get all applications error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};  // TO DO duplicate at financingController, delete one of the applications
