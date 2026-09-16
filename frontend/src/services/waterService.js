import api from "../api/axios";

export const getAllTests = () => api.get("/water-quality");
export const createTest = (data) => api.post("/water-quality", data);
export const deleteTest = (id) => api.delete(`/water-quality/${id}`);
export const updateTest = (id, data) => api.put(`/water-quality/${id}`, data);
export const getTestById = (id) => api.get(`/water-quality/${id}`);
export const getWellHistory = (wellId) => api.get(`/water-quality/well/${wellId}`);
