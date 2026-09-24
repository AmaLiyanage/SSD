import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/wellReportRoutes.js";
import wellsRoutes from "./routes/wellsRoutes.js";
import waterQualityRoutes from "./routes/waterQualityRoutes.js";
import maintenanceRequestRoutes from "./routes/maintenanceRequestRoutes.js";

const app = express();

// Connect database
await connectDB();

// CORS for local Vite frontend
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(
  cookieParser(process.env.COOKIE_SECRET)
);
// Routes
app.use("/api/wells", wellsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/water-quality", waterQualityRoutes);
app.use("/api/maintenance", maintenanceRequestRoutes);

// Static files
app.use("/uploads", express.static("uploads"));

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;