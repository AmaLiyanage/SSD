import request from "supertest";
import mongoose from "mongoose";
import app from "../../server.js";
import User from "../../models/User.js";
import Well from "../../models/Well.js";
import MaintenanceRequest from "../../models/MaintenanceRequest.js";
import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "test-secret-key", {
    expiresIn: "30d",
  });
};

describe("Maintenance API Integration Tests", () => {
  let adminToken, fieldOfficerToken, communityUserToken;
  let admin, fieldOfficer, communityUser;
  let testWell;
  let maintenanceRequest;

  beforeAll(async () => {
    // Wait for db connection to be ready if needed, though server.js awaits connectDB()
    if(mongoose.connection.readyState !== 1) {
      await mongoose.connection.asPromise();
    }
    
    // Clear the database
    await User.deleteMany({});
    await Well.deleteMany({});
    await MaintenanceRequest.deleteMany({});

    // Create test users
    admin = await User.create({ username: "testadmin", password: "password", role: "admin" });
    fieldOfficer = await User.create({ username: "testofficer", password: "password", role: "field_officer" });
    communityUser = await User.create({ username: "testuser", password: "password", role: "communityUser" });

    // Generate tokens
    adminToken = generateToken(admin._id, admin.role);
    fieldOfficerToken = generateToken(fieldOfficer._id, fieldOfficer.role);
    communityUserToken = generateToken(communityUser._id, communityUser.role);

    // Create test well
    testWell = await Well.create({
      wellId: "W999",
      name: "Test Well",
      village: "Test Village",
      depth: 45,
      type: "Tube Well",
      location: {
        type: "Point",
        coordinates: [10, 10]
      },
      status: "Active"
    });
  });

  afterAll(async () => {
    // Cleanup database and close connection
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  describe("POST /api/maintenance", () => {
    it("should allow communityUser to create a maintenance request", async () => {
      const res = await request(app)
        .post("/api/maintenance")
        .set("Authorization", `Bearer ${communityUserToken}`)
        .send({
          wellId: testWell._id,
          issueType: "PumpDamage",
          description: "Water runs dirty",
          priority: "High",
          requestedBy: communityUser._id
        });

      if (res.status !== 201) console.log("Create failed:", res.body);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("wellId", testWell._id.toString());
      
      // Store the request to use in subsequent tests
      maintenanceRequest = res.body;
    });

    it("should reject creation if request data is invalid", async () => {
      const res = await request(app)
        .post("/api/maintenance")
        .set("Authorization", `Bearer ${communityUserToken}`)
        .send({
          wellId: testWell._id,
          // Missing issueType and description
        });

      expect(res.status).toBe(400); // Bad Request (from validation middleware)
    });
  });

  describe("GET /api/maintenance", () => {
    it("should get all maintenance requests", async () => {
      const res = await request(app)
        .get("/api/maintenance")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("PATCH /api/maintenance/:id/assign", () => {
    it("should allow admin to assign a request", async () => {
      const res = await request(app)
        .patch(`/api/maintenance/${maintenanceRequest._id}/assign`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ assignedTo: fieldOfficer._id });

      expect(res.status).toBe(200);
      expect(res.body.assignedTo._id.toString()).toBe(fieldOfficer._id.toString());
      expect(res.body.status).toBe("InProgress");
    });
  });

  describe("PATCH /api/maintenance/:id/status", () => {
    it("should allow fieldOfficer to update status to Completed", async () => {
      const res = await request(app)
        .patch(`/api/maintenance/${maintenanceRequest._id}/status`)
        .set("Authorization", `Bearer ${fieldOfficerToken}`)
        .send({ status: "Completed" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("Completed");
    });
  });

  describe("Unauthorized and Forbidden Access", () => {
    it("should return 401 Unauthorized if no token provided", async () => {
      const res = await request(app)
        .get("/api/maintenance");

      expect(res.status).toBe(401);
    });

    it("should return 403 Forbidden if user lacks required role for assign", async () => {
      // Community User attempting admin action
      const res = await request(app)
        .patch(`/api/maintenance/${maintenanceRequest._id}/assign`)
        .set("Authorization", `Bearer ${communityUserToken}`)
        .send({ assignedTo: fieldOfficer._id });

      expect(res.status).toBe(403);
    });
  });
});
