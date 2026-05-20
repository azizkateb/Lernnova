import React from 'react';
import { cn } from '../../utils/cn';

const Logo = ({ className, showText = true, showSlogan = false, size = "md" }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const textClasses = {
    sm: "text-sm",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-6xl"
  };

  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <div className={cn(
        "relative flex-shrink-0",
        sizeClasses[size]
      )}>
        {/* Crystal Logo Shape */}
        <div className="absolute inset-0 bg-linear-to-br from-primary via-indigo-600 to-accent rounded-xl transform group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-primary/20" />
        <div className="absolute inset-0.5 bg-linear-to-tl from-white/10 to-transparent rounded-xl flex items-center justify-center backdrop-blur-sm overflow-hidden">
           {/* Geometric refractive lines */}
           <div className="absolute top-0 left-0 w-full h-px bg-white/20 rotate-45 translate-y-2" />
           <div className="absolute bottom-0 right-0 w-full h-px bg-white/20 rotate-45 -translate-y-2" />
           <div className="absolute top-0 right-0 w-px h-full bg-white/20 rotate-45 -translate-x-2" />
           <div className="absolute bottom-0 left-0 w-px h-full bg-white/20 rotate-45 translate-x-2" />
           
           <span className="text-white font-black italic tracking-tighter transform -skew-x-12 select-none">L</span>
        </div>
        
        {/* Glowing aura */}
        <div className="absolute -inset-1 bg-linear-to-r from-primary to-accent rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none",
            textClasses[size]
          )}>
            Lernnova
          </span>
          {showSlogan && (
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1 whitespace-nowrap">
              Custom Services & Assets
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
