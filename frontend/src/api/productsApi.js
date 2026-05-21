import api from './axios';

export const getProducts = async (params) => {
  const response = await api.get('/api/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/api/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/api/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/api/products/${id}`);
  return response.data;
};

export const getProductFiles = async (productId) => {
  const response = await api.get(`/api/products/${productId}/files`);
  return response.data;
};

export const uploadProductFile = async (productId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/api/products/${productId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const deleteProductFile = async (productId, fileId) => {
  const response = await api.delete(`/api/products/${productId}/files/${fileId}`);
  return response.data;
};
