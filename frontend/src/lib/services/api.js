import API from "../../config/apiClient.js";
import { familyTreeApi } from "@/data/familyTreeApi.js";

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
export const getFamilyTree = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(familyTreeApi);
    }, 1000);
  });
};

export const getSessions = async () => API.get("/admin/sessions");
export const deleteSession = async (id) => API.delete(`/admin/sessions/${id}`);
