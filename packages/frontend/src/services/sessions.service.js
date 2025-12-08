import API from "../config/apiClient.js";

export const getSessions = () => API.get("/admin/sessions");
export const deleteSession = (id) => API.delete(`/admin/sessions/${id}`);
