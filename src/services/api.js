// src/services/api.js
import axios from "axios";

const API_BASE_URL = "https://web-blocker.onrender.com/";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    const response = await api.post("/login", { email, password });
    return response.data;
  },

  register: async (email, password, name) => {
    const response = await api.post("/register", { email, password, name });
    return response.data;
  },
};

export const blockService = {
  getBlockedSites: async () => {
    const response = await api.get("/blocked-sites");
    return response.data;
  },

  addBlockedSite: async (domain) => {
    const response = await api.post("/block-site", { domain });
    return response.data;
  },

  removeBlockedSite: async (domain) => {
    const response = await api.delete("/block-site", { data: { domain } });
    return response.data;
  },
};

export const logService = {
  getLogs: async () => {
    const response = await api.get("/logs");
    return response.data;
  },
};

export default api;
