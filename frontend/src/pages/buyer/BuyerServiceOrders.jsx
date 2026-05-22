import React, { useEffect, useState } from 'react';
import { FileText, MessageSquare, ExternalLink, Calendar, Search } from 'lucide-react';
import { getBuyerServiceOrders } from '../../api/dashboardApi';
import { extractArray, extractPagination } from '../../utils/apiResponse';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import OrderStatusBadge from '../../components/marketplace/OrderStatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useLanguage } from '../../context/LanguageContext';

import { useNavigate } from 'react-router-dom';

const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('data:') || path.startsWith('blob:')) return path;

  const rawBase = String(import.meta.env.VITE_API_URL || 'http://localhost:5000');
  const baseUrl = rawBase.replace(/\/+$/, '').replace(/\/api$/, '');
  return `${baseUrl}/${path.replace(/^\/+/, '')}`;
};

const resolveServiceThumbnail = (service) =>
  service?.thumbnail_url || service?.thumbnail || service?.image_url || service?.cover_url || null;

const ServiceThumbnail = ({ service, fallbackLabel }) => {
  const thumbnail = resolveServiceThumbnail(service);
  const thumbnailSrc = getFileUrl(thumbnail);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [thumbnailSrc]);

  if (thumbnailSrc && !imageFailed) {
    return (
      <img
        src={thumbnailSrc}
        alt={service?.title || 'Service thumbnail'}
        className="h-full w-full object-cover object-center"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-emerald-500/10">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-400">{fallbackLabel}</p>
      </div>
    </div>
  );
};

const PaymentBadge = ({ status, t }) => {
  const styles = {
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    refunded: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };
  const labels = {
    paid: t('orders.paymentPaid', 'Paid'),
    pending: t('orders.paymentPending', 'Payment Pending'),
    failed: t('orders.paymentFailed', 'Payment Failed'),
    refunded: t('orders.paymentRefunded', 'Refunded'),
  };
  const s = status?.toLowerCase() || 'pending';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[s] || styles.pending}`}>
      {labels[s] || s}
    </span>
  );
};

const BuyerServiceOrders = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getBuyerServiceOrders();
      setOrders(extractArray(data, ['orders']));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => 
    o.service?.title?.toLowerCase().includes(filter.toLowerCase()) ||
    o.id?.toString().includes(filter)
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={fetchOrders} />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('dashboard.buyer.serviceOrders', 'Service Orders')}</h1>
           <p className="text-slate-500 font-medium">{t('dashboard.buyer.orders.serviceOrdersSubtitle', 'Manage your service orders and contracts.')}</p>
        </div>
        <div className="w-full md:w-80">
           <Input 
             placeholder={t('dashboard.buyer.orders.serviceSearch', 'Search service orders...')}
             icon={Search} 
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
           />
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} noPadding className="flex flex-col md:flex-row items-stretch p-2">
               <div className="w-full md:w-48 aspect-video md:aspect-square bg-slate-100 rounded-xl overflow-hidden shrink-0">
                  <ServiceThumbnail
                    service={order.service}
                    fallbackLabel={t('dashboard.buyerOrders.serviceAlt', 'Service')}
                  />
               </div>
               
               <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dashboard.buyer.orders.orderNumber', 'Order #')} {order.id}</p>
                       <div className="flex items-center gap-2">
                         <PaymentBadge status={order.payment_status} t={t} />
                         <OrderStatusBadge status={order.status} />
                       </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{order.service?.title || t('dashboard.buyerOrders.serviceFallback', 'Custom Service')}</h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                       <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-indigo-400" /> {formatDate(order.created_at)}</span>
                       <span className="flex items-center gap-1.5"><FileText className="w-3 h-3 text-indigo-400" /> {t('dashboard.buyer.orders.seller', 'Seller')}: {order.service?.seller?.username || t('dashboard.buyerOrders.sellerFallback', 'Expert')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                     <p className="text-lg font-black text-slate-900">{formatCurrency(order.amount || order.service?.price || 0)}</p>
                     <div className="flex gap-2">
                        <Button variant="ghost" size="sm" icon={MessageSquare} onClick={() => navigate(`/service-orders/${order.id}`)}>{t('dashboard.buyer.orders.message', 'Message')}</Button>
                        <Button variant="outline" size="sm" icon={ExternalLink} onClick={() => navigate(`/service-orders/${order.id}`)}>{t('dashboard.buyer.orders.details', 'Details')}</Button>
                     </div>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState 
          title={t('dashboard.buyer.noServiceOrders', 'No service orders yet.')}
          description={t('dashboard.buyer.orders.noOrders', 'No orders found.')}
          icon={FileText}
        />
      )}
    </div>
  );
};

export default BuyerServiceOrders;
