import MaintenanceRequest from "../models/MaintenanceRequest.js";
import Well from "../models/Well.js";
import * as weatherService from "../services/weatherService.js";

export const createRequest = async (data) => {
  const req = await MaintenanceRequest.create(data);
  return await MaintenanceRequest.findById(req._id).populate("wellId requestedBy assignedTo");
};

export const getAllRequests = async (filters = {}) => {
  return await MaintenanceRequest.find(filters)
    .populate("wellId requestedBy assignedTo")
    .sort({ createdAt: -1 });
};

export const getRequestById = async (id) => {
  return await MaintenanceRequest.findById(id).populate("wellId requestedBy assignedTo");
};

export const updateRequest = async (id, data) => {
  return await MaintenanceRequest.findByIdAndUpdate(id, data, { new: true })
    .populate("wellId requestedBy assignedTo");
};

export const deleteRequest = async (id) => {
  return await MaintenanceRequest.findByIdAndDelete(id);
};

export const assignRequest = async (id, assignedTo) => {
  return await MaintenanceRequest.findByIdAndUpdate(
    id,
    { assignedTo, status: "InProgress" },
    { new: true }
  ).populate("wellId requestedBy assignedTo");
};

export const updateStatus = async (id, status) => {
  const request = await MaintenanceRequest.findById(id);
  if (!request) return null;

  const validTransitions = {
    Pending: ["InProgress", "Completed"],
    InProgress: ["Completed", "Pending"],
    Completed: []
  };

  if (!validTransitions[request.status].includes(status)) {
    throw new Error(`Invalid status transition from ${request.status} to ${status}`);
  }

  request.status = status;
  await request.save();
  return MaintenanceRequest.findById(id).populate("wellId requestedBy assignedTo");
};

export const checkWeatherRisk = async (wellId, userId) => {
  const well = await Well.findById(wellId);
  if (!well) throw new Error("Well not found");

  const lat = well.location?.coordinates ? well.location.coordinates[1] : well.location?.lat;
  const lng = well.location?.coordinates ? well.location.coordinates[0] : well.location?.lng;
  if (lat === undefined || lng === undefined) throw new Error("Well has no coordinates");

  const weatherData = await weatherService.checkRainfall(lat, lng);

  const riskLevel = weatherData.heavyRainfall ? "High" : weatherData.precipitation > 2 ? "Medium" : "Low";
  const recommendation = weatherData.heavyRainfall
    ? `Heavy rainfall detected (${weatherData.precipitation}mm). High risk of contamination and runoff into well.`
    : weatherData.precipitation > 2
    ? `Moderate rainfall detected (${weatherData.precipitation}mm). Routine monitoring recommended.`
    : "Weather conditions are optimal with minimal contamination risk.";

  let requestCreated = null;
  if (weatherData.heavyRainfall) {
    // Check if an unresolved automated alert or contamination request already exists for this well
    const existing = await MaintenanceRequest.findOne({
      wellId: well._id,
      issueType: "Contamination",
      status: { $in: ["Pending", "InProgress"] }
    }).populate("wellId requestedBy assignedTo");

    if (existing) {
      requestCreated = existing;
    } else {
      const newRequest = await MaintenanceRequest.create({
        wellId: well._id,
        issueType: "Contamination",
        description: `Automated Alert: Heavy rainfall detected (${weatherData.precipitation}mm). High risk of contamination.`,
        priority: "High",
        status: "Pending",
        requestedBy: userId
      });
      requestCreated = await MaintenanceRequest.findById(newRequest._id).populate("wellId requestedBy assignedTo");
    }
  }

  return {
    riskDetected: weatherData.heavyRainfall,
    riskLevel,
    recommendation,
    weather: {
      temp: weatherData.temp ?? 28,
      humidity: weatherData.humidity ?? 65,
      windSpeed: weatherData.windSpeed ?? 12,
      precipitation: weatherData.precipitation ?? 0
    },
    weatherData,
    requestCreated
  };
};