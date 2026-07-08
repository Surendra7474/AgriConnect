import api from './api';

export const equipmentService = {
  listApproved: (params) => api.get('/equipment', { params }),
  getById: (id) => api.get(`/equipment/${id}`),
  listMine: (params) => api.get('/equipment/mine', { params }),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),

  createBooking: (data) => api.post('/equipment/bookings', data),
  listMyBookings: (params) => api.get('/equipment/bookings/my', { params }),
  listOwnerBookings: (params) => api.get('/equipment/bookings/owner', { params }),
  updateBookingStatus: (bookingId, data) =>
    api.patch(`/equipment/bookings/${bookingId}/status`, data),
  getOwnerEarnings: () => api.get('/equipment/earnings/owner'),

  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
