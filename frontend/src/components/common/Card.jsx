import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ children, className, noPadding, ...props }) => {
  return (
    <div 
      className={cn(
        'bg-white/90 dark:bg-slate-950/90 border border-slate-100 dark:border-slate-800/70 rounded-2xl shadow-subtle hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden hover:border-emerald-500/20 dark:hover:border-emerald-500/20',
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
