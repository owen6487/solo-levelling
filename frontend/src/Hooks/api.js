import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for authentication
});

// Request interceptor - no need to manually add token, cookies are sent automatically
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global error cases here if needed, but avoid hard redirects
        // as they can cause infinite loops when auth is checked on mount.
        return Promise.reject(error);
    }
);

export default api;