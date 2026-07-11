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
    // Only redirect if it's a 401 and the request wasn't the initial /auth/me check
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      const isAuthMe = error.config?.url?.includes('/auth/me');
      const isAlreadyOnLogin = window.location.pathname === '/login';
      
      // If we aren't already on the login page, and it wasn't just a background session check, redirect
      if (!isAuthMe && !isAlreadyOnLogin) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
