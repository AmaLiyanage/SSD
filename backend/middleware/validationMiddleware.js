import { body, validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateCreateMaintenanceRequest = [
  body("wellId")
    .notEmpty()
    .withMessage("wellId is required")
    .isMongoId()
    .withMessage("Invalid wellId format"),
  body("issueType")
    .notEmpty()
    .withMessage("Issue type is required")
    .isIn(["PumpDamage", "Contamination", "DryWell"])
    .withMessage("Invalid issue type"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High"),
  handleValidationErrors,
];

export const validateUpdateMaintenanceRequest = [
  body("issueType")
    .optional()
    .isIn(["PumpDamage", "Contamination", "DryWell"])
    .withMessage("Invalid issue type"),
  body("description")
    .optional()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High"),
  body("status")
    .optional()
    .isIn(["Pending", "InProgress", "Completed"])
    .withMessage("Invalid status"),
  handleValidationErrors,
];

export const validateUpdateStatus = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["Pending", "InProgress", "Completed"])
    .withMessage("Invalid status"),
  handleValidationErrors,
];
