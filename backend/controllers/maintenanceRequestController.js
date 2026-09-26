import * as maintenanceService from "../services/maintenanceRequestService.js";

// POST /api/maintenance
export const create = async (req, res) => {
  try {
    const { wellId, issueType, description, priority } = req.body;
    // Prevent Mass Assignment (CWE-915): explicitly construct payload with forced default status
    const data = {
      wellId,
      issueType,
      description,
      priority: priority || "Medium",
      status: "Pending",
      requestedBy: req.user._id,
    };
    const request = await maintenanceService.createRequest(data);
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/maintenance
export const getAll = async (req, res) => {
  try {
    const user = req.user;
    const filters = {};

    // 1. Enforce Server-Side Authorization (BOLA / IDOR Mitigation - CWE-639)
    // Non-privileged users (communityUser / customer) can only access their own requests
    if (user.role !== "admin" && user.role !== "field_officer") {
      filters.requestedBy = user._id;
    } else if (req.query.requestedBy && typeof req.query.requestedBy === "string" && /^[0-9a-fA-F]{24}$/.test(req.query.requestedBy)) {
      filters.requestedBy = req.query.requestedBy;
    }

    // 2. Strict Whitelisting & Type-Checking against NoSQL Query Injection (CWE-943)
    if (typeof req.query.status === "string" && ["Pending", "InProgress", "Completed"].includes(req.query.status)) {
      filters.status = req.query.status;
    }
    if (typeof req.query.issueType === "string" && ["PumpDamage", "Contamination", "DryWell"].includes(req.query.issueType)) {
      filters.issueType = req.query.issueType;
    }
    if (typeof req.query.priority === "string" && ["Low", "Medium", "High"].includes(req.query.priority)) {
      filters.priority = req.query.priority;
    }
    if (typeof req.query.wellId === "string" && /^[0-9a-fA-F]{24}$/.test(req.query.wellId)) {
      filters.wellId = req.query.wellId;
    }

    const requests = await maintenanceService.getAllRequests(filters);
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

    // Object-level authorization check (BOLA mitigation):
    const requesterId = request.requestedBy?._id?.toString() || request.requestedBy?.toString();
    const isOwner = requesterId === req.user._id.toString();
    const isStaff = req.user.role === "admin" || req.user.role === "field_officer";

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "Access denied: Unauthorized access to this maintenance request" });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/maintenance/:id
export const update = async (req, res) => {
  try {
    const { issueType, description, priority, status } = req.body;
    const updateData = {};
    if (issueType) updateData.issueType = issueType;
    if (description) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;

    const request = await maintenanceService.updateRequest(req.params.id, updateData);
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

