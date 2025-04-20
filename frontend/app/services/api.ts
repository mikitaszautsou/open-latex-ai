import axios from "axios";
import { useAuthStore } from "~/store/auth-store";

const API_BASE_URL = import.meta.env.VITE_API_URL;


export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
      if (error.response && error.response.status === 401) {
          console.error("Unauthorized access - logging out.");
          useAuthStore.getState().logout(); 
           window.location.href = '/login';
      }
      return Promise.reject(error);
  }
);