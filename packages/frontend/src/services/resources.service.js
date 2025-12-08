import API from "../config/apiClient.js";

export const getResources = (path = "my-files") =>
  API.get(`/resources?path=${path}`);
export const isMyFilesEmpty = () => API.get("/resources/is-my-files-empty");
export const isTrashEmpty = () => API.get("/resources/is-trash-empty");
export const getTrash = () => API.get("/resources/trash");
export const createResource = (data) => API.post("/resources", data);
export const renameResource = (data) =>
  API.patch(`/resources/${data.id}/rename`, data);
export const copyResource = (data) =>
  API.post(`/resources/${data.id}/copy`, data);
export const moveResource = (data) =>
  API.patch(`/resources/${data.id}/move`, data);
export const moveToTrash = (id) => API.patch(`/resources/${id}/trash`);
export const emptyTrash = () => API.delete(`/resources/trash`);
export const restoreAllFromTrash = () => API.patch(`/resources/restore`);
export const restoreFromTrash = (id) => API.patch(`/resources/${id}/restore`);
export const deleteResource = (id) => API.delete(`/resources/${id}`);
export const getOverview = () => API.get(`/resources/overview`);
export const updateAccess = (id) => API.patch(`/resources/${id}/access`);
export const togglePin = (id) => API.patch(`/resources/${id}/toggle-pin`);
