import express from "express";
import { submitApplication, getMyApplications, getAllApplications, updateApplicationStatus } from "../controllers/financingController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /financing/submit → submit a new application
router.post("/submit", authenticate, submitApplication);

// GET /financing/my → get current user applications
router.get("/my", authenticate, getMyApplications);

// GET /financing-applications/applications → list all applications
router.get("/applications", authenticate, authorize("admin"), getAllApplications);

// PATCH /financing-applications/application/:id → approve/reject an application
router.patch("/application/:id", authenticate, authorize("admin"), updateApplicationStatus);

export default router;
