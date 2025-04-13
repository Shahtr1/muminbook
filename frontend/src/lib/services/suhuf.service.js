import API from "@/config/apiClient.js";

export const createSuhuf = (data) => API.post("/suhuf", data);
export const getSuhuf = (id) => API.get(`/suhuf/${id}`);
