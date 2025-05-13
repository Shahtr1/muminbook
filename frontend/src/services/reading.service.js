import API from "@/config/apiClient.js";

export const getReadings = () => API.get(`/readings`);
export const getReading = (id) => API.get(`/readings/${id}`);
