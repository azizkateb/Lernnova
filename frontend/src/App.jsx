import React, { useEffect, useState } from 'react';
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
import Freebies from './pages/public/Freebies';
import Cart from './pages/public/Cart';
import PaymentSuccess from './pages/public/PaymentSuccess';
import PaymentCancel from './pages/public/PaymentCancel';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import VerifyEmail from './pages/public/VerifyEmail';
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
import SellerProducts from './pages/seller/SellerProducts';
import EditService from './pages/seller/EditService';
import EditProduct from './pages/seller/EditProduct';
import SellerServiceOrders from './pages/seller/SellerServiceOrders';
import SellerProductOrders from './pages/seller/SellerProductOrders';
import SellerEarnings from './pages/seller/SellerEarnings';

// Admin Dash
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import ServiceReview from './pages/admin/ServiceReview';
import ProductReview from './pages/admin/ProductReview';
import AllServiceOrders from './pages/admin/AllServiceOrders';
import AllProductOrders from './pages/admin/AllProductOrders';

// Orders
import ServiceOrderDetails from './pages/orders/ServiceOrderDetails';
import ServiceInquiries from './pages/inquiries/ServiceInquiries';
import ServiceInquiryDetails from './pages/inquiries/ServiceInquiryDetails';

// Settings
import Settings from './pages/Settings';

function App() {
  const { t } = useLanguage();
  const [isMobileToast, setIsMobileToast] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(max-width: 640px)');
    const sync = () => setIsMobileToast(media.matches);
    sync();
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster 
        position={isMobileToast ? 'top-center' : 'top-right'}
        gutter={isMobileToast ? 10 : 8}
        containerStyle={isMobileToast ? { top: 12, left: 12, right: 12 } : { top: 20, right: 20 }}
        toastOptions={{
          className: `premium-toast${isMobileToast ? ' premium-toast-mobile' : ''}`,
          duration: 4500,
          success: {
            className: `premium-toast premium-toast-success${isMobileToast ? ' premium-toast-mobile' : ''}`,
            iconTheme: {
              primary: '#10b981',
              secondary: 'transparent'
            }
          },
          error: {
            className: `premium-toast premium-toast-error${isMobileToast ? ' premium-toast-mobile' : ''}`,
            iconTheme: {
              primary: '#f43f5e',
              secondary: 'transparent'
            }
          },
          loading: {
            className: `premium-toast premium-toast-loading${isMobileToast ? ' premium-toast-mobile' : ''}`
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
          <Route path="/freebies" element={<Freebies />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile/:identifier" element={<PublicProfile />} />
          <Route path="/profile/me" element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          <Route path="/service-orders/:id" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ServiceOrderDetails />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/service-inquiries" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ServiceInquiries />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/service-inquiries/:id" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ServiceInquiryDetails />
              </DashboardLayout>
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
            <Route path="products/:id/edit" element={<EditProduct />} />
            <Route path="services" element={<SellerServices />} />
            <Route path="products" element={<SellerProducts />} />
            <Route path="service-orders" element={<SellerServiceOrders />} />
            <Route path="product-orders" element={<SellerProductOrders />} />
            <Route path="earnings" element={<SellerEarnings />} />
          </Route>

          <Route path="/admin" element={
            <ProtectedRoute>
              <RoleRoute roles={['admin']}>
                <DashboardLayout />
              </RoleRoute>
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="services" element={<ServiceReview />} />
            <Route path="products" element={<ProductReview />} />
            <Route path="service-orders" element={<AllServiceOrders />} />
            <Route path="product-orders" element={<AllProductOrders />} />
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
