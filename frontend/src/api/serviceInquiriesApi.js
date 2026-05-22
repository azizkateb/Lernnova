import api from './axios';

export const createServiceInquiry = async (serviceId, message) => {
  const response = await api.post('/api/service-inquiries', {
    service_id: serviceId,
    ...(typeof message === 'string' ? { message } : {}),
  });
  return response.data;
};

export const getServiceInquiries = async (params = {}) => {
  const response = await api.get('/api/service-inquiries', { params });
  return response.data;
};

export const getServiceInquiryById = async (id) => {
  const response = await api.get(`/api/service-inquiries/${id}`);
  return response.data;
};

export const sendServiceInquiryMessage = async (id, message, file) => {
  const hasFile = Boolean(file);

  if (hasFile) {
    const formData = new FormData();
    if (typeof message === 'string') {
      formData.append('message', message);
    }
    formData.append('file', file);

    const response = await api.post(`/api/service-inquiries/${id}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  const response = await api.post(`/api/service-inquiries/${id}/messages`, { message });
  return response.data;
};

export const downloadServiceInquiryMessageAttachment = async (inquiryId, messageId) => {
  const response = await api.get(
    `/api/service-inquiries/${inquiryId}/messages/${messageId}/attachment`,
    { responseType: 'blob' }
  );
  return response.data;
};

export const closeServiceInquiry = async (id) => {
  const response = await api.patch(`/api/service-inquiries/${id}/close`);
  return response.data;
};
