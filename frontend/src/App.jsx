import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useLanguage } from './context/LanguageContext';

// Components
import Button from './components/common/Button';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleRoute from './components/layout/RoleRoute';

// Public Pages
import Home from './pages/public/Home';
import Services from './pages/public/Services';
import ServiceDetails from './pages/public/ServiceDetails';
import Products from './pages/public/Products';
import ProductDetails from './pages/public/ProductDetails';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import PublicProfile from './pages/profile/PublicProfile';
import About from './pages/public/About';
import Contact from './pages/public/Contact';

// Profile
import MyProfile from './pages/profile/MyProfile';

// Buyer Dash
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyerServiceOrders from './pages/buyer/BuyerServiceOrders';
import BuyerProductOrders from './pages/buyer/BuyerProductOrders';

// Seller Dash
import SellerDashboard from './pages/seller/SellerDashboard';
import AddService from './pages/seller/AddService';
import AddProduct from './pages/seller/AddProduct';
import SellerServices from './pages/seller/SellerServices';
import EditService from './pages/seller/EditService';

// Admin Dash
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'premium-toast',
          duration: 4500,
          success: {
            className: 'premium-toast premium-toast-success',
            iconTheme: {
              primary: '#10b981',
              secondary: 'transparent'
            }
          },
          error: {
            className: 'premium-toast premium-toast-error',
            iconTheme: {
              primary: '#f43f5e',
              secondary: 'transparent'
            }
          },
          loading: {
            className: 'premium-toast premium-toast-loading'
          }
        }} 
      />
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="/profile/me" element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          } />

          <Route path="/buyer" element={
            <ProtectedRoute>
              <RoleRoute roles={['buyer', 'admin']}>
                <DashboardLayout />
              </RoleRoute>
            </ProtectedRoute>
          }>
            <Route index element={<BuyerDashboard />} />
            <Route path="service-orders" element={<BuyerServiceOrders />} />
            <Route path="product-orders" element={<BuyerProductOrders />} />
          </Route>

          <Route path="/seller" element={
            <ProtectedRoute>
              <RoleRoute roles={['seller', 'admin']}>
                <DashboardLayout />
              </RoleRoute>
            </ProtectedRoute>
          }>
            <Route index element={<SellerDashboard />} />
            <Route path="services/new" element={<AddService />} />
            <Route path="services/:id/edit" element={<EditService />} />
            <Route path="products/new" element={<AddProduct />} />
            <Route path="services" element={<SellerServices />} />
            <Route path="products" element={<div className="p-12 text-center font-bold text-slate-400 italic">{t('pages.seller.productsPlaceholder', 'Product Management Implementation')}</div>} />
          </Route>

          <Route path="/admin" element={
            <ProtectedRoute>
              <RoleRoute roles={['admin']}>
                <DashboardLayout />
              </RoleRoute>
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<div className="p-12 text-center font-bold text-slate-400 italic">{t('pages.admin.usersPlaceholder', 'User Management Implementation')}</div>} />
          </Route>

          <Route path="*" element={
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
              <h1 className="text-9xl font-black text-slate-100">404</h1>
              <p className="text-lg font-bold text-slate-500 mb-8 -mt-10">{t('pages.notFound.title')}</p>
              <Link to="/">
                <Button>{t('pages.notFound.button')}</Button>
              </Link>
            </div>
          } />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
