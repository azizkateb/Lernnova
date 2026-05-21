import React from 'react';
import { cn } from '../../utils/cn';

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  icon: Icon,
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white hover:from-indigo-500 hover:via-blue-500 hover:to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 shadow-md shadow-indigo-500/20 active:translate-y-0 active:scale-[0.98]',
    accent: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 shadow-md shadow-emerald-500/20 active:translate-y-0 active:scale-[0.98]',
    secondary: 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 active:translate-y-0 active:scale-[0.98]',
    outline: 'border border-slate-200 bg-white/80 backdrop-blur-xs text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 active:translate-y-0 active:scale-[0.98]',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 hover:-translate-y-0.5 active:scale-[0.98]',
    danger: 'bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/25 hover:-translate-y-0.5 dark:bg-rose-500/20 dark:text-rose-400 active:translate-y-0 active:scale-[0.98] transition-colors',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs font-semibold rounded-lg',
    md: 'px-5 py-2.5 text-sm font-semibold rounded-xl',
    lg: 'px-6 py-3 text-base font-bold rounded-2xl',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none gap-2 shrink-0',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
