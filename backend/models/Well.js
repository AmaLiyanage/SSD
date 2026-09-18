import mongoose from "mongoose";



const wellSchema = new mongoose.Schema(
  {
    wellId: { 
      type: String, 
      unique: true,
      trim: true,
      uppercase: true, // prevents case duplicates
       },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    village: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    depth: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["Tube Well", "Open Well", "Bore Well"],
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Dry", "Maintenance"],
      default: "Active",
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Required for geo search later
wellSchema.index({ location: "2dsphere" });


export default mongoose.model("Well", wellSchema);
