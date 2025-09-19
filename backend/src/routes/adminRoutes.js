import express from "express";
import {
  getAllUsers,
  changeUserRole,
  getAllApplications,
} from "../controllers/adminController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Only admins can access, this is a test route
router.get("/admin-test", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "This is admin-only data" });
});

// Only admins can view all users
router.get("/all-users", authenticate, authorize("admin"), getAllUsers);

// Only admins can change roles
router.patch("/change-role/:id", authenticate, authorize("admin"), changeUserRole);

// Only admins can view all applications
router.get("/applications", authenticate, authorize("admin"), getAllApplications);

// Update application status route - WITH AUTH!
router.patch("/applications/:id", authenticate, authorize("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { emitNotification } = req.app.locals;

      // Update the application in database
      const [result] = await pool.query(
        "UPDATE financing_applications SET status = ? WHERE id = ?",
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Get the updated application with user info
      const [applicationRows] = await pool.query(
        "SELECT fa.*, u.first_name, u.last_name FROM financing_applications fa JOIN users u ON fa.user_id = u.id WHERE fa.id = ?",
        [id]
      );

      const updatedApplication = applicationRows[0];

      // Create notification for the user
      const notification = {
        message: `Your application for "${updatedApplication.service_name}" has been ${status}`,
        type: "application_update",
        is_read: false,
        user_id: updatedApplication.user_id,
        application_id: updatedApplication.id,
      };

      // Save notification to database
      const [notificationResult] = await pool.query(
        "INSERT INTO notifications (message, type, is_read, user_id, application_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
        [
          notification.message,
          notification.type,
          notification.is_read,
          notification.user_id,
          notification.application_id,
        ]
      );

      const savedNotification = {
        id: notificationResult.insertId,
        ...notification,
        created_at: new Date(),
      };

      // Emit real-time notification to the user
      emitNotification(updatedApplication.user_id, savedNotification);

      res.json({
        success: true,
        application: updatedApplication,
        notification: savedNotification,
      });
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  }
);

// When a new application is submitted, notify admins (this might be in financingRoutes.js)
router.post("/applications/notify-admins", authenticate, async (req, res) => {
  try {
    const { applicationId } = req.body;
    const { emitToAdmins } = req.app.locals;

    // Get application details
    const [applicationRows] = await pool.query(
      "SELECT fa.*, u.first_name, u.last_name FROM financing_applications fa JOIN users u ON fa.user_id = u.id WHERE fa.id = ?",
      [applicationId]
    );

    const application = applicationRows[0];

    // Create notification for admins
    const adminNotification = {
      message: `New application submitted: "${application.service_name}" by ${application.first_name} ${application.last_name}`,
      type: "new_application",
      is_read: false,
      application_id: application.id,
    };

    // Save notification for all admins
    const [adminUsers] = await pool.query(
      'SELECT id FROM users WHERE role = "admin"'
    );

    for (const admin of adminUsers) {
      await pool.query(
        "INSERT INTO notifications (message, type, is_read, user_id, application_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
        [
          adminNotification.message,
          adminNotification.type,
          adminNotification.is_read,
          admin.id,
          adminNotification.application_id,
        ]
      );
    }

    // Emit to all connected admins
    emitToAdmins({
      ...adminNotification,
      created_at: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error notifying admins:", error);
    res.status(500).json({ error: "Failed to notify admins" });
  }
});

export default router;
