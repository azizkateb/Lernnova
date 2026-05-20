import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const Alert = ({ 
  type = 'info', // success, error, warning, info
  title, 
  children, 
  onClose, 
  className,
  dismissible = false,
  animated = true
}) => {
  const styles = {
    success: {
      bg: 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      textColor: 'text-emerald-950 dark:text-emerald-100',
      titleColor: 'text-emerald-900 dark:text-emerald-300',
      icon: CheckCircle2,
      accentGlow: 'bg-emerald-500/10'
    },
    error: {
      bg: 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/20 dark:border-rose-500/30',
      iconColor: 'text-rose-600 dark:text-rose-400',
      textColor: 'text-rose-950 dark:text-rose-100',
      titleColor: 'text-rose-900 dark:text-rose-300',
      icon: AlertCircle,
      accentGlow: 'bg-rose-500/10'
    },
    warning: {
      bg: 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 dark:border-amber-500/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      textColor: 'text-amber-950 dark:text-amber-100',
      titleColor: 'text-amber-900 dark:text-amber-300',
      icon: AlertTriangle,
      accentGlow: 'bg-amber-500/10'
    },
    info: {
      bg: 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/20 dark:border-indigo-500/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      textColor: 'text-indigo-950 dark:text-indigo-100',
      titleColor: 'text-indigo-900 dark:text-indigo-300',
      icon: Info,
      accentGlow: 'bg-indigo-500/10'
    },
  };

  const style = styles[type] || styles.info;
  const Icon = style.icon;

  const content = (
    <div 
      className={cn(
        'relative border rounded-2xl p-4 flex gap-3.5 items-start overflow-hidden backdrop-blur-md transition-shadow hover:shadow-subtle',
        style.bg,
        className
      )}
    >
      {/* Subtle back glowing blur effect */}
      <div className={cn('absolute -left-6 -top-6 w-16 h-16 rounded-full blur-xl pointer-events-none', style.accentGlow)} />

      <div className={cn('pt-0.5 flex-shrink-0', style.iconColor)}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 space-y-1">
        {title && (
          <h5 className={cn('font-bold text-sm tracking-tight', style.titleColor)}>
            {title}
          </h5>
        )}
        <div className={cn('text-xs font-semibold leading-relaxed font-sans', style.textColor)}>
          {children}
        </div>
      </div>

      {(dismissible || onClose) && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-1 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-500/10 dark:hover:bg-slate-500/15 transition-all outline-none cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ type: 'spring', duration: 0.4, bounce: 0.12 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export default Alert;
