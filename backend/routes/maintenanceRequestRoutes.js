import express from "express";
import {
  create,
  getAll,
  getById,
  update,
  deleteReq,
  assign,
  updateStatus,
  getWeatherRisk,
} from "../controllers/maintenanceRequestController.js";
import {
  validateCreateMaintenanceRequest,
  validateUpdateMaintenanceRequest,
  validateUpdateStatus,
} from "../middleware/validationMiddleware.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.post("/", validateCreateMaintenanceRequest, create);
router.get("/weather-risk/:wellId", authorizeRoles("admin", "field_officer"), getWeatherRisk);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", authorizeRoles("field_officer", "admin"), validateUpdateMaintenanceRequest, update);
router.patch("/:id/assign", authorizeRoles("admin"), assign);
router.patch("/:id/status", authorizeRoles("field_officer", "admin"), validateUpdateStatus, updateStatus);
router.delete("/:id", authorizeRoles("admin", "field_officer"), deleteReq);

export default router;
