import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useLanguage } from './context/LanguageContext';

import Button from './components/common/Button';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleRoute from './components/layout/RoleRoute';

import Home from './pages/public/Home';
import Services from './pages/public/Services';
import Products from './pages/public/Products';
import Freebies from './pages/public/Freebies';
import Cart from './pages/public/Cart';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import About from './pages/public/About';
import Contact from './pages/public/Contact';

const ServiceDetails = React.lazy(() => import('./pages/public/ServiceDetails'));
const ProductDetails = React.lazy(() => import('./pages/public/ProductDetails'));
const PaymentSuccess = React.lazy(() => import('./pages/public/PaymentSuccess'));
const PaymentCancel = React.lazy(() => import('./pages/public/PaymentCancel'));
const ForgotPassword = React.lazy(() => import('./pages/public/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/public/ResetPassword'));
const VerifyEmail = React.lazy(() => import('./pages/public/VerifyEmail'));
const PublicProfile = React.lazy(() => import('./pages/profile/PublicProfile'));
const MyProfile = React.lazy(() => import('./pages/profile/MyProfile'));
const BuyerDashboard = React.lazy(() => import('./pages/buyer/BuyerDashboard'));
const BuyerServiceOrders = React.lazy(() => import('./pages/buyer/BuyerServiceOrders'));
const BuyerProductOrders = React.lazy(() => import('./pages/buyer/BuyerProductOrders'));
const SellerDashboard = React.lazy(() => import('./pages/seller/SellerDashboard'));
const AddService = React.lazy(() => import('./pages/seller/AddService'));
const AddProduct = React.lazy(() => import('./pages/seller/AddProduct'));
const SellerServices = React.lazy(() => import('./pages/seller/SellerServices'));
const SellerProducts = React.lazy(() => import('./pages/seller/SellerProducts'));
const EditService = React.lazy(() => import('./pages/seller/EditService'));
const EditProduct = React.lazy(() => import('./pages/seller/EditProduct'));
const SellerServiceOrders = React.lazy(() => import('./pages/seller/SellerServiceOrders'));
const SellerProductOrders = React.lazy(() => import('./pages/seller/SellerProductOrders'));
const SellerEarnings = React.lazy(() => import('./pages/seller/SellerEarnings'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const ServiceReview = React.lazy(() => import('./pages/admin/ServiceReview'));
const ProductReview = React.lazy(() => import('./pages/admin/ProductReview'));
const AllServiceOrders = React.lazy(() => import('./pages/admin/AllServiceOrders'));
const AllProductOrders = React.lazy(() => import('./pages/admin/AllProductOrders'));
const ServiceOrderDetails = React.lazy(() => import('./pages/orders/ServiceOrderDetails'));
const ServiceInquiries = React.lazy(() => import('./pages/inquiries/ServiceInquiries'));
const ServiceInquiryDetails = React.lazy(() => import('./pages/inquiries/ServiceInquiryDetails'));
const Settings = React.lazy(() => import('./pages/Settings'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

export default App;
