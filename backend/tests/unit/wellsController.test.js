import { jest } from "@jest/globals";
import { getAllWells } from "../../controllers/wellsController.js";
import Well from "../../models/Well.js";

describe("Wells Controller Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.restoreAllMocks();
  });

  describe("getAllWells", () => {
    it("should return 200 and a list of wells", async () => {
      const mockWells = [{ wellId: "WELL-001", name: "Test Well" }];

      jest.spyOn(Well, "find").mockResolvedValue(mockWells);

      await getAllWells(req, res);

      expect(Well.find).toHaveBeenCalledWith({ isArchived: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockWells,
      });
    });

    it("should handle database errors gracefully", async () => {
      jest.spyOn(Well, "find").mockRejectedValue(new Error("Database failed"));

      await getAllWells(req, res);

      expect(Well.find).toHaveBeenCalledWith({ isArchived: false });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database failed" });
    });


    it("should filter wells by status", async () => {
      req.query.status = "Active";

      const mockWells = [{ wellId: "WELL-003", name: "Active Well", status: "Active" }];

      jest.spyOn(Well, "find").mockResolvedValue(mockWells);

      await getAllWells(req, res);

      expect(Well.find).toHaveBeenCalledWith({
        isArchived: false,
        status: "Active",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockWells,
      });
    });

    it("should return empty array when no wells are found", async () => {
      jest.spyOn(Well, "find").mockResolvedValue([]);

      await getAllWells(req, res);

      expect(Well.find).toHaveBeenCalledWith({ isArchived: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: [],
      });
    });
  });
});