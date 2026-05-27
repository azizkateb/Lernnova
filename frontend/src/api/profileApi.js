import api from './axios';

export const getMyProfile = async () => {
  const response = await api.get('/api/profile/me');
  return response.data;
};

export const updateMyProfile = async (data) => {
  const response = await api.put('/api/profile/me', data);
  return response.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await api.post('/api/profile/avatar', formData);
  return response.data;
};

export const getPublicProfile = async (identifier) => {
  const response = await api.get(`/api/profile/${identifier}`);
  return response.data;
};
