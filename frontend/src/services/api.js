import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('carepulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize error messages & handle 401
api.interceptors.response.use(
  (response) => response.data, // Returns backend response directly: { success, statusCode, message, data }
  (error) => {
    const status = error.response ? error.response.status : null;
    const message =
      error.response?.data?.message ||
      (typeof error.response?.data === 'string' && error.response.data.trim()
        ? error.response.data.trim()
        : null) ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    if (status === 401) {
      // Clear token if invalid or expired
      const isAuthUrl = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthUrl) {
        localStorage.removeItem('carepulse_token');
        localStorage.removeItem('carepulse_user');
        // Dispatch custom event to notify React context without hard reload
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    const customError = new Error(message);
    customError.statusCode = status;
    customError.response = error.response;
    return Promise.reject(customError);
  }
);

export default api;
