import API from "../config/apiClient.js";

export const login = (data) => API.post("/auth/login", data);
export const logout = () => API.get("/auth/logout");
export const register = (data) => API.post("/auth/register", data);
export const verifyEmail = (code) => API.get(`/auth/email/verify/${code}`);
export const reverifyEmail = (email) =>
  API.post("/auth/email/reverify", { email });
export const sendPasswordResetEmail = (email) =>
  API.post("/auth/password/forgot", { email });
export const resetPassword = ({ verificationCode, password }) =>
  API.post("/auth/password/reset", { verificationCode, password });
