import api from './axios';

export const getNotifications = async (params = {}) => {
  const response = await api.get('/api/notifications', { params });
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await api.get('/api/notifications/unread-count');
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.patch(`/api/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.patch('/api/notifications/mark-all-read');
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/api/notifications/${id}`);
  return response.data;
};
