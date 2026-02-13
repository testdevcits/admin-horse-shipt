import axios from "axios";

const API = axios.create({
  baseURL: "https://horse-shipt.vercel.app/api",
  withCredentials: true, // important if backend uses cookies/sessions
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
