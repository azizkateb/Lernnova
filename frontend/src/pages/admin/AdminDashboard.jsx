import React, { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  Package, 
  TrendingUp, 
  AlertCircle,
  ShieldCheck,
  Search,
  MoreVertical,
  ShoppingCart
} from 'lucide-react';
import { getAdminOverview } from '../../api/dashboardApi';
import StatsCard from '../../components/marketplace/StatsCard';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const resp = await getAdminOverview();
      setData(resp);
    } catch (err) {
      setError(t('dashboard.admin.errorLoad', 'Could not load dashboard overview.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={fetchOverview} />;

  const overview = data?.overview || {};

  const stats = [
    { title: t('dashboard.stats.totalUsers', 'Total Users'), value: overview?.users?.total || 0, icon: Users, color: 'sky' },
    { title: t('dashboard.stats.activeUsers', 'Active Users'), value: overview?.users?.active || 0, icon: Users, color: 'sky' },
    { title: t('dashboard.stats.totalServices', 'Total Services'), value: overview?.services?.total || 0, icon: FileText, color: 'indigo' },
    { title: t('dashboard.stats.totalProducts', 'Total Products'), value: overview?.products?.total || 0, icon: Package, color: 'purple' },
    { title: t('dashboard.stats.pendingOrders', 'Pending Orders'), value: (overview?.service_orders?.pending || 0) + (overview?.product_orders?.pending || 0), icon: AlertCircle, color: 'amber' },
    { title: t('dashboard.stats.totalRevenue', 'Total Revenue'), value: formatCurrency(overview?.revenue?.total || 0), icon: TrendingUp, color: 'emerald' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block">{t('dashboard.admin.badge', 'Admin Dashboard')}</span>
        <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mb-2">
          {t('dashboard.admin.titlePrefix', 'Platform')}{' '}
          <span className="font-serif italic text-emerald-600">{t('dashboard.admin.titleAccent', 'Overview')}</span>
        </h1>
        <p className="text-slate-500 font-medium">{t('dashboard.admin.subtitle', 'Monitor marketplace activity and user metrics.')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.admin.recentUsers', 'Recent Users')}</h3>
           </div>

           <div className="space-y-6 flex-1">
              {data?.recent?.users?.length > 0 ? (
                data.recent.users.map((user, idx) => (
                  <div key={idx} className="flex gap-4">
                     <div className="w-px bg-slate-100 dark:bg-slate-800 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-600 outline outline-4 outline-emerald-50 dark:outline-emerald-900" />
                     </div>
                     <div className="pb-6">
                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{user.name} ({t(`dashboard.admin.roles.${user.role}`, user.role)})</p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest">{formatDate(user.created_at)}</p>
                     </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 opacity-20">
                   <Users className="w-16 h-16 mx-auto mb-4" />
                   <p className="text-sm font-bold italic">{t('dashboard.admin.noActivity', 'No recent activity.')}</p>
                </div>
              )}
           </div>
        </Card>

        <Card>
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.admin.recentServiceOrders', 'Recent Service Orders')}</h3>
              <Badge variant="emerald">
                {t('dashboard.admin.items', 'Items')} {data?.recent?.service_orders?.length || 0}
              </Badge>
           </div>

           <div className="space-y-4">
              {data?.recent?.service_orders?.length > 0 ? (
                data.recent.service_orders.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-600 hover:shadow-md transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">
                           <ShoppingCart className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{item.service?.title || t('dashboard.admin.unknownService', 'Unknown Service')}</p>
                           <p className="text-[10px] text-slate-400 dark:text-slate-300 font-bold uppercase tracking-widest">
                             {t('dashboard.admin.buyer', 'Buyer')}: {item.buyer?.name}
                           </p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.price)}</span>
                     </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 opacity-20">
                   <ShoppingCart className="w-16 h-16 mx-auto mb-4" />
                   <p className="text-sm font-bold italic">{t('dashboard.admin.noOrders', 'No recent orders.')}</p>
                </div>
              )}
           </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
