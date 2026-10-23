import api from './api';

export const dashboardService = {
  getDashboardStats: async () => {
    return await api.get('/dashboard/stats');
  },
};

export default dashboardService;
