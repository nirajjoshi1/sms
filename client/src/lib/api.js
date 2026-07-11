import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const baseURL = configuredApiUrl || '/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true, // send cookies automatically
});

// Automatically attach token from localStorage as fallback removed since we are using HttpOnly cookies.

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
