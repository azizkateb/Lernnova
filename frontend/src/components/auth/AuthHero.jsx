import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Logo from '../common/Logo';
import { ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';

const AuthHero = ({ backgroundImage, title, subtitle }) => {
  const { t, isRTL } = useLanguage();

  const heroImage = backgroundImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80";

  return (
    <div className="hidden lg:flex flex-col justify-between bg-slate-950 p-12 xl:p-16 text-white relative overflow-hidden h-full min-h-screen lg:min-h-full w-full border-r border-white/5">
      {/* Background with multiple gradient overlays */}
      <img 
        src={heroImage} 
        alt="Lernnova Digital Hero"
        className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen scale-102 transition-transform duration-10000 hover:scale-105"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/95 via-indigo-950/85 to-indigo-950/40" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-accent/15 rounded-full blur-3xl animate-pulse" />

      {/* Brand Logo placement with standard alignment */}
      <div className="relative z-10 self-start">
        <Logo size="md" className="!text-white" showSlogan={true} />
      </div>

      {/* Primary Brand Messaging */}
      <div className="relative z-10 my-auto max-w-lg mt-12 mb-16">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-accent mb-6 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Global Hybrid Marketplace</span>
        </div>
        
        <h2 className="text-4xl xl:text-5xl font-extralight leading-none mb-6 tracking-tight">
          {title || "Unleash extreme digital leverage."}
        </h2>
        
        <p className="text-slate-300 text-base xl:text-lg leading-relaxed font-normal">
          {subtitle || "Discover premium blueprints, pre-tested customizable templates, and secure freelance experts ready to scale your operational workflow."}
        </p>
      </div>

      {/* Glassmorphic feature blocks at the base */}
      <div className="relative z-10 grid grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md hover:bg-white/8 transition-all duration-300">
          <div className="w-9 h-9 bg-primary/20 rounded-lg flex items-center justify-center text-primary mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold mb-1 text-white">Secure Escrow</h4>
          <p className="text-[10px] text-slate-400 font-medium">Funds remain entirely safe till final product sign-off.</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md hover:bg-white/8 transition-all duration-300">
          <div className="w-9 h-9 bg-accent/20 rounded-lg flex items-center justify-center text-accent mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold mb-1 text-white">Instant Delivery</h4>
          <p className="text-[10px] text-slate-400 font-medium font-medium">Instant access to files, tools, coursewares and assets.</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md hover:bg-white/8 transition-all duration-300">
          <div className="w-9 h-9 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 mb-3">
            <Globe className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold mb-1 text-white">Global Scale</h4>
          <p className="text-[10px] text-slate-400 font-medium">Curating verified freelancers and top developers worldwide.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthHero;
