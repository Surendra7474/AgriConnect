import api from './api';

export const workerService = {
  listApproved: (params) => api.get('/workers', { params }),
  getById: (id) => api.get(`/workers/${id}`),
  getMyProfile: () => api.get('/workers/me'),
  upsertMyProfile: (data) => api.put('/workers/me', data),

  createHiring: (data) => api.post('/workers/hiring', data),
  listMyHiringRequests: (params) => api.get('/workers/hiring/worker', { params }),
  listFarmerHiringRequests: (params) => api.get('/workers/hiring/farmer', { params }),
  updateHiringStatus: (hiringId, data) =>
    api.patch(`/workers/hiring/${hiringId}/status`, data),
  getWorkerEarnings: () => api.get('/workers/earnings/me'),
};
