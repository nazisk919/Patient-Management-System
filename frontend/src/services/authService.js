import api from './api';

export const authService = {
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  getProfile: async () => {
    return await api.get('/auth/profile');
  },

  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, password) => {
    return await api.post(`/auth/reset-password/${token}`, { password });
  },
};

export default authService;
