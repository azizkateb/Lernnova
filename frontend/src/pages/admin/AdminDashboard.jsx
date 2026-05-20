import React, { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  Package, 
  TrendingUp, 
  AlertCircle,
  ShieldCheck,
  Search,
  MoreVertical
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
    { title: t('dashboard.stats.totalRevenue', 'Total Revenue'), value: formatCurrency(data.totalPlatformRevenue || 0), icon: TrendingUp, color: 'emerald' },
    { title: t('dashboard.stats.activeUsers', 'Active Users'), value: data.usersCount || 0, icon: Users, color: 'sky' },
    { title: t('dashboard.stats.pendingReviews', 'Pending Reviews'), value: data.pendingReviewsCount || 0, icon: AlertCircle, color: 'rose' },
    { title: t('dashboard.stats.successfulPayouts', 'Successful Payouts'), value: data.payoutsCount || 0, icon: ShieldCheck, color: 'emerald' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block">{t('dashboard.admin.badge')}</span>
        <h1 className="text-3xl font-light text-slate-900 tracking-tight mb-2">
          {t('dashboard.admin.titlePrefix')}{' '}
          <span className="font-serif italic text-emerald-600">{t('dashboard.admin.titleAccent')}</span>
        </h1>
        <p className="text-slate-500 font-medium">{t('dashboard.admin.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900">{t('dashboard.admin.recentActivity')}</h3>
              <Button variant="ghost" size="sm">{t('dashboard.admin.downloadReport')}</Button>
           </div>

           <div className="space-y-6 flex-1">
              {data.recentActivities?.length > 0 ? (
                data.recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex gap-4">
                     <div className="w-px bg-slate-100 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-600 outline outline-4 outline-emerald-50" />
                     </div>
                     <div className="pb-6">
                        <p className="text-sm font-bold text-slate-900 mb-1">{activity.description}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(activity.timestamp)}</p>
                     </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 opacity-20">
                   <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                   <p className="text-sm font-bold italic">{t('dashboard.admin.noActivity')}</p>
                </div>
              )}
           </div>
        </Card>

        <Card>
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900">{t('dashboard.admin.awaitingApproval')}</h3>
              <Badge variant="warning">
                {t('dashboard.admin.itemsCount', '{{count}} items', {
                  count: data.pendingReviews?.length || 0,
                })}
              </Badge>
           </div>

           <div className="space-y-4">
              {data.pendingReviews?.length > 0 ? (
                data.pendingReviews.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/50 border border-amber-100 hover:bg-white hover:shadow-md transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 border border-amber-200">
                           {item.type === 'service' ? <FileText className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{item.title}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                             {t('dashboard.admin.by', 'by')} {item.sellerName}
                           </p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="px-3 bg-white">{t('dashboard.admin.review')}</Button>
                     </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 opacity-20">
                   <ShieldCheck className="w-16 h-16 mx-auto mb-4" />
                   <p className="text-sm font-bold italic">{t('dashboard.admin.noPending')}</p>
                </div>
              )}
           </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
