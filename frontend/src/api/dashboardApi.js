import api from './axios';

// Buyer Dash
export const getBuyerOverview = async () => {
  const response = await api.get('/api/dashboard/buyer/overview');
  return response.data;
};

export const getBuyerServiceOrders = async (params = {}) => {
  const response = await api.get('/api/dashboard/buyer/service-orders', { params });
  return response.data;
};

export const getBuyerProductOrders = async (params = {}) => {
  const response = await api.get('/api/dashboard/buyer/product-orders', { params });
  return response.data;
};

// Seller Dash
export const getSellerOverview = async () => {
  const response = await api.get('/api/dashboard/seller/overview');
  return response.data;
};

export const getSellerServices = async (params = {}) => {
  const response = await api.get('/api/dashboard/seller/services', { params });
  return response.data;
};

export const getSellerProducts = async (params = {}) => {
  const response = await api.get('/api/dashboard/seller/products', { params });
  return response.data;
};

export const getSellerServiceOrders = async (params = {}) => {
  const response = await api.get('/api/dashboard/seller/service-orders', { params });
  return response.data;
};

export const getSellerProductOrders = async (params = {}) => {
  const response = await api.get('/api/dashboard/seller/product-orders', { params });
  return response.data;
};

// Admin Dash
export const getAdminOverview = async () => {
  const response = await api.get('/api/dashboard/admin/overview');
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get('/api/dashboard/admin/users', { params });
  return response.data;
};

export const getAdminServices = async (params = {}) => {
  const response = await api.get('/api/dashboard/admin/services', { params });
  return response.data;
};

export const getAdminProducts = async (params = {}) => {
  const response = await api.get('/api/dashboard/admin/products', { params });
  return response.data;
};

export const getAdminServiceOrders = async (params = {}) => {
  const response = await api.get('/api/dashboard/admin/service-orders', { params });
  return response.data;
};

export const getAdminProductOrders = async (params = {}) => {
  const response = await api.get('/api/dashboard/admin/product-orders', { params });
  return response.data;
};
