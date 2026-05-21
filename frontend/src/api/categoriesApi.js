import api from './axios';

const normalizeCategories = (result) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.categories)) return result.categories;
  if (Array.isArray(result?.data)) return result.data;
  return [];
};

export const getServiceCategories = async (params = {}) => {
  const response = await api.get('/api/categories', { params });
  return normalizeCategories(response.data);
};

export const getProductCategories = async (params = {}) => {
  const response = await api.get('/api/product-categories', { params });
  return normalizeCategories(response.data);
};

// Service Category CRUD (admin)
export const createServiceCategory = async (data) => {
  const response = await api.post('/api/categories', data);
  return response.data;
};

export const updateServiceCategory = async (id, data) => {
  const response = await api.put(`/api/categories/${id}`, data);
  return response.data;
};

export const deleteServiceCategory = async (id) => {
  const response = await api.delete(`/api/categories/${id}`);
  return response.data;
};

// Product Category CRUD (admin)
export const createProductCategory = async (data) => {
  const response = await api.post('/api/product-categories', data);
  return response.data;
};

export const updateProductCategory = async (id, data) => {
  const response = await api.put(`/api/product-categories/${id}`, data);
  return response.data;
};

export const deleteProductCategory = async (id) => {
  const response = await api.delete(`/api/product-categories/${id}`);
  return response.data;
};

