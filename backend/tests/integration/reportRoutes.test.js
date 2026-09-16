import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { jest } from "@jest/globals";

// --- 1. ES MODULE MOCKS (Must stay at the top) ---
jest.unstable_mockModule("../../middleware/authMiddleware.js", () => ({
  protect: (req, res, next) => {
    // Uses global.currentTestUser if set, otherwise a default admin
    req.user = global.currentTestUser || { id: new mongoose.Types.ObjectId(), role: "admin" };
    next();
  },
}));

jest.unstable_mockModule("../../middleware/roleMiddleware.js", () => ({
  allowRoles: () => (req, res, next) => next(),
}));

// --- 2. DYNAMIC IMPORTS ---
const User = (await import("../../models/User.js")).default;
const Report = (await import("../../models/reportModel.js")).default;
const Well = (await import("../../models/Well.js")).default;
const reportRoutes = (await import("../../routes/wellReportRoutes.js")).default;

let app;
let mongoServer;

// --- 3. TEST HELPERS (Factories) ---

/**
 * Creates a valid Well in the test DB
 */
const createTestWell = async (overrides = {}) => {
  return await Well.create({
    wellId: "WELL-" + Math.floor(Math.random() * 1000), // Random ID to avoid unique collisions
    name: "Test Well Location",
    type: "Bore Well",
    depth: 50,
    location: { type: "Point", coordinates: [34.0, -1.0] },
    village: "Village A",
    ...overrides,
  });
};

/**
 * Creates a valid User in the test DB
 */
const createTestUser = async (overrides = {}) => {
  return await User.create({
    username: "User-" + Math.floor(Math.random() * 1000),
    password: "password123",
    role: "admin",
    ...overrides,
  });
};

/**
 * Creates a valid Report in the test DB
 */
const createTestReport = async (wellId, userId, overrides = {}) => {
  return await Report.create({
    wellId: wellId,
    reportedBy: userId,
    waterLevel: "High",
    pumpStatus: "Working",
    severity: "Low",
    description: "This is a standard test report description.",
    ...overrides,
  });
};

// --- 4. SETUP & TEARDOWN ---

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use("/api/reports", reportRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Report.deleteMany({});
  await Well.deleteMany({});
  await User.deleteMany({});
  global.currentTestUser = null; 
});

// --- 5. THE TESTS ---

describe("Report API Integration Tests", () => {
  
  it("POST /api/reports should create a report successfully", async () => {
    // Setup data using helpers
    const well = await createTestWell({ wellId: "WELL-001" });
    const user = await createTestUser();
    global.currentTestUser = { id: user._id, role: "admin" };

    const res = await request(app)
      .post("/api/reports")
      .send({
        wellId: "WELL-001",
        waterLevel: "Medium",
        pumpStatus: "Working",
        description: "The well is functioning but water is slightly low."
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.wellId).toBe("WELL-001");
    expect(res.body.reportedBy).toBe(user._id.toString());
  });

  it("GET /api/reports should return all reports with populated usernames", async () => {
    const well = await createTestWell();
    const user = await createTestUser({ username: "john_doe" });
    await createTestReport(well.wellId, user._id);

    const res = await request(app).get("/api/reports");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].reportedBy.username).toBe("john_doe");
  });

  it("DELETE /api/reports/:id should remove a report", async () => {
    const well = await createTestWell();
    const user = await createTestUser();
    const report = await createTestReport(well.wellId, user._id);
    
    global.currentTestUser = { id: user._id, role: "admin" };

    const res = await request(app).delete(`/api/reports/${report._id}`);

    expect(res.statusCode).toBe(200);
    const deletedReport = await Report.findById(report._id);
    expect(deletedReport).toBeNull();
  });

  it("POST /api/reports/:id/comments should add a comment to a report", async () => {
    const well = await createTestWell();
    const user = await createTestUser();
    const report = await createTestReport(well.wellId, user._id);
    
    global.currentTestUser = { id: user._id, role: "field_officer" };

    const res = await request(app)
      .post(`/api/reports/${report._id}/comments`)
      .send({ message: "Inspected the site, looks okay." });

    expect(res.statusCode).toBe(201);
    expect(res.body.report.comments.length).toBe(1);
    expect(res.body.report.comments[0].message).toBe("Inspected the site, looks okay.");
  });

});