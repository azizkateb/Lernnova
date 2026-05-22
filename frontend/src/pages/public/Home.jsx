import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Search, 
  Zap, 
  ShieldCheck, 
  Users, 
  Download, 
  Star,
  CheckCircle2,
  Globe,
  Sparkles,
  Plus,
  Briefcase,
  Layers,
  ShoppingBag
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ServiceCard from '../../components/marketplace/ServiceCard';
import ProductCard from '../../components/marketplace/ProductCard';

import { getServices } from '../../api/servicesApi';
import { getProducts } from '../../api/productsApi';
import { useLanguage } from '../../context/LanguageContext';
import { marketplaceCategories } from '../../utils/constants';
import { cn } from '../../utils/cn';
import SEO from '../../components/common/SEO';

const CategoriesSection = () => {
  const { t, isRTL } = useLanguage();
  
  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-500 border-t border-slate-50 dark:border-slate-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full inline-block mb-4 border border-primary/20">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {marketplaceCategories.map((category) => {
            const IconComponent = LucideIcons[category.icon] || LucideIcons.Download;
            return (
              <Link 
                to={`/products?category=${category.slug}`} 
                key={category.slug}
                className="uiverse-category-card group select-none"
              >
                <div>
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900/60 text-primary border border-slate-100 dark:border-slate-800/80 rounded-2xl flex items-center justify-center mb-6 shadow-xs">
                    <IconComponent className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                    {t(`categories.${category.slug}`, category.label)}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed font-semibold">
                    {t(`categoriesDesc.${category.slug}`, category.description)}
                  </p>
                </div>
                
                <div className="mt-8 pt-4 border-t border-slate-100/60 dark:border-slate-850/60 flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    Lernnova
                  </span>
                  <div className="flex items-center gap-1.5 text-primary">
                    <span>{t('common.explore', 'Explore')}</span>
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

const Hero = () => {
  const { t, language, isRTL } = useLanguage();
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
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-sky-50/60 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-sky-100/60 dark:bg-sky-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-12 w-96 h-96 bg-sky-100/40 dark:bg-sky-900/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-5xl flex-col items-center justify-center py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{t('hero.badge')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-950 dark:text-white max-w-5xl leading-tight">
            {t('hero.title').split(highlightTerm).map((part, index, array) => (
              <React.Fragment key={index}>
                {part}
                {index < array.length - 1 && <span className="text-sky-500"> {highlightTerm} </span>}
              </React.Fragment>
            ))}
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-8">
            {t('hero.subtitle')}
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/services">
              <button className="rounded-xl px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium">{t('hero.exploreServices', 'Explore Services')}</button>
            </Link>
            <Link to="/products">
              <button className="rounded-xl px-6 py-3 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">{t('hero.browseProducts', 'Browse Products')}</button>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-2xl mt-8">
            <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center overflow-hidden">
              <input
                placeholder={t('hero.searchPlaceholder')}
                type="text"
                name="text"
                className="w-full bg-transparent px-4 py-3 text-slate-700 dark:text-slate-100 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-3 mt-6 text-xs">
            <span className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 text-slate-700 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-sky-500" />{t('hero.trust.verifiedSellers')}
            </span>
            <span className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 text-slate-700 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-sky-500" />{t('hero.trust.secureCheckout')}
            </span>
            <span className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 text-slate-700 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-sky-500" />{t('hero.trust.digitalDownloads')}
            </span>
            <span className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 text-slate-700 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-sky-500" />{t('hero.trust.serviceMessaging')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const { t } = useLanguage();
  const steps = [
    { title: t('home.features.step1Title'), description: t('home.features.step1Desc'), icon: Search },
    { title: t('home.features.step2Title'), description: t('home.features.step2Desc'), icon: Zap },
    { title: t('home.features.step3Title'), description: t('home.features.step3Desc'), icon: Users },
    { title: t('home.features.step4Title'), description: t('home.features.step4Desc'), icon: Download },
  ];

  return (
    <section className="py-32 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">{t('home.features.title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">{t('home.features.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 bg-accent/10 dark:bg-accent/20 text-accent rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{step.description}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 translate-y-[-50%] z-20">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-sm">
                    <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  </div>
                </div>
              )}
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
  const servicesHighlight = t('home.services.highlight', 'services');
  const productsHighlight = t('home.products.highlight', 'products');
  const sellerHighlight = t('home.sellerCTA.highlight', 'expertise');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const sData = await getServices({ limit: 4 });
        const pData = await getProducts({ limit: 4 });
        setFeaturedServices(sData.data || sData.services || []);
        setFeaturedProducts(pData.data || pData.products || []);
      } catch (err) {
        console.error('Failed to fetch featured items', err);
      }
    };
    fetchFeatured();
  }, []);

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
      
      {/* Services Section */}
      <section className="py-24 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 border-b border-slate-100 dark:border-slate-800/50 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50/75 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredServices.length > 0 ? (
              featuredServices.map(service => (
                <ServiceCard key={service.id} service={service} />
              ))
            ) : (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-3/4 bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>

      <Features />

      <CategoriesSection />

      {/* Products Section */}
      <section className="py-24 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 border-b border-slate-100 dark:border-slate-800/50 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-indigo-500" />
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50/75 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md">
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto bg-secondary rounded-[3rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-accent/10 to-transparent pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 px-8 py-20 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tight leading-tight">
                {t('home.sellerCTA.title').split(sellerHighlight).map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="font-serif italic text-accent">{sellerHighlight}</span>}
                  </React.Fragment>
                ))}
              </h2>
              <p className="text-slate-300 text-lg mb-10 leading-relaxed font-medium">
                {t('home.sellerCTA.subtitle')}
              </p>
              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                 <div className="flex items-center gap-2 text-slate-100 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    <span>{t('home.sellerCTA.feature1')}</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-100 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    <span>{t('home.sellerCTA.feature2')}</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-100 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    <span>{t('home.sellerCTA.feature3')}</span>
                 </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl shadow-black/20 text-center max-w-sm">
               <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{t('home.sellerCTA.cardTitle')}</h3>
               <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm font-medium">{t('home.sellerCTA.cardDesc')}</p>
               <Link to="/register">
                 <Button className="w-full py-4 text-base" size="lg" variant="accent">{t('home.sellerCTA.button')}</Button>
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Premium CTA */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="max-w-6xl mx-auto bg-gradient-to-tr from-slate-905 via-indigo-950 to-slate-905 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 rounded-[2.5rem] relative overflow-hidden shadow-2xl p-12 md:p-20 text-center border border-slate-800">
          <div className="absolute inset-0 bg-pattern opacity-5 pointer-events-none" />
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/10">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest leading-none">
                {t('home.bottomCta.badge', 'Empower Your Vision')}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tight leading-tight">
              {t('home.bottomCta.titlePrefix', 'Ready to expand your')}{' '}
              <span className="font-serif italic text-emerald-400">
                {t('home.bottomCta.titleAccent', 'digital horizon?')}
              </span>
            </h2>
            <p className="text-indigo-200 text-sm md:text-base mb-10 max-w-xl mx-auto font-medium">
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
                <Button size="lg" variant="ghost" icon={Plus} className="w-full text-slate-300 hover:text-white hover:bg-white/5">
                  {t('home.bottomCta.startSelling', 'Start Selling')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-12">{t('home.trusted')}</p>
           <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-500 dark:invert dark:opacity-20 hover:dark:opacity-50">
              {['Stripe Connect', 'Vercel Labs', 'Linear Co', 'Figma Partner', 'AWS Growth'].map(brand => (
                <span key={brand} className="text-xl md:text-2xl font-black text-slate-950 dark:text-white italic tracking-tighter">{brand}</span>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
