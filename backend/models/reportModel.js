import mongoose from "mongoose";

// Comment Subdocument Schema
const commentSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  commentedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  commentedAt: {
    type: Date,
    default: Date.now,
  },
});

const reportSchema = new mongoose.Schema(
  {
    wellId: {
      type: String,        
      ref: "Well",  
      required: true,
    },

    waterLevel: {
      type: String,
      enum: ["High", "Medium", "Low"],
      required: true,
    },

    pumpStatus: {
      type: String,
      enum: ["Working", "Damaged", "Missing"],
      required: true,
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },

    description: {
      type: String,
      required: true,
      minlength: 10,
    },

    photos: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["submitted", "verified", "false", "resolved"],
      default: "submitted",
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Embedded comments
    comments: [commentSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
