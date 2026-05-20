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
    primary: 'bg-primary text-white hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 shadow-sm shadow-primary/10 dark:shadow-none active:translate-y-0 active:scale-[0.98]',
    accent: 'bg-accent text-white hover:bg-accent/95 hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5 shadow-sm shadow-accent/10 active:translate-y-0 active:scale-[0.98]',
    secondary: 'bg-secondary text-white hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-md shadow-sm dark:bg-white dark:text-secondary dark:hover:bg-slate-100 active:translate-y-0 active:scale-[0.98]',
    outline: 'border border-slate-200 bg-white/80 backdrop-blur-xs text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 dark:bg-brand-dark/80 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 active:translate-y-0 active:scale-[0.98]',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-brand-dark hover:-translate-y-0.2 active:scale-[0.98]',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/25 hover:-translate-y-0.5 shadow-sm shadow-rose-200 dark:shadow-none active:translate-y-0 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs font-semibold rounded-lg',
    md: 'px-5 py-2.5 text-sm font-semibold rounded-xl',
    lg: 'px-6 py-3 text-base font-bold rounded-2xl',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none gap-2 shrink-0',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
