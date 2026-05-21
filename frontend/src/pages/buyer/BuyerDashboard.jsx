import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  FileText, 
  CreditCard, 
  Clock, 
  ArrowRight,
  Zap,
  TrendingUp,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBuyerOverview } from '../../api/dashboardApi';
import StatsCard from '../../components/marketplace/StatsCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import OrderStatusBadge from '../../components/marketplace/OrderStatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';

const BuyerDashboard = () => {
  const { t, isRTL } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const resp = await getBuyerOverview();
      setData(resp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={fetchOverview} />;

  const stats = [
    { title: t('dashboard.stats.totalSpent', 'Total Spent'), value: formatCurrency(data.totalSpent || 0), icon: CreditCard, color: 'emerald' },
    { title: t('dashboard.stats.serviceOrders', 'Service Orders'), value: data.serviceOrdersCount || 0, icon: FileText, color: 'indigo' },
    { title: t('dashboard.stats.productOrders', 'Product Orders'), value: data.productOrdersCount || 0, icon: ShoppingBag, color: 'sky' },
    { title: t('dashboard.stats.activeProjects', 'Active Projects'), value: data.activeServicesCount || 0, icon: TrendingUp, color: 'amber' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{t('dashboard.buyer.title')}</h1>
        <p className="text-slate-500 font-medium">{t('dashboard.buyer.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Service Orders */}
        <Card className="flex flex-col h-full">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.buyer.recentServiceOrders')}</h3>
              <Link to="/buyer/service-orders" className="text-xs font-bold text-indigo-600 hover:underline">{t('common.viewAll')}</Link>
           </div>

           <div className="space-y-4 flex-1">
              {data.recentServiceOrders?.length > 0 ? (
                data.recentServiceOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 border border-slate-200">
                           <Zap className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{order.service?.title || t('dashboard.buyer.serviceFallback', 'Digital Service')}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(order.created_at)}</p>
                        </div>
                     </div>
                     <OrderStatusBadge status={order.status} />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                   <Clock className="w-10 h-10 text-slate-300 mb-2" />
                   <p className="text-sm font-bold text-slate-400">{t('dashboard.buyer.noneServiceOrders')}</p>
                </div>
              )}
           </div>
        </Card>

        {/* Recent Product Orders */}
        <Card className="flex flex-col h-full">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.buyer.recentProductPurchases')}</h3>
              <Link to="/buyer/product-orders" className="text-xs font-bold text-indigo-600 hover:underline">{t('common.viewAll')}</Link>
           </div>

           <div className="space-y-4 flex-1">
              {data.recentProductOrders?.length > 0 ? (
                data.recentProductOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 border border-slate-200">
                           <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{order.product?.title || t('dashboard.buyer.productFallback', 'Digital Product')}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(order.created_at)}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <OrderStatusBadge status={order.payment_status} />
                        {order.payment_status === 'paid' && (
                          <Button size="sm" variant="ghost" className="p-2 min-w-0 rounded-full h-8 w-8">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                     </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                   <ShoppingBag className="w-10 h-10 text-slate-300 mb-2" />
                   <p className="text-sm font-bold text-slate-400">{t('dashboard.buyer.noneProductOrders')}</p>
                </div>
              )}
           </div>
        </Card>
      </div>

      {/* Suggested for you / Explore CTA */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
         <div className="relative z-10 text-center md:text-left">
            <h3 className="text-2xl font-black text-white mb-2">{t('dashboard.buyer.exploreTitle')}</h3>
            <p className="text-indigo-100 font-medium max-w-sm">{t('dashboard.buyer.exploreDesc')}</p>
         </div>
         <Link to="/services" className="relative z-10">
            <Button
              variant="secondary"
              size="lg"
              icon={ArrowRight}
              className="bg-white text-indigo-600 border-none hover:bg-slate-50"
            >
              {t('common.exploreServices')}
            </Button>
         </Link>
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
      </div>
    </div>
  );
};

export default BuyerDashboard;
