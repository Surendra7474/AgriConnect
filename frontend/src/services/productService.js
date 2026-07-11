import api from './api';

export const productService = {
  listApproved: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  listMine: (params) => api.get('/products/mine', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  updateQuantity: (id, data) => api.patch(`/products/${id}/quantity`, data),
};

export const productOrderService = {
  placeOrder: (data) => api.post('/product-orders', data),
  listMyOrders: (params) => api.get('/product-orders/mine', { params }),
  listIncomingOrders: (params) => api.get('/product-orders/incoming', { params }),
  getById: (id) => api.get(`/product-orders/${id}`),
  updateStatus: (id, data) => api.patch(`/product-orders/${id}/status`, data),
};
