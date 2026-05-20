import React from 'react';
import Card from '../common/Card';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../context/LanguageContext';

const StatsCard = ({ title, value, icon: Icon, trend, color = 'emerald' }) => {
  const { t } = useLanguage();
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
    sky: 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400',
  };

  return (
    <Card className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
          {trend && (
            <p className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              {trend}{' '}
              <span className="text-slate-400 dark:text-slate-500 font-medium">
                {t('components.statsCard.vsLastMonth')}
              </span>
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300', colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className={cn('absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-5 blur-3xl', colors[color])} />
    </Card>
  );
};

export default StatsCard;
