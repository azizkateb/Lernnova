import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Wifi, Battery, Shield, Sparkles } from 'lucide-react';

const PhoneMockup = ({ children, className }) => {
  const { isRTL } = useLanguage();

  return (
    <div className={`relative w-full max-w-sm sm:max-w-md mx-auto aspect-[9/19] ${className}`}>
      {/* Outer ambient glow */}
      <div className="absolute -inset-4 bg-linear-to-r from-primary/30 via-indigo-500/20 to-accent/30 rounded-[3rem] opacity-75 blur-2xl pointer-events-none animate-pulse duration-5000" />
      
      {/* Phone device wrapper */}
      <div className="relative w-full h-full bg-slate-950 rounded-[2.8rem] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10 ring-1 ring-slate-800 flex flex-col overflow-hidden">
        
        {/* Device ear speaker / notch bar */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-full z-30 flex items-center justify-center border border-white/5 shadow-inner">
          <div className="w-16 h-1 bg-slate-800 rounded-full mb-1" />
          <div className="w-2.5 h-2.5 bg-indigo-950 rounded-full absolute right-3 ring-1 ring-white/10 flex items-center justify-center">
            <div className="w-1 h-1 bg-blue-400 rounded-full" />
          </div>
        </div>

        {/* Outer glass glare reflection */}
        <div className="absolute inset-0 rounded-[2.2rem] bg-linear-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20" />

        {/* Inner Phone Screen Content */}
        <div className="relative w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 rounded-[2rem] overflow-hidden flex flex-col border border-slate-900 z-10">
          
          {/* Top Status Bar Inside Device */}
          <div className={`h-12 px-6 pt-7 flex items-center justify-between z-20 text-white/70 text-xs font-semibold select-none ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="font-mono tracking-tight text-[11px]">09:41</span>
            
            {/* Minimal standard mobile indicator icons */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              <Wifi className="w-3 h-3" />
              <div className="w-5 h-2.5 border border-white/30 rounded-xs p-0.5 flex items-center">
                <div className="h-full w-full bg-white/80 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Interactive Screen Container */}
          <div className="flex-1 flex flex-col justify-start px-5 sm:px-7 pb-6 pt-2 overflow-y-auto no-scrollbar relative">
            {children}
          </div>

          {/* Home indicator bar at phone bottom */}
          <div className="h-4 flex items-center justify-center z-20 pb-2.5">
            <div className="w-32 h-1 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
