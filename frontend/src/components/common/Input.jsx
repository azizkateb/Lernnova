import React from 'react';
import { cn } from '../../utils/cn';

const Input = ({ label, error, className, icon: Icon, ...props }) => {
  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-0.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          className={cn(
            'w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium',
            Icon && 'pl-10',
            error && 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500'
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-500 mt-1 ml-0.5">{error}</p>}
    </div>
  );
};

export default Input;
