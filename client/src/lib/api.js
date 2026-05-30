import axios from 'axios';

const baseURL = import.meta.env.PROD
  ? '/api/v1'
  : import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true, // send cookies automatically
});

// Automatically attach token from localStorage as fallback
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
