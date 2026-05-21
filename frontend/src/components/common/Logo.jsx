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
    sm: "text-lg",
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
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-blue-500 to-emerald-400 rounded-xl transform group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-indigo-500/30" />
        <div className="absolute inset-0.5 bg-gradient-to-tl from-white/10 to-transparent rounded-xl flex items-center justify-center backdrop-blur-sm overflow-hidden">
           {/* Geometric refractive lines */}
           <div className="absolute top-0 left-0 w-full h-px bg-white/20 rotate-45 translate-y-2" />
           <div className="absolute bottom-0 right-0 w-full h-px bg-white/20 rotate-45 -translate-y-2" />
           <div className="absolute top-0 right-0 w-px h-full bg-white/20 rotate-45 -translate-x-2" />
           <div className="absolute bottom-0 left-0 w-px h-full bg-white/20 rotate-45 translate-x-2" />
           
           <span className="text-white font-black italic tracking-tighter transform -skew-x-12 select-none">L</span>
        </div>
        
        {/* Glowing aura */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-extrabold tracking-[0.12em] uppercase leading-none bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(99,102,241,0.25)]",
            textClasses[size]
          )}>
            LERNNOVA
          </span>
          {showSlogan && (
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-1 whitespace-nowrap">
              Digital Marketplace
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
