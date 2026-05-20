import React from 'react';
import { Package, FileText, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const StatCard = ({ label, value, icon: Icon, colorClass }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 transition-all hover:scale-[1.02] duration-300">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{value || 0}</p>
      </div>
    </div>
  </div>
);

const PublicProfileStats = ({ stats }) => {
  const { t } = useLanguage();

  const cards = [
    { 
      label: t('profile.stats.services'), 
      value: stats?.services_count, 
      icon: FileText, 
      colorClass: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
    },
    { 
      label: t('profile.stats.products'), 
      value: stats?.products_count, 
      icon: Package, 
      colorClass: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
    },
    { 
      label: t('profile.stats.serviceOrders'), 
      value: stats?.completed_service_orders_count, 
      icon: CheckCircle2, 
      colorClass: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' 
    },
    { 
      label: t('profile.stats.productOrders'), 
      value: stats?.completed_product_orders_count, 
      icon: ShoppingBag, 
      colorClass: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' 
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <StatCard key={idx} {...card} />
      ))}
    </div>
  );
};

export default PublicProfileStats;
