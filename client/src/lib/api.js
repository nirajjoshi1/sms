import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const baseURL = configuredApiUrl || '/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true, // send cookies automatically
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    // Show global loader for mutations
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      window.dispatchEvent(new Event('mutation:start'));
    }
    return config;
  },
  (error) => {
    window.dispatchEvent(new Event('mutation:end'));
    return Promise.reject(error);
  }
);

// Notify the auth provider when an established session expires. Authentication
// endpoints manage their own 401 responses and must not trigger hard redirects.
api.interceptors.response.use(
  (response) => {
    if (['post', 'put', 'patch', 'delete'].includes(response.config?.method?.toLowerCase())) {
      window.dispatchEvent(new Event('mutation:end'));
    }
    return response;
  },
  (error) => {
    if (['post', 'put', 'patch', 'delete'].includes(error.config?.method?.toLowerCase())) {
      window.dispatchEvent(new Event('mutation:end'));
    }
    
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
