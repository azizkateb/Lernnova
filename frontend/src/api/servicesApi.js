import api from './axios';

const MOCK_SERVICES = [
  {
    id: 's1',
    title: 'Premium Creative Monogram Branding',
    description: 'Custom corporate identities optimized for fine luxury brands and high-quality digital assets.',
    price: 450.00,
    category: 'Design',
    seller_name: 'Ahmed Khalil',
    rating: 4.9,
    reviews_count: 128,
    image_url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=500&auto=format&fit=crop'
  },
  {
    id: 's2',
    title: 'React & Tailwind Web Dashboard',
    description: 'Full-stack development of professional SaaS interfaces with clean, modular architecture.',
    price: 1200.00,
    category: 'Tech',
    seller_name: 'Sara J.',
    rating: 5.0,
    reviews_count: 84,
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop'
  },
  {
    id: 's3',
    title: 'Global SEO & Multi-lingual Strategy',
    description: 'Optimize your digital presence for active markets with localized keyword research and technical SEO.',
    price: 350.00,
    category: 'Marketing',
    seller_name: 'Omar Farooq',
    rating: 4.8,
    reviews_count: 215,
    image_url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=500&auto=format&fit=crop'
  },
  {
    id: 's4',
    title: 'Mobile App UI/UX Design',
    description: 'High-fidelity prototypes and user experience design for iOS and Android platforms.',
    price: 800.00,
    category: 'Design',
    seller_name: 'Huda T.',
    rating: 4.9,
    reviews_count: 62,
    image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&auto=format&fit=crop'
  }
];

export const getServices = async (params) => {
  try {
    const response = await api.get('/api/services', { params });
    return response.data;
  } catch (err) {
    console.warn('Backend unreachable, using mock services');
    return { data: MOCK_SERVICES };
  }
};

export const getServiceById = async (id) => {
  try {
    const response = await api.get(`/api/services/${id}`);
    return response.data;
  } catch (err) {
    console.warn(`Backend unreachable, using mock service for ID ${id}`);
    const service = MOCK_SERVICES.find(s => s.id === id) || MOCK_SERVICES[0];
    return { data: service };
  }
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

export const createServiceOrder = async (serviceId) => {
  const response = await api.post('/api/service-orders', { service_id: serviceId });
  return response.data;
};
