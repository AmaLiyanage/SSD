import express from "express";
import { body, param, validationResult } from "express-validator";
import upload from "../middleware/upload.js";
import {
  createReport,
  getReports,
  addComment,
  getAllComments,
  getWellComments,
  updateComment,
  deleteComment,
  getReportsByWell,
  getSingleReport,
  updateReport,
  deleteReport
} from "../controllers/wellReportController.js";

// --- MIDDLEWARE IMPORTS ---
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";


const router = express.Router();

// 1. Validation error handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 2. ROUTES

// --- GET ROUTES (Shared Access) ---
router.get("/", protect, allowRoles("admin", "field_officer", "customer", "communityUser"), getReports);
router.get("/well/:wellId", protect, allowRoles("admin", "field_officer", "customer", "communityUser"), getReportsByWell);
router.get("/comments/all", protect, allowRoles("admin", "field_officer"), getAllComments);
router.get("/comments/well/:wellId", protect, allowRoles("admin", "field_officer"), getWellComments);
router.get("/:id", protect, allowRoles("admin", "field_officer", "customer", "communityUser"), getSingleReport);

// --- POST/PUT/DELETE ROUTES (Admin & Field Officer Access) ---
router.post(
  "/",
  protect,
  allowRoles("admin", "field_officer"), 
  upload.single("photo"),
  body("wellId").notEmpty().withMessage("Well ID is required"),
  body("waterLevel").isIn(["High", "Medium", "Low"]).withMessage("Invalid water level"),
  body("pumpStatus").isIn(["Working", "Damaged", "Missing"]).withMessage("Invalid pump status"),
  body("description").isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
  validate,
  createReport
);

router.put(
  "/:id",
  protect,
  allowRoles("admin", "field_officer"), 
  upload.single("photo"),
  param("id").isMongoId().withMessage("Invalid report ID"),
  body("description").optional().isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
  validate,
  updateReport
);

router.delete("/:id", protect, authorizeRoles("field_officer"), deleteReport);

// --- COMMENT ACTIONS (Admin & Field Officer Access) ---
router.post(
  "/:id/comments",
  protect,
  allowRoles("admin", "field_officer"), 
  param("id").isMongoId().withMessage("Invalid report ID"),
  body("message").isLength({ min: 3 }).withMessage("Comment must be at least 3 characters"),
  validate,
  addComment
);

router.put(
  "/:reportId/comments/:commentId",
  protect,
  allowRoles("admin", "field_officer"), 
  param("reportId").isMongoId().withMessage("Invalid report ID"),
  param("commentId").isMongoId().withMessage("Invalid comment ID"),
  body("message").isLength({ min: 3 }).withMessage("Comment must be at least 3 characters"),
  validate,
  updateComment
);

router.delete(
  "/:reportId/comments/:commentId",
  protect,
  allowRoles("admin", "field_officer"), 
  param("reportId").isMongoId().withMessage("Invalid report ID"),
  param("commentId").isMongoId().withMessage("Invalid comment ID"),
  validate,
  deleteComment
);

export default router;