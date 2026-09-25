import api from "../api/axios";

const normalizeTest = (test) => ({
	...test,
	_id: test._id || test.id,
});

const normalizeResponse = (response) => ({
	...response,
	data: Array.isArray(response.data)
		? response.data.map(normalizeTest)
		: normalizeTest(response.data),
});

export const getAllTests = async () => normalizeResponse(await api.get("/water-quality"));
export const createTest = async (data) => normalizeResponse(await api.post("/water-quality", data));
export const deleteTest = (id) => api.delete(`/water-quality/${id}`);
export const updateTest = async (id, data) => normalizeResponse(await api.put(`/water-quality/${id}`, data));
export const getTestById = async (id) => normalizeResponse(await api.get(`/water-quality/${id}`));
export const getWellHistory = (wellId) => api.get(`/water-quality/well/${wellId}`);
