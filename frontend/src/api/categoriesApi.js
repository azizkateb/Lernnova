import api from './axios';

const normalizeCategories = (result) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.categories)) return result.categories;
  if (Array.isArray(result?.data)) return result.data;
  return [];
};

export const getServiceCategories = async () => {
  const response = await api.get('/api/categories');
  return normalizeCategories(response.data);
};

export const getProductCategories = async () => {
  const response = await api.get('/api/product-categories');
  return normalizeCategories(response.data);
};

