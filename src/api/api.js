import axios from "axios";

const BASE_URL = "https://web-blocker.onrender.com/"; // update to your backend

export const api = axios.create({
  baseURL: BASE_URL,
});

// Auth helpers
export const login = (data) => api.post("/login", data);
export const register = (data) => api.post("/register", data);

// Users
export const getUsers = () => api.get("/users");
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Block sites
export const blockSite = (site) => api.post("/block-site", { site });

// Logs & stats
export const getLogs = (limit = 50) => api.get(`/logs?limit=${limit}`);
export const getStats = () => api.get("/logs/stats");
