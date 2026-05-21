import api from './axios';

export const createServiceOrder = async (serviceId) => {
  const response = await api.post('/api/service-orders', {
    service_id: serviceId,
  });
  return response.data;
};

export const createServiceCheckoutSession = async (serviceId, extra = {}) => {
  const response = await api.post('/api/service-orders/create-checkout-session', {
    service_id: serviceId,
    ...extra,
  });
  return response.data;
};

export const getMyServiceOrders = async (params = {}) => {
  const response = await api.get('/api/service-orders/my-orders', { params });
  return response.data;
};

export const getServiceOrderById = async (id) => {
  const response = await api.get(`/api/service-orders/${id}`);
  return response.data;
};

export const updateServiceOrderStatus = async (id, status) => {
  const response = await api.patch(`/api/service-orders/${id}/status`, { status });
  return response.data;
};

export const getOrderMessages = async (orderId) => {
  const response = await api.get(`/api/service-orders/${orderId}/messages`);
  return response.data;
};

export const sendOrderMessage = async (orderId, message) => {
  const response = await api.post(`/api/service-orders/${orderId}/messages`, { message });
  return response.data;
};

export const getOrderFiles = async (orderId) => {
  const response = await api.get(`/api/service-orders/${orderId}/files`);
  return response.data;
};

export const uploadOrderFile = async (orderId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/api/service-orders/${orderId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const downloadOrderFile = async (orderId, fileId) => {
  const response = await api.get(`/api/service-orders/${orderId}/files/${fileId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};
