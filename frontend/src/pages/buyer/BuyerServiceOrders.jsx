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
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('dashboard.buyerOrders.serviceOrdersTitle', 'Service Orders')}</h1>
           <p className="text-slate-500 font-medium">{t('dashboard.buyerOrders.serviceOrdersSubtitle', 'Manage your active and completed service contracts.')}</p>
        </div>
        <div className="w-full md:w-80">
           <Input 
             placeholder={t('dashboard.buyerOrders.serviceSearchPlaceholder')}
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
                  <img 
                    src={order.service?.image || `https://placehold.co/400x400/6366f1/ffffff?text=Service`} 
                    alt={t('dashboard.buyerOrders.serviceAlt', 'Service')}
                    className="w-full h-full object-cover"
                  />
               </div>
               
               <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dashboard.buyerOrders.orderNumber', 'Order #{{id}}', { id: order.id })}</p>
                       <OrderStatusBadge status={order.status} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{order.service?.title || t('dashboard.buyerOrders.serviceFallback', 'Custom Service')}</h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                       <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-indigo-400" /> {formatDate(order.created_at)}</span>
                       <span className="flex items-center gap-1.5"><FileText className="w-3 h-3 text-indigo-400" /> {t('dashboard.buyerOrders.sellerLabel', 'Seller')}: {order.service?.seller?.username || t('dashboard.buyerOrders.sellerFallback', 'Expert')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                     <p className="text-lg font-black text-slate-900">{formatCurrency(order.amount || order.service?.price || 0)}</p>
                     <div className="flex gap-2">
                        <Button variant="ghost" size="sm" icon={MessageSquare} onClick={() => navigate(`/service-orders/${order.id}`)}>{t('dashboard.buyerOrders.message', 'Message')}</Button>
                        <Button variant="outline" size="sm" icon={ExternalLink} onClick={() => navigate(`/service-orders/${order.id}`)}>{t('dashboard.buyerOrders.details', 'Details')}</Button>
                     </div>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState 
          title={t('dashboard.buyerOrders.noServiceOrdersTitle')}
          description={t('dashboard.buyerOrders.noServiceOrdersDesc')}
          icon={FileText}
        />
      )}
    </div>
  );
};

export default BuyerServiceOrders;
