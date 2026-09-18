import express from "express";
import { signup, login, getUsers } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/", protect, getUsers);

export default router;
