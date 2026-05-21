import api from './axios';

export const getServices = async (params) => {
  const response = await api.get('/api/services', { params });
  return response.data;
};

export const getServiceById = async (id) => {
  const response = await api.get(`/api/services/${id}`);
  return response.data;
};

export const createService = async (serviceData) => {
  const response = await api.post('/api/services', serviceData);
  return response.data;
};

export const updateService = async (id, data) => {
  const response = await api.put(`/api/services/${id}`, data);
  return response.data;
};

export const deleteService = async (id) => {
  const response = await api.delete(`/api/services/${id}`);
  return response.data;
};

export const uploadServiceThumbnail = async (serviceId, file) => {
  const formData = new FormData();
  formData.append('thumbnail', file);
  const response = await api.post(`/api/services/${serviceId}/thumbnail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
