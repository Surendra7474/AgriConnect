import api from './api';

export const feedbackService = {
  submit: (data) => api.post('/feedback', data),
  listMine: (params) => api.get('/feedback/my', { params }),
};
