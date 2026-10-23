import api from './api';

export const billingService = {
  getAllBills: async (params = {}) => {
    return await api.get('/billing', { params });
  },

  getBillById: async (id) => {
    return await api.get(`/billing/${id}`);
  },

  createBill: async (data) => {
    return await api.post('/billing', data);
  },

  payBill: async (id, paymentData) => {
    return await api.post(`/billing/${id}/pay`, paymentData);
  },

  getBillingStats: async () => {
    return await api.get('/billing/stats');
  },

  deleteBill: async (id) => {
    return await api.delete(`/billing/${id}`);
  },
};

export default billingService;
