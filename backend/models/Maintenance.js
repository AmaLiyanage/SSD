import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    well: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Well",
      required: true,
    },

    maintenanceType: {
      type: String,
      enum: ["preventive", "corrective", "emergency"],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    scheduledDate: {
      type: Date,
      required: true,
    },

    completedDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    cost: {
      type: Number,
      default: 0,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Maintenance", maintenanceSchema);
