import React from 'react';
import { PackageOpen } from 'lucide-react';
import { cn } from '../../utils/cn';

const EmptyState = ({ title, description, className, icon: Icon = PackageOpen }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 px-6 text-center bg-slate-50/50 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800', className)}>
      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800/60 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default EmptyState;
