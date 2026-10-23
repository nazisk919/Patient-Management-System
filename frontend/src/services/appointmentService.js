import api from './api';

export const appointmentService = {
  getAllAppointments: async (params = {}) => {
    return await api.get('/appointments', { params });
  },

  getAppointmentById: async (id) => {
    return await api.get(`/appointments/${id}`);
  },

  createAppointment: async (appointmentData) => {
    return await api.post('/appointments', appointmentData);
  },

  updateAppointment: async (id, appointmentData) => {
    return await api.put(`/appointments/${id}`, appointmentData);
  },

  deleteAppointment: async (id) => {
    return await api.delete(`/appointments/${id}`);
  },
};

export default appointmentService;
