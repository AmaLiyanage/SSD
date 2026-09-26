import api from "../api/axios";

// Get all reports
export const getReports = async () => {
  const response = await api.get("/reports");

  return response.data;
};