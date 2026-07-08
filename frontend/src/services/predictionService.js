import api from './api';

export const predictionService = {
  predict: (data) => api.post('/predictions', data),
  history: (params) => api.get('/predictions/history', { params }),
};
