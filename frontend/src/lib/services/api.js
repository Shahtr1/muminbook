import API from "../../config/apiClient.js";

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

export const getSessions = async () => API.get("/admin/sessions");
export const deleteSession = async (id) => API.delete(`/admin/sessions/${id}`);

export const getResources = async (path = "my-files") =>
  API.get(`/resources?path=${encodeURIComponent(path)}`);

export const isMyFilesEmpty = async () =>
  API.get("/resources/is-my-files-empty");
