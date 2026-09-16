import express from "express";
import { signup, login, getUsers } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  googleLogin,
  googleCallback
} from "../controllers/googleAuthController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/", protect, getUsers);
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
export default router;
