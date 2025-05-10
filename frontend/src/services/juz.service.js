import API from "@/config/apiClient.js";

export const getJuz = () => API.get(`/juz`);
