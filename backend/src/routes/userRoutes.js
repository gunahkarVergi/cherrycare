import express from "express";
import { signup, login, logout, updateMe, deleteMe } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authenticate, logout);

router.get("/me", authenticate, (req, res) => {
  res.json({ message: "Profile data", user: req.user });
});

router.patch("/me", authenticate, updateMe);

router.delete("/me", authenticate, deleteMe);

export default router;
