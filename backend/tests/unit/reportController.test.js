import { jest } from "@jest/globals";
import { createReport } from "../../controllers/wellReportController.js";
import Report from "../../models/reportModel.js";
import Well from "../../models/Well.js";

describe("Report Controller Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        wellId: "WELL-001",
        waterLevel: "High",
        pumpStatus: "Working",
        severity: "Low",
        description: "Valid description text long enough"
      },
      user: { id: "user123" },
      file: null,
      protocol: "http",
      get: jest.fn().mockReturnValue("localhost:5000") // Mocked for verification
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks(); // Clear call counts
    jest.restoreAllMocks(); // Restore original implementations
  });

  it("should return 404 if well does not exist", async () => {
    jest.spyOn(Well, "findOne").mockResolvedValue(null);

    await createReport(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Well not found" });
  });

  it("should return 400 if user already submitted a report for this well", async () => {
    jest.spyOn(Well, "findOne").mockResolvedValue({ wellId: "WELL-001" });
    jest.spyOn(Report, "findOne").mockResolvedValue({ _id: "existingReportId" });

    await createReport(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "You have already submitted a report for this well" 
    });
  });

  it("should create report and return 201 on success", async () => {
    const mockSavedReport = {
      wellId: "WELL-001",
      photos: [],
      toObject: jest.fn().mockReturnValue({ wellId: "WELL-001", photos: [] })
    };

    jest.spyOn(Well, "findOne").mockResolvedValue({ wellId: "WELL-001" });
    jest.spyOn(Report, "findOne").mockResolvedValue(null);
    jest.spyOn(Report, "create").mockResolvedValue(mockSavedReport);

    await createReport(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it("should handle server errors and return 500", async () => {
    jest.spyOn(Well, "findOne").mockRejectedValue(new Error("Server Failure"));

    await createReport(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server Failure" });
  });
});