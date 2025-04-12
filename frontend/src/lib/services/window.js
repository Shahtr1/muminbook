import API from "@/config/apiClient.js";

export const createWindow = (data) => API.post("/windows", data);
export const deleteWindow = (id) => API.delete(`/windows/${id}`);
