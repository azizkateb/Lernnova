import api from './axios';

const MOCK_PRODUCTS = [
  {
    id: 'p1',
    title: 'Mastering Digital Sales',
    description: 'A comprehensive eBook guide on scaling your digital agency in the MENA region.',
    price: 29.00,
    category: 'E-Books',
    seller_name: 'Lernnova Edu',
    rating: 4.9,
    reviews_count: 512,
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop'
  },
  {
    id: 'p2',
    title: 'Desert Sands UI Kit',
    description: '120+ premium Figma components optimized for localized RTL and LTR interfaces.',
    price: 59.00,
    category: 'Assets',
    seller_name: 'Studio Oasis',
    rating: 4.9,
    reviews_count: 89,
    image_url: 'https://images.unsplash.com/photo-1586717791821-3f44a563as6c?w=500&auto=format&fit=crop'
  },
  {
    id: 'p3',
    title: 'SaaS Dashboard Template',
    description: 'Clean, production-ready React codebase with full dark mode support.',
    price: 89.00,
    category: 'Code',
    seller_name: 'DevFlow',
    rating: 5.0,
    reviews_count: 45,
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop'
  },
  {
    id: 'p4',
    title: 'Scenic High-Res Stock Photo Pack',
    description: '50+ high-resolution urban and landscape photos from gorgeous locations worldwide.',
    price: 49.00,
    category: 'Media',
    seller_name: 'Visual Nomad',
    rating: 4.7,
    reviews_count: 32,
    image_url: 'https://images.unsplash.com/photo-1518625358054-0824bba7979d?w=500&auto=format&fit=crop'
  },
  {
    id: 'p5',
    title: 'Minimalist Resume Template Kit',
    description: 'Beautiful, fully editable PDF and Word career resume layouts for modern developers.',
    price: 0.00,
    category: 'Templates',
    seller_name: 'DesignFlow Studio',
    rating: 5.0,
    reviews_count: 124,
    image_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&auto=format&fit=crop'
  },
  {
    id: 'p6',
    title: 'Ultimate Productivity Workbook Planner',
    description: 'Downloadable task schedules, daily focus planners, and milestone templates.',
    price: 0.00,
    category: 'Workbooks & Planners',
    seller_name: 'Solis Labs',
    rating: 4.8,
    reviews_count: 98,
    image_url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&auto=format&fit=crop'
  }
];

export const getProducts = async (params) => {
  try {
    const response = await api.get('/api/products', { params });
    return response.data;
  } catch (err) {
    console.warn('Backend unreachable, using mock products');
    return { data: MOCK_PRODUCTS };
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  } catch (err) {
    console.warn(`Backend unreachable, using mock product for ID ${id}`);
    const product = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
    return { data: product };
  }
};

export const createProduct = async (productData) => {
  const response = await api.post('/api/products', productData);
  return response.data;
};

export const uploadProductFile = async (productId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/api/products/${productId}/files`, formData);
  return response.data;
};

export const createProductOrder = async (productId) => {
  const response = await api.post('/api/product-orders', { 
    product_id: productId,
    payment_method: 'manual'
  });
  return response.data;
};

export const downloadProductFile = async (orderId, fileId) => {
  const response = await api.get(`/api/product-orders/${orderId}/files/${fileId}/download`, {
    responseType: 'blob'
  });
  return response.data;
};
