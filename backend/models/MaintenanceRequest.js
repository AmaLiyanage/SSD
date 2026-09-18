import mongoose from "mongoose";

const maintenanceRequestSchema = new mongoose.Schema(
  {
    wellId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Well",
      required: true,
    },
    issueType: {
      type: String,
      enum: ["PumpDamage", "Contamination", "DryWell"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "InProgress", "Completed"],
      default: "Pending",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },
  },
  { timestamps: true }
);

export default mongoose.model("MaintenanceRequest", maintenanceRequestSchema);
