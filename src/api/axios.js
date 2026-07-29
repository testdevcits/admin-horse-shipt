import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || API_BASE_URL,
  withCredentials: true,
});

// Attach admin token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
