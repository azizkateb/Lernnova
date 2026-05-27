import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Search, 
  Zap, 

  ShieldCheck, 
  Users, 
  Download, 
  Globe,
  CheckCircle2,
  Sparkles,
  Gift,
  Plus,
  Briefcase,
  ShoppingBag
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Button from '../../components/common/Button';
import ServiceCard from '../../components/marketplace/ServiceCard';
import ProductCard from '../../components/marketplace/ProductCard';
import FreebieCard from '../../components/marketplace/FreebieCard';
import heroLightBg from '../../assets/hero.png';
import heroDarkBg from '../../assets/hero-dark.png';

import { getServices } from '../../api/servicesApi';
import { getProducts } from '../../api/productsApi';
import { useLanguage } from '../../context/LanguageContext';
import { marketplaceCategories } from '../../utils/constants';
import SEO from '../../components/common/SEO';
import { getStitchCardImage } from '../../utils/cardImages';

const CategoriesSection = () => {
  const { t, isRTL } = useLanguage();
  
  return (
    <section className="relative py-16 md:py-20 bg-white/55 dark:bg-slate-950/35 transition-colors duration-500 border-b border-slate-100/70 dark:border-slate-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs sm:text-sm font-extrabold text-primary uppercase tracking-wide bg-primary/10 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full inline-block mb-4 border border-primary/20">
            {t('home.categories.badge', 'Specialized Digital Assets')}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('home.categories.titlePrefix', 'Browse by')}{' '}
            <span className="font-serif italic text-primary">
              {t('home.categories.titleAccent', 'Category')}
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mt-4">
            {t(
              'home.categories.subtitle',
              'Find exactly what you need to elevate your corporate strategy or client workflow with hand-tested downloadable assets.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {marketplaceCategories.map((category) => {
            const IconComponent = LucideIcons[category.icon] || LucideIcons.Download;
            const image = getStitchCardImage(category.slug);
            const isFreebies = category.slug === 'freebies';
            return (
              <Link 
                to={`/products?category=${category.slug}`} 
                key={category.slug}
                className={[
                  'group select-none rounded-2xl border p-7 flex flex-col justify-between min-h-[270px] transition-shadow duration-200 ease-out relative overflow-hidden',
                  isFreebies
                    ? 'bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-blue-600/20 dark:from-cyan-400/10 dark:via-slate-900/70 dark:to-blue-500/10 border-cyan-300/40 dark:border-cyan-400/20 shadow-[0_20px_60px_-35px_rgba(14,165,233,0.55)] ring-1 ring-cyan-300/10 hover:shadow-[0_20px_60px_-35px_rgba(14,165,233,0.75)]'
                    : 'border-slate-200/60 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_14px_44px_-18px_rgba(2,6,23,0.25)] dark:hover:shadow-[0_16px_52px_-20px_rgba(0,0,0,0.55)] hover:border-slate-300/70 dark:hover:border-slate-700/70',
                ].join(' ')}
              >
                {isFreebies ? (
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-cyan-400/25 blur-3xl" />
                    <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-sky-500/15 blur-3xl" />
                  </div>
                ) : null}

                <div>
                  <div className="mb-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/70 bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 h-36 flex items-center justify-center overflow-hidden relative">
                    <img
                      src={image}
                      alt=""
                      className="h-28 w-28 object-contain transition duration-300 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-9 h-9 bg-white/80 dark:bg-slate-950/40 text-primary border border-slate-200/50 dark:border-slate-800/70 rounded-xl flex items-center justify-center`}>
                      <IconComponent className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    {isFreebies ? (
                      <div className={`absolute bottom-3 ${isRTL ? 'left-3' : 'right-3'}`}>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 dark:bg-slate-950/40 border border-cyan-300/30 dark:border-cyan-400/20 px-3 py-1 text-[11px] font-bold text-cyan-800 dark:text-cyan-200">
                          <Gift className="w-3.5 h-3.5" />
                          {t('freebies.free', t('common.free', 'Free'))}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                    {t(`categories.${category.slug}`, category.label)}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed font-semibold">
                    {t(`categoriesDesc.${category.slug}`, category.description)}
                  </p>
                </div>
                
                <div className="mt-8 pt-4 border-t border-slate-100/60 dark:border-slate-850/60 flex items-center justify-between text-xs font-bold">
                  <span className={isFreebies ? 'text-cyan-700 dark:text-cyan-200 font-bold tracking-wider' : 'text-sky-600 dark:text-sky-400 font-bold tracking-wider'}>
                    {isFreebies ? t('freebies.freeResource', 'Free resource') : 'Lernnova'}
                  </span>
                  <div className={isFreebies ? 'flex items-center gap-1.5 text-cyan-700 dark:text-cyan-200' : 'flex items-center gap-1.5 text-primary'}>
                    <span>{isFreebies ? t('freebies.cta', 'Browse freebies') : t('common.explore', 'Explore')}</span>
                    <LucideIcons.ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const TrustStats = () => {
  const { t } = useLanguage();
  const stats = [
    {
      icon: ShieldCheck,
      title: t('home.trustStats.secureTitle', 'Secure Payments'),
      desc: t('home.trustStats.secureDesc', 'Protected checkout and verified sellers.'),
      tone: 'from-indigo-500/12 via-sky-500/10 to-transparent dark:from-indigo-500/18 dark:via-sky-500/10',
    },
    {
      icon: Download,
      title: t('home.trustStats.instantTitle', 'Instant Delivery'),
      desc: t('home.trustStats.instantDesc', 'Digital products delivered instantly after purchase.'),
      tone: 'from-cyan-500/12 via-indigo-500/10 to-transparent dark:from-cyan-500/16 dark:via-indigo-500/10',
    },
    {
      icon: Globe,
      title: t('home.trustStats.globalTitle', 'Global & Multilingual'),
      desc: t('home.trustStats.globalDesc', 'Built for English, Arabic, and German experiences.'),
      tone: 'from-sky-500/12 via-cyan-500/10 to-transparent dark:from-sky-500/16 dark:via-cyan-500/10',
    },
    {
      icon: Users,
      title: t('home.trustStats.proTitle', 'Expert Marketplace'),
      desc: t('home.trustStats.proDesc', 'Hire specialists or shop premium assets in one place.'),
      tone: 'from-indigo-500/12 via-cyan-500/10 to-transparent dark:from-indigo-500/18 dark:via-cyan-500/10',
    },
  ];

  return (
    <section className="py-16 md:py-20 border-y border-slate-100/70 dark:border-slate-800/40 bg-white/35 dark:bg-slate-950/25 backdrop-blur-md transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className={`rounded-2xl border border-slate-200/60 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden`}
            >
              <div className={`p-6 bg-linear-to-br ${stat.tone}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{stat.title}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{stat.desc}</p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-white/70 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center shrink-0">
                    <stat.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest mb-8">
            {t('home.trusted', 'Trusted by modern teams')}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-40 grayscale transition-all duration-200 dark:opacity-100">
            {['Stripe Connect', 'Vercel Labs', 'Linear Co', 'Figma Partner', 'AWS Growth'].map(brand => (
              <span key={brand} className="text-lg md:text-xl font-black text-slate-950 dark:text-white italic tracking-tighter">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const AccountTypeBox = ({ title, desc, buttonLabel, to, icon: Icon }) => {
  return (
    <div className="bg-white/70 dark:bg-white/[0.08] backdrop-blur-md p-6 rounded-2xl shadow-[0_18px_60px_-24px_rgba(0,0,0,0.6)] text-center border border-slate-200/70 dark:border-white/10 h-full min-h-[220px] flex flex-col">
      <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 leading-snug">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-5 text-sm font-semibold leading-6 break-words">{desc}</p>
      <div className="mt-auto">
        <Link to={to}>
          <Button className="w-full" size="md" variant="accent">{buttonLabel}</Button>
        </Link>
      </div>
    </div>
  );
};

const SellerBuyerCtaPanel = () => {
  const { t } = useLanguage();
  const sellerHighlight = t('home.sellerCTA.highlight', 'digital files');

  return (
    <section className="py-6 sm:py-8 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/60 dark:bg-slate-950/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden relative border border-slate-200/50 dark:border-white/10 shadow-2xl shadow-sky-500/10 dark:shadow-cyan-500/10">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-28 -right-28 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-28 -left-28 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 px-7 py-12 md:p-12 lg:p-14 grid items-center gap-8 lg:grid-cols-[0.95fr_1.25fr]">
            <div className="max-w-xl text-center lg:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-950 dark:text-white mb-6 tracking-tight leading-tight">
                {t('home.sellerCTA.title').split(sellerHighlight).map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="font-serif italic text-accent">{sellerHighlight}</span>}
                  </React.Fragment>
                ))}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg mb-10 leading-relaxed font-medium">
                {t('home.sellerCTA.subtitle')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <span dir="auto" className="unicode-bidi-plaintext">{t('home.sellerCTA.feature1')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <span dir="auto" className="unicode-bidi-plaintext">{t('home.sellerCTA.feature2')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <span dir="auto" className="unicode-bidi-plaintext">{t('home.sellerCTA.feature3')}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <AccountTypeBox
                title={t('home.sellerCTA.cardTitle', 'Create seller profile')}
                desc={t('home.sellerCTA.cardDesc')}
                buttonLabel={t('home.sellerCTA.button', 'Get Started')}
                to="/register?role=seller"
                icon={Briefcase}
              />
              <AccountTypeBox
                title={t('home.profileCta.buyerTitle', 'Create buyer account')}
                desc={t('home.profileCta.buyerDesc', 'Buy digital products and services')}
                buttonLabel={t('home.profileCta.buyerButton', 'Start buying')}
                to="/register?role=buyer"
                icon={ShoppingBag}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Hero = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const highlightTerm = t('hero.highlightTerm', 'downloadable assets');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <section className="relative isolate transition-colors duration-500">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-95 transition-opacity duration-700 dark:opacity-0"
        style={{ backgroundImage: `url(${heroLightBg})` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-0 transition-opacity duration-700 dark:opacity-95"
        style={{ backgroundImage: `url(${heroDarkBg})` }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-white/60 via-white/50 to-slate-50/60 dark:from-slate-950/65 dark:via-slate-950/55 dark:to-slate-950/70"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.60)_68%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.68)_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-20 mx-auto flex max-w-5xl flex-col items-center px-4 pt-24 pb-14 text-center sm:px-6 lg:pt-28 sm:pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-full mb-6">
          <span className="w-2.5 h-2.5 bg-primary rounded-full" />
          <span className="text-xs sm:text-sm font-extrabold text-primary uppercase tracking-wide">{t('hero.badge')}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
          {t('hero.title').split(highlightTerm).map((part, index, array) => (
            <React.Fragment key={index}>
              {part}
              {index < array.length - 1 && <span className="text-cyan-600 dark:text-cyan-300"> {highlightTerm} </span>}
            </React.Fragment>
          ))}
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-8 max-w-3xl">
          {t('hero.subtitle')}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center">
          <Link to="/services" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto px-7" size="lg" variant="primary" icon={ArrowRight}>
              {t('hero.exploreServices', 'Explore Services')}
            </Button>
          </Link>
          <Link to="/products" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto px-7" size="lg" variant="outline">
              {t('hero.browseProducts', 'Browse Products')}
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="w-full mt-8 sm:mt-10 mx-auto max-w-xl">
          <div className="rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_2px_10px_-6px_rgba(15,23,42,0.25)] flex items-center overflow-hidden">
            <input
              placeholder={t('hero.searchPlaceholder')}
              type="text"
              name="text"
              className="w-full bg-transparent px-4 py-3.5 text-slate-700 dark:text-slate-100 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="px-4 py-3.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:via-blue-500 hover:to-cyan-400 text-white">
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </form>

        <div className="mt-6 w-full sm:mt-8 lg:mt-10">
          <SellerBuyerCtaPanel />
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const { t } = useLanguage();
  const steps = [
    { title: t('home.features.step1Title'), description: t('home.features.step1Desc'), icon: Search, imageKey: 'digital-courses' },
    { title: t('home.features.step2Title'), description: t('home.features.step2Desc'), icon: Zap, imageKey: 'templates' },
    { title: t('home.features.step3Title'), description: t('home.features.step3Desc'), icon: Users, imageKey: 'digital-tools' },
    { title: t('home.features.step4Title'), description: t('home.features.step4Desc'), icon: Download, imageKey: 'pdf-books' },
  ];

  return (
    <section className="py-16 md:py-20 bg-slate-50/70 dark:bg-slate-900/40 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">{t('home.features.title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">{t('home.features.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="bg-white/80 dark:bg-slate-900/70 p-7 rounded-2xl border border-slate-200/60 dark:border-slate-800/70 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_14px_44px_-18px_rgba(2,6,23,0.22)] dark:hover:shadow-[0_16px_52px_-20px_rgba(0,0,0,0.55)] transition-shadow duration-200 ease-out backdrop-blur-md">
                <div className="mb-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/70 bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 h-36 flex items-center justify-center overflow-hidden relative">
                  <img
                    src={getStitchCardImage(step.imageKey)}
                    alt=""
                    className="h-28 w-28 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-3 right-3 w-9 h-9 bg-white/80 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/70 rounded-xl flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyLernnova = () => {
  const { t } = useLanguage();
  const points = [
    {
      icon: ShieldCheck,
      title: t('home.why.securityTitle', 'Trust-first marketplace'),
      desc: t('home.why.securityDesc', 'Clear listings, safer transactions, and a premium purchasing experience.'),
      imageKey: 'digital-tools',
    },
    {
      icon: Sparkles,
      title: t('home.why.qualityTitle', 'Curated quality'),
      desc: t('home.why.qualityDesc', 'Handpicked products and serious professionals—built for real work.'),
      imageKey: 'templates',
    },
    {
      icon: Globe,
      title: t('home.why.globalTitle', 'Built for global audiences'),
      desc: t('home.why.globalDesc', 'Comfortable RTL/LTR layouts with thoughtful typography and spacing.'),
      imageKey: 'digital-courses',
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white/40 dark:bg-slate-950/25 border-y border-slate-100/70 dark:border-slate-800/40 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs sm:text-sm font-extrabold text-sky-700 dark:text-sky-300 uppercase tracking-wide bg-sky-50/80 dark:bg-sky-950/30 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full inline-block mb-4 border border-sky-200/60 dark:border-sky-900/30">
            {t('home.why.badge', 'Why Lernnova')}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('home.why.title', 'Calm, organized, professional')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mt-4">
            {t('home.why.subtitle', 'A marketplace that feels consistent—on every page, in every language, in light and dark.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {points.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/70 p-8 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_14px_44px_-18px_rgba(2,6,23,0.22)] dark:hover:shadow-[0_16px_52px_-20px_rgba(0,0,0,0.55)] transition-shadow duration-200 ease-out backdrop-blur-md"
            >
              <div className="mb-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/70 bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 h-36 flex items-center justify-center overflow-hidden relative">
                <img
                  src={getStitchCardImage(p.imageKey)}
                  alt=""
                  className="h-28 w-28 object-contain"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-3 right-3 w-9 h-9 bg-white/80 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/70 rounded-xl flex items-center justify-center">
                  <p.icon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{p.title}</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const { t, language } = useLanguage();
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredFreebies, setFeaturedFreebies] = useState([]);
  const [featuredProductsLoading, setFeaturedProductsLoading] = useState(true);
  const servicesHighlight = t('home.services.highlight', 'services');
  const productsHighlight = t('home.products.highlight', 'products');

  useEffect(() => {
    // Map UI language to product language
    const productLanguage = language === 'ar' ? 'ar' : language === 'de' ? 'de' : 'en';

    const fetchFeatured = async () => {
      try {
        const sData = await getServices({ limit: 4 });
        setFeaturedServices(sData.data || sData.services || []);
      } catch (err) {
        console.error('Failed to fetch featured services', err);
        setFeaturedServices([]);
      }

      try {
        setFeaturedProductsLoading(true);
        const featuredProductsResponse = await getProducts({
          limit: 4,
          featured: true,
          language: productLanguage,
        });

        const extractProducts = (response) => response?.products || response?.data || [];
        let products = extractProducts(featuredProductsResponse);

        if (!Array.isArray(products) || products.length === 0) {
          const fallbackProductsResponse = await getProducts({
            limit: 4,
            language: productLanguage,
          });
          products = extractProducts(fallbackProductsResponse);
        }

        setFeaturedProducts(Array.isArray(products) ? products : []);
      } catch (err) {
        console.error('Failed to fetch featured products', err);
        setFeaturedProducts([]);
      } finally {
        setFeaturedProductsLoading(false);
      }

      try {
        const fData = await getProducts({ limit: 12, language: productLanguage });
        const freebies = (fData.data || fData.products || [])
          .filter((p) => Number(p?.price) === 0)
          .slice(0, 4);
        setFeaturedFreebies(freebies);
      } catch (err) {
        console.error('Failed to fetch featured freebies', err);
        setFeaturedFreebies([]);
      }
    };
    fetchFeatured();
  }, [language]);

  return (
    <div className="bg-transparent transition-colors duration-500">
      <SEO 
        title={t(
          'pages.home.seoTitle',
          'Lernnova | Global Digital Services & Downloadable Products'
        )}
        description={t(
          'pages.home.seoDesc',
          'Hire elite professionals for custom development and design. Browse hand-tested downloadable products, templates, resources, and premium assets on Lernnova.'
        )}
      />
      <Hero />
      <CategoriesSection />

      {/* Services Section */}
      <section className="py-16 md:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-slate-100/70 dark:border-slate-800/50 pb-7">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <span className="text-xs sm:text-sm font-extrabold text-sky-700 dark:text-sky-300 uppercase tracking-wide bg-sky-50/75 dark:bg-sky-950/30 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-sky-200/60 dark:border-sky-900/30">
                  {t('home.services.badge', 'On-Demand Talent')}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('home.services.title').split(servicesHighlight).map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="font-serif italic text-primary">{servicesHighlight}</span>}
                  </React.Fragment>
                ))}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-3 max-w-2xl text-base">
                {t('home.services.subtitle')}
              </p>
            </div>
            <Link to="/services" className="shrink-0">
              <Button variant="outline" icon={ArrowRight}>{t('home.services.viewAll')}</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.length > 0 ? (
              featuredServices.map(service => (
                <ServiceCard key={`service-${service.id}`} service={service} />
              ))
            ) : (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-3/4 bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-slate-100/70 dark:border-slate-800/50 pb-7">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <span className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide bg-indigo-50/75 dark:bg-indigo-950/30 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-indigo-200/60 dark:border-indigo-900/30">
                  {t('home.products.badge', 'Premium Digital Store')}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('home.products.title').split(productsHighlight).map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="font-serif italic text-primary">{productsHighlight}</span>}
                  </React.Fragment>
                ))}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-3 max-w-2xl text-base">
                {t('home.products.subtitle')}
              </p>
            </div>
            <Link to="/products" className="shrink-0">
              <Button variant="outline" icon={ArrowRight}>{t('home.products.browse')}</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProductsLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse" />
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <ProductCard key={`product-${product.id}`} product={product} />
              ))
            ) : (
              <div className="col-span-full">
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/60 px-6 py-10 text-center">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('home.products.empty', 'No products available yet.')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {featuredFreebies.length > 0 ? (
        <section className="py-16 md:py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-slate-100/70 dark:border-slate-800/50 pb-7">
              <div>
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs sm:text-sm font-extrabold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide bg-cyan-50/75 dark:bg-cyan-950/30 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-cyan-200/60 dark:border-cyan-900/30">
                  {t('home.freebies.badge', 'Free Digital Downloads')}
                </span>
              </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('home.freebies.title', 'Free resources to get started')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-3 max-w-2xl text-base">
                  {t('home.freebies.subtitle', 'High-quality starter files—clean, usable, and ready for real work.')}
                </p>
              </div>
              <Link to="/freebies" className="shrink-0">
                <Button variant="outline" icon={ArrowRight}>{t('home.freebies.viewAll', 'View all freebies')}</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredFreebies.map((product) => (
                <FreebieCard key={`freebie-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Features />

      <WhyLernnova />

      {/* Bottom Premium CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-tr from-[#070912] via-[#0b1630] to-[#070912] rounded-[2.5rem] relative overflow-hidden shadow-2xl p-10 md:p-16 text-center border border-slate-800/70">
            <div className="absolute inset-0 bg-pattern opacity-[0.035] pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/10">
                <Sparkles className="w-5 h-5 text-cyan-300" />
                <span className="text-xs sm:text-sm font-extrabold text-cyan-200 uppercase tracking-wide">
                  {t('home.bottomCta.badge', 'Empower Your Vision')}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tight leading-tight">
                {t('home.bottomCta.titlePrefix', 'Ready to expand your')}{' '}
                <span className="font-serif italic text-cyan-300">
                  {t('home.bottomCta.titleAccent', 'digital horizon?')}
                </span>
              </h2>
              <p className="text-indigo-200/90 text-sm md:text-base mb-10 max-w-xl mx-auto font-medium">
                {t(
                  'home.bottomCta.subtitle',
                  'Instantly connect with top-tier agencies or discover beautiful, secure templates and downloadable tools.'
                )}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/services" className="w-full sm:w-auto">
                  <Button size="lg" variant="primary" icon={ArrowRight} className="w-full px-8">
                    {t('common.exploreServices')}
                  </Button>
                </Link>
                <Link to="/products" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" icon={Download} className="w-full px-8 bg-white/5 border-white/20 text-white hover:bg-white/10">
                    {t('home.bottomCta.browseMarketplace', 'Browse Marketplace')}
                  </Button>
                </Link>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" variant="ghost" icon={Plus} className="w-full text-slate-200 hover:text-white hover:bg-white/5">
                    {t('home.bottomCta.startSelling', 'Start Selling')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustStats />
    </div>
  );
};

export default Home;
