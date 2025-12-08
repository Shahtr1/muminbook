import API from "@/config/apiClient.js";

export const getReadings = () => API.get(`/readings`);
export const getReading = (id, params) =>
  API.get(`/readings/${id}`, { params });
