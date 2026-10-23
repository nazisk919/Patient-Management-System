import api from './api';

export const medicalRecordService = {
  getAllMedicalRecords: async (params = {}) => {
    return await api.get('/medical-records', { params });
  },

  getMedicalRecordById: async (id) => {
    return await api.get(`/medical-records/${id}`);
  },

  createMedicalRecord: async (data) => {
    return await api.post('/medical-records', data);
  },

  updateMedicalRecord: async (id, data) => {
    return await api.put(`/medical-records/${id}`, data);
  },

  deleteMedicalRecord: async (id) => {
    return await api.delete(`/medical-records/${id}`);
  },
};

export default medicalRecordService;
