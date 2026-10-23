import api from './api';

export const prescriptionService = {
  getAllPrescriptions: async (params = {}) => {
    return await api.get('/prescriptions', { params });
  },

  getPrescriptionById: async (id) => {
    return await api.get(`/prescriptions/${id}`);
  },

  createPrescription: async (data) => {
    return await api.post('/prescriptions', data);
  },

  updatePrescription: async (id, data) => {
    return await api.put(`/prescriptions/${id}`, data);
  },

  deletePrescription: async (id) => {
    return await api.delete(`/prescriptions/${id}`);
  },
};

export default prescriptionService;
