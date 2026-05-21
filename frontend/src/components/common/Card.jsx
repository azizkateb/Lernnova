import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ children, className, noPadding, ...props }) => {
  return (
    <div 
      className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.4)] hover:-translate-y-1.5 transition-all duration-400 ease-out overflow-hidden hover:border-slate-300 dark:hover:border-slate-700',
        !noPadding && 'p-6 md:p-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
