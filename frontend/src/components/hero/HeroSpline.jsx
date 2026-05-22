import React from 'react';
import { cn } from '../../utils/cn';

// Spline removed from hero — keep a lightweight placeholder to preserve layout if referenced.
export default function HeroSpline({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative h-[420px] sm:h-[560px] lg:h-[720px] w-full overflow-hidden rounded-[2.25rem] border border-slate-200/70 bg-white dark:border-white/10 dark:bg-slate-950/40',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 -top-10 h-56 w-56 rounded-full bg-sky-100/60 dark:bg-sky-900/20 blur-3xl" />
        <div className="absolute -right-10 top-10 h-64 w-64 rounded-full bg-sky-100/40 dark:bg-sky-900/10 blur-3xl" />
      </div>
    </div>
  );
}
