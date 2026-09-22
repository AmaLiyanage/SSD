import express from "express";
import { signup, login, getUsers } from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  googleLogin,
  googleCallback
} from "../controllers/googleAuthController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// Listing every user account is admin-only - a communityUser has no business
// enumerating staff accounts.
router.get("/", protect, authorizeRoles("admin"), getUsers);

// Granting a privileged role is an admin-only operation.
router.patch("/users/:id/role", protect, authorizeRoles("admin"));

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

export default router;
