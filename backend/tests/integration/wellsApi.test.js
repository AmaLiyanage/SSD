import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { jest } from "@jest/globals";

let app;
let mongoServer;
let Well;

jest.setTimeout(30000);

beforeAll(async () => {
  jest.unstable_mockModule("../../middleware/authMiddleware.js", () => ({
    protect: (req, res, next) => {
      req.user = { id: "admin123", role: "admin" };
      next();
    },
    authorizeRoles: (...roles) => (req, res, next) => next(),
  }));

  const wellsRoutesModule = await import("../../routes/wellsRoutes.js");
  const wellModelModule = await import("../../models/Well.js");

  const wellsRoutes = wellsRoutesModule.default;
  Well = wellModelModule.default;

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    dbName: "testdb",
  });

  app = express();
  app.use(express.json());
  app.use("/api/wells", wellsRoutes);
});

afterEach(async () => {
  if (Well) {
    await Well.deleteMany({});
  }
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }

    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error("Test cleanup error:", error);
  }
});

describe("Wells API Integration Tests", () => {
  it("POST /api/wells should create a new well in the database", async () => {
    const newWell = {
      wellId: "WELL-005",
      name: "Integration Well",
      village: "Test Village",
      lat: 6.9271,
      lng: 79.8612,
      depth: 30,
      type: "Tube Well",
    };

    const res = await request(app).post("/api/wells").send(newWell);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.wellId).toBe("WELL-005");

    const dbWell = await Well.findOne({ wellId: "WELL-005" });
    expect(dbWell).not.toBeNull();
    expect(dbWell.depth).toBe(30);
  });

  it("GET /api/wells should retrieve wells", async () => {
    await Well.create({
      wellId: "WELL-100",
      name: "Existing Well",
      village: "Kandy",
      depth: 50,
      type: "Open Well",
      status: "Active",
      location: {
        type: "Point",
        coordinates: [80.636, 7.29],
      },
    });

    const res = await request(app).get("/api/wells");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].wellId).toBe("WELL-100");
  });

  it("POST /api/wells should fail when required fields are missing", async () => {
    const invalidWell = {
      wellId: "WELL-006",
      name: "Incomplete Well",
    };

    const res = await request(app).post("/api/wells").send(invalidWell);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });

  it("POST /api/wells should reject duplicate wellId", async () => {
    const wellData = {
      wellId: "WELL-010",
      name: "Duplicate Well",
      village: "Colombo",
      lat: 6.9,
      lng: 79.8,
      depth: 25,
      type: "Tube Well",
    };

    await request(app).post("/api/wells").send(wellData);
    const res = await request(app).post("/api/wells").send(wellData);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Well ID already exists");
  });

  it("GET /api/wells should filter wells by village", async () => {
    await Well.create({
      wellId: "WELL-200",
      name: "Colombo Well",
      village: "Colombo",
      depth: 40,
      type: "Tube Well",
      status: "Active",
      location: {
        type: "Point",
        coordinates: [79.8612, 6.9271],
      },
    });

    await Well.create({
      wellId: "WELL-201",
      name: "Kandy Well",
      village: "Kandy",
      depth: 35,
      type: "Open Well",
      status: "Active",
      location: {
        type: "Point",
        coordinates: [80.6337, 7.2906],
      },
    });

    const res = await request(app).get("/api/wells?village=Colombo");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].village).toBe("Colombo");
    expect(res.body.data[0].wellId).toBe("WELL-200");
  });

  it("GET /api/wells/id/:id should return a single well by MongoDB id", async () => {
    const well = await Well.create({
      wellId: "WELL-300",
      name: "Single Well",
      village: "Galle",
      depth: 45,
      type: "Bore Well",
      status: "Maintenance",
      location: {
        type: "Point",
        coordinates: [80.217, 6.0329],
      },
    });

    const res = await request(app).get(`/api/wells/id/${well._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.wellId).toBe("WELL-300");
    expect(res.body.data.name).toBe("Single Well");
  });
});