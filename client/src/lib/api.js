import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const baseURL = configuredApiUrl || '/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true, // send cookies automatically
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Automatically attach token from localStorage as fallback removed since we are using HttpOnly cookies.

// Notify the auth provider when an established session expires. Authentication
// endpoints manage their own 401 responses and must not trigger hard redirects.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/me');
      if (!isAuthRequest) {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
