import api from './api';

export const notificationService = {
  listMine: (params) => api.get('/notifications', { params }),
  markRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
