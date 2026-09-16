import api from "../api/axios";

export const getWells = async () => {
  const response = await api.get("/wells");
  return response.data?.data || response.data || [];
};

export const getWaterQualityHistory = async (wellId) => {
  const response = await api.get(`/water-quality/well/${wellId}`);
  return response.data?.data || response.data || [];
};

export const addWaterQualityTest = async (payload) => {
  const response = await api.post("/water-quality", payload);
  return response.data;
};
