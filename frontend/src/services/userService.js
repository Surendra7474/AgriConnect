import api from './api';

export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  changePassword: (data) => api.post('/users/me/change-password', data),
};
