import api from './api';

export const adminService = {
  dashboard: () => api.get('/admin/dashboard'),
  listUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, data) => api.patch(`/admin/users/${userId}/status`, data),
  listEquipment: (params) => api.get('/admin/equipment', { params }),
  updateEquipmentStatus: (equipmentId, data) =>
    api.patch(`/admin/equipment/${equipmentId}/status`, data),
  listWorkers: (params) => api.get('/admin/workers', { params }),
  updateWorkerStatus: (workerProfileId, data) =>
    api.patch(`/admin/workers/${workerProfileId}/status`, data),
  listFeedback: (params) => api.get('/admin/feedback', { params }),
  updateFeedback: (feedbackId, data) =>
    api.patch(`/admin/feedback/${feedbackId}`, data),
  listProducts: (params) => api.get('/admin/products', { params }),
  updateProductStatus: (productId, data) => api.patch(`/admin/products/${productId}/status`, data),
};
