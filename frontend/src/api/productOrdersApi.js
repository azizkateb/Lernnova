import api from './axios';

export const createCheckoutSession = async (productId) => {
  const response = await api.post('/api/product-orders/create-checkout-session', {
    product_id: productId,
  });
  return response.data;
};

export const createProductOrder = async (productId, paymentMethod = 'manual') => {
  const response = await api.post('/api/product-orders', {
    product_id: productId,
    payment_method: paymentMethod,
  });
  return response.data;
};

export const getMyProductOrders = async (params = {}) => {
  const response = await api.get('/api/product-orders/my-orders', { params });
  return response.data;
};

export const getProductOrderById = async (id) => {
  const response = await api.get(`/api/product-orders/${id}`);
  return response.data;
};

export const updateProductOrderPaymentStatus = async (id, paymentStatus) => {
  const response = await api.patch(`/api/product-orders/${id}/payment-status`, {
    payment_status: paymentStatus,
  });
  return response.data;
};

export const updateProductOrderStatus = async (id, orderStatus) => {
  const response = await api.patch(`/api/product-orders/${id}/order-status`, {
    order_status: orderStatus,
  });
  return response.data;
};

export const getPurchasedProductFiles = async (orderId) => {
  const response = await api.get(`/api/product-orders/${orderId}/files`);
  return response.data;
};

export const downloadPurchasedProductFile = async (orderId, fileId) => {
  const response = await api.get(`/api/product-orders/${orderId}/files/${fileId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};
