import API from "@/config/apiClient.js";

export const createSuhuf = (data) => API.post("/suhuf", data);
export const getSuhuf = (id) => API.get(`/suhuf/${id}`);
export const renameSuhuf = (data) =>
  API.patch(`/suhuf/${data.id}/rename`, data);
export const updateSuhufLayout = (id, data) =>
  API.patch(`/suhuf/${id}/layout`, data);
