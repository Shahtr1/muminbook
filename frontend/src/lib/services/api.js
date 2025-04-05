import API from "../../config/apiClient.js";

const simulateNetworkDelay = async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
};

// auth api
export const login = async (data) => API.post("/auth/login", data);
export const logout = async () => API.get("/auth/logout");
export const register = async (data) => API.post("/auth/register", data);
export const verifyEmail = async (verificationCode) =>
  API.get(`/auth/email/verify/${verificationCode}`);
export const reverifyEmail = async (email) =>
  API.post("/auth/email/reverify", { email });
export const sendPasswordResetEmail = async (email) =>
  API.post("/auth/password/forgot", { email });
export const resetPassword = async ({ verificationCode, password }) =>
  API.post("/auth/password/reset", { verificationCode, password });

export const getUser = async () => API.get("/user");
export const getFamilyTree = async () => API.get("/family-tree");

// sessions api
export const getSessions = async () => API.get("/admin/sessions");
export const deleteSession = async (id) => API.delete(`/admin/sessions/${id}`);

// resources api
export const getResources = async (path = "my-files") =>
  API.get(`/resources?path=${path}`);
export const isMyFilesEmpty = async () =>
  API.get("/resources/is-my-files-empty");
export const isTrashEmpty = async () => API.get("/resources/is-trash-empty");
export const getTrash = async () => API.get("/resources/trash");
export const createResource = async (data) => API.post("/resources", data);
export const renameResource = async (data) =>
  API.patch(`/resources/${data.id}/rename`, data);
export const copyResource = async (data) =>
  API.post(`/resources/${data.id}/copy`, data);
export const moveResource = async (data) =>
  API.patch(`/resources/${data.id}/move`, data);
export const moveToTrash = async (id) => API.patch(`/resources/${id}/trash`);
export const emptyTrash = async () => API.delete(`/resources/trash`);
export const restoreAllFromTrash = async () => API.patch(`/resources/restore`);
export const restoreFromTrash = async (id) =>
  API.patch(`/resources/${id}/restore`);
export const deleteResource = async (id) => API.delete(`/resources/${id}`);
