import api from './api';

export const doctorService = {
  getAllDoctors: async (params = {}) => {
    return await api.get('/doctors', { params });
  },

  getDoctorById: async (id) => {
    return await api.get(`/doctors/${id}`);
  },

  createDoctor: async (doctorData) => {
    return await api.post('/doctors', doctorData);
  },

  updateDoctor: async (id, doctorData) => {
    return await api.put(`/doctors/${id}`, doctorData);
  },

  deleteDoctor: async (id) => {
    return await api.delete(`/doctors/${id}`);
  },
};

export default doctorService;
