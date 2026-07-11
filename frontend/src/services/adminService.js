import api from './api';

export const adminService = {
  dashboard: () => api.get('/admin/dashboard'),
  getDashboard: () => api.get('/admin/dashboard'),
  listUsers: (params) => api.get('/admin/users', { params }),
  getUsers: (params) => api.get('/admin/users', { params }), // alias for compatibility
  updateUserStatus: (userId, data) => api.patch(`/admin/users/${userId}/status`, data),
  listEquipment: (params) => api.get('/admin/equipment', { params }),
  getEquipment: (params) => api.get('/admin/equipment', { params }), // alias for compatibility
  updateEquipmentStatus: (equipmentId, data) =>
    api.patch(`/admin/equipment/${equipmentId}/status`, data),
  listWorkers: (params) => api.get('/admin/workers', { params }),
  getWorkers: (params) => api.get('/admin/workers', { params }), // alias for compatibility
  updateWorkerStatus: (workerProfileId, data) =>
    api.patch(`/admin/workers/${workerProfileId}/status`, data),
  updateWorkerApprovalStatus: (workerProfileId, data) =>
    api.patch(`/admin/workers/${workerProfileId}/status`, { status: data.approvalStatus || data.status }), // alias for AdminWorkers.jsx
  listFeedback: (params) => api.get('/admin/feedback', { params }),
  getFeedbacks: (params) => api.get('/admin/feedback', { params }), // alias for AdminFeedback.jsx
  updateFeedback: (feedbackId, data) =>
    api.patch(`/admin/feedback/${feedbackId}`, data),
  updateFeedbackStatus: (feedbackId, data) =>
    api.patch(`/admin/feedback/${feedbackId}`, data), // alias for AdminFeedback.jsx
  listProducts: (params) => api.get('/admin/products', { params }),
  getProducts: (params) => api.get('/admin/products', { params }),
  updateProductStatus: (productId, data) => api.patch(`/admin/products/${productId}/status`, data),
  deleteEquipment: (equipmentId) => api.delete(`/equipment/${equipmentId}`),
  deleteProduct: (productId) => api.delete(`/products/${productId}`),
};
