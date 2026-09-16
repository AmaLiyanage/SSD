import * as maintenanceService from "../services/maintenanceRequestService.js";

// POST /api/maintenance
export const create = async (req, res) => {
  try {
    const data = { ...req.body, requestedBy: req.user._id };
    const request = await maintenanceService.createRequest(data);
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/maintenance
export const getAll = async (req, res) => {
  try {
    const requests = await maintenanceService.getAllRequests(req.query);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/maintenance/:id
export const getById = async (req, res) => {
  try {
    const request = await maintenanceService.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ message: "Maintenance Request not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/maintenance/:id
export const update = async (req, res) => {
  try {
    const request = await maintenanceService.updateRequest(req.params.id, req.body);
    if (!request) return res.status(404).json({ message: "Maintenance Request not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/maintenance/:id
export const deleteReq = async (req, res) => {
  try {
    const request = await maintenanceService.deleteRequest(req.params.id);
    if (!request) return res.status(404).json({ message: "Maintenance Request not found" });
    res.json({ message: "Maintenance Request deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/maintenance/:id/assign
export const assign = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    if (!assignedTo) {
      return res.status(400).json({ message: "assignedTo is required" });
    }
    const request = await maintenanceService.assignRequest(req.params.id, assignedTo);
    if (!request) return res.status(404).json({ message: "Maintenance Request not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/maintenance/:id/status
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await maintenanceService.updateStatus(req.params.id, status);
    if (!request) return res.status(404).json({ message: "Maintenance Request not found" });
    res.json(request);
  } catch (err) {
    if (err.message.startsWith("Invalid status transition")) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

// GET /api/maintenance/weather-risk/:wellId
export const getWeatherRisk = async (req, res) => {
  try {
    const { wellId } = req.params;
    const result = await maintenanceService.checkWeatherRisk(wellId, req.user._id);
    res.json(result);
  } catch (err) {
    if (err.message === "Well not found" || err.message === "Well has no coordinates") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

