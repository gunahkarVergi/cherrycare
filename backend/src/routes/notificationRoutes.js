import express from "express";
import { fetchNotifications, readNotification, markAllRead, deleteNotification } from "../controllers/notificationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, fetchNotifications);
router.patch("/:id/read", authenticate, readNotification);
router.patch("/mark-all-read", authenticate, markAllRead);
router.delete("/:id", authenticate, deleteNotification);

export default router;
