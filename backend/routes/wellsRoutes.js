import express from "express";
import {
  createWell,
  getAllWells,
  getWellById,
  getWellByWellId,
  updateWell,
  updateWellStatus,
  deleteWell,
} from "../controllers/wellsController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create well (Admin only)
router.post("/", protect, authorizeRoles("admin"), createWell);

// Get all wells (Admin, Field Officer, Lab Tester, Customer)
router.get("/", protect, authorizeRoles("admin", "field_officer", "lab_tester", "customer"), getAllWells);

// Get single well by Mongodb _id
router.get("/id/:id", protect, authorizeRoles("admin", "field_officer", "lab_tester", "customer"), getWellById);

// Get Single Well by input wellId
router.get("/wellId/:wellId", protect, authorizeRoles("admin", "field_officer", "visitor"), getWellByWellId);

// Update metadata (Admin only)
router.put("/:id", protect, authorizeRoles("admin"), updateWell);

// Update status (Admin + Field Officer)
router.patch("/:id/status", protect, authorizeRoles("admin", "field_officer"), updateWellStatus);

// Delete well(Admin only)
router.delete("/:id", protect, authorizeRoles("admin"), deleteWell);




export default router;
