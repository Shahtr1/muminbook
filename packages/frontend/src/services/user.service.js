import API from "../config/apiClient.js";

export const getUser = () => API.get("/user");
export const getFamilyTree = () => API.get("/family-tree");
