import api from './axios';

export const createStripeConnectAccount = async () => {
  const response = await api.post('/api/stripe/connect/create-account');
  return response.data;
};

export const getStripeConnectStatus = async () => {
  const response = await api.get('/api/stripe/connect/status');
  return response.data;
};

export const refreshStripeConnectLink = async () => {
  const response = await api.post('/api/stripe/connect/refresh-link');
  return response.data;
};
