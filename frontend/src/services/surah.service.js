import API from "@/config/apiClient.js";

export const getSurahs = () => API.get(`/surahs`);
