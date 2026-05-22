import React from 'react';
import { cn } from '../../utils/cn';

const Badge = ({ children, variant = 'neutral', className }) => {
  const variants = {
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    primary: 'bg-primary/10 dark:bg-primary/20 text-primary',
    accent: 'bg-accent/10 dark:bg-accent/20 text-accent',
    success: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    danger: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  };

  return (
    <span className={cn(
      'px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export default Badge;
