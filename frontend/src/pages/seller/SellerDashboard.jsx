import React, { useEffect, useState } from 'react';
import { 
  Package, 
  FileText, 
  CreditCard, 
  Plus, 
  ArrowRight,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSellerOverview } from '../../api/dashboardApi';
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

const SellerDashboard = () => {
  const { t, isRTL } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const resp = await getSellerOverview();
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
    { title: t('dashboard.stats.totalRevenue', 'Total Revenue'), value: formatCurrency(data.totalRevenue || 0), icon: DollarSign, color: 'emerald', trend: '+12.5%' },
    { title: t('dashboard.seller.totalOrders', 'Total Orders'), value: data.ordersCount || 0, icon: ShoppingBag, color: 'indigo' },
    { title: t('sidebar.myServices', 'My Services'), value: data.servicesCount || 0, icon: FileText, color: 'sky' },
    { title: t('sidebar.myProducts', 'My Products'), value: data.productsCount || 0, icon: Package, color: 'amber' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{t('dashboard.seller.title', 'Seller Hub')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t('dashboard.seller.subtitle', 'Grow your digital business on Lernnova.')}</p>
        </div>
        <div className="flex gap-3">
           <Link to="/seller/services/new">
             <Button variant="outline" icon={Plus}>{t('dashboard.seller.addService', 'Add Service')}</Button>
           </Link>
           <Link to="/seller/products/new">
             <Button variant="outline" icon={Plus}>{t('dashboard.seller.addProduct', 'Add Product')}</Button>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Service Orders */}
        <Card className="xl:col-span-2">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.seller.recentServiceOrders', 'Recent Service Orders')}</h3>
              <Link to="/seller/service-orders" className="text-xs font-bold text-indigo-600 hover:underline">{t('common.viewAll')}</Link>
           </div>

           <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/40 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <th className="px-6 py-4">{t('dashboard.seller.table.orderId', 'Order ID')}</th>
                       <th className="px-6 py-4">{t('dashboard.seller.table.buyer', 'Buyer')}</th>
                       <th className="px-6 py-4">{t('dashboard.seller.table.service', 'Service')}</th>
                       <th className="px-6 py-4">{t('dashboard.seller.table.status', 'Status')}</th>
                       <th className="px-6 py-4">{t('dashboard.seller.table.amount', 'Amount')}</th>
                       <th className="px-6 py-4"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {data.recentOrders?.length > 0 ? (
                      data.recentOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                           <td className="px-6 py-4 text-xs font-bold text-slate-500">#{order.id}</td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] uppercase font-bold border border-indigo-100 dark:border-indigo-900/30">
                                    {(order.buyer?.name || 'U').charAt(0)}
                                 </div>
                                 <span className="text-sm font-bold text-slate-900 dark:text-white">{order.buyer?.name || t('dashboard.seller.unknownBuyer', 'Unknown')}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300 line-clamp-1 max-w-[200px]">{order.service?.title}</td>
                           <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                           <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-slate-100">{formatCurrency(order.amount)}</td>
                           <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm" className="p-1 rounded-lg">
                                 <ArrowRight className={["w-4 h-4", isRTL ? "rotate-180" : ""].join(" ")} />
                              </Button>
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                         <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-medium text-sm italic">
                            {t('dashboard.seller.noOrders', 'No orders received yet. Keep promoting!')}
                         </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </Card>

        {/* Top Products */}
        <Card>
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8">{t('dashboard.seller.yourLibrary', 'Your Library')}</h3>
           <div className="space-y-6">
              {data.topProducts?.length > 0 ? (
                data.topProducts.map(product => (
                  <div key={product.id} className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center p-2 shrink-0">
                        <img 
                          src={product.thumbnail || `https://placehold.co/100x100?text=P`} 
                          alt="" 
                          className="w-full h-full object-contain"
                        />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{product.title}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {t('dashboard.seller.salesCount', '{{count}} sales', { count: product.salesCount || 0 })}
                        </p>
                     </div>
                     <p className="text-sm font-black text-emerald-600">{formatCurrency(product.price)}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 opacity-40">
                   <Package className="w-10 h-10 mx-auto mb-4 text-slate-300" />
                   <p className="text-sm font-bold text-slate-400 italic">{t('dashboard.seller.noProducts', 'No products listed')}</p>
                </div>
              )}
           </div>
           
           <div className="mt-10 pt-6 border-t border-slate-50 dark:border-slate-800">
              <Link to="/seller/products">
                <Button variant="outline" className="w-full" size="sm">{t('dashboard.seller.manageProducts', 'Manage Products')}</Button>
              </Link>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default SellerDashboard;
