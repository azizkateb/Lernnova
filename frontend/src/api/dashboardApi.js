import api from './axios';

// Buyer Dash
export const getBuyerOverview = async () => {
  const response = await api.get('/api/dashboard/buyer/overview');
  return response.data;
};

export const getBuyerServiceOrders = async () => {
  const response = await api.get('/api/dashboard/buyer/service-orders');
  return response.data;
};

export const getBuyerProductOrders = async () => {
  const response = await api.get('/api/dashboard/buyer/product-orders');
  return response.data;
};

// Seller Dash
export const getSellerOverview = async () => {
  const response = await api.get('/api/dashboard/seller/overview');
  return response.data;
};

export const getSellerServices = async (params) => {
  const response = await api.get('/api/dashboard/seller/services', { params });
  return response.data;
};

export const getSellerProducts = async () => {
  const response = await api.get('/api/dashboard/seller/products');
  return response.data;
};

export const getSellerServiceOrders = async () => {
  const response = await api.get('/api/dashboard/seller/service-orders');
  return response.data;
};

export const getSellerProductOrders = async () => {
  const response = await api.get('/api/dashboard/seller/product-orders');
  return response.data;
};

// Admin Dash
export const getAdminOverview = async () => {
  try {
    const response = await api.get('/api/dashboard/admin/overview');
    return response.data;
  } catch (err) {
    console.warn('Backend unreachable, using mock admin overview');
    return {
      totalPlatformRevenue: 124500.50,
      usersCount: 2481,
      pendingReviewsCount: 12,
      payoutsCount: 432,
      recentActivities: [
        { description: 'New service order placed by User#12', timestamp: new Date().toISOString() },
        { description: 'Seller verification approved for Ahmed K.', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { description: 'New product "Mastering Digital Sales" listed', timestamp: new Date(Date.now() - 7200000).toISOString() },
      ],
      pendingReviews: [
        { id: 'rev1', title: 'Luxury Logo Design', sellerName: 'Creative Mind', type: 'service' },
        { id: 'rev2', title: 'SEO Checklist PDF', sellerName: 'Market Pro', type: 'product' },
      ]
    };
  }
};

export const getAdminUsers = async () => {
  const response = await api.get('/api/dashboard/admin/users');
  return response.data;
};

export const getAdminServices = async () => {
  const response = await api.get('/api/dashboard/admin/services');
  return response.data;
};

export const getAdminProducts = async () => {
  const response = await api.get('/api/dashboard/admin/products');
  return response.data;
};

export const getAdminServiceOrders = async () => {
  const response = await api.get('/api/dashboard/admin/service-orders');
  return response.data;
};

export const getAdminProductOrders = async () => {
  const response = await api.get('/api/dashboard/admin/product-orders');
  return response.data;
};
