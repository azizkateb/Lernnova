import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Download, Filter, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getProducts } from '../../api/productsApi';
import { extractArray, extractPagination } from '../../utils/apiResponse';
import ProductCard from '../../components/marketplace/ProductCard';
import FreebieCard from '../../components/marketplace/FreebieCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { marketplaceCategories } from '../../utils/constants';
import SEO from '../../components/common/SEO';
import { useLanguage } from '../../context/LanguageContext';

const Products = () => {
  const { t, isRTL, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [params, setParams] = useState({ page: 1, limit: 12 });
  const activeCategory = searchParams.get('category') || 'all';
  const isFreebiesActive = activeCategory === 'freebies';
  const scrollContainerRef = useRef(null);

  // Map UI language to product language
  const productLanguage = language === 'ar' ? 'ar' : language === 'de' ? 'de' : 'en';

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ ...params, search, language: productLanguage });
      const items = extractArray(data, ['products', 'items']);
      setProducts(items);
      setParams(prev => ({ ...prev, ...extractPagination(data, items) }));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [params.page, params.limit, search, productLanguage]);

  const handleCategorySelect = (categorySlug) => {
    if (categorySlug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categorySlug);
    }
    setSearchParams(searchParams);
  };

  const getProductCategoryText = (product) => {
    const category = product?.category;
    if (!category) return '';
    if (typeof category === 'string') return category.toLowerCase();
    if (typeof category === 'object') {
      const v = category.slug || category.label || category.name || '';
      return String(v).toLowerCase();
    }
    return String(category).toLowerCase();
  };

  const displayedProducts = products.filter(product => {
    if (activeCategory === 'all') return true;
    const prodCat = getProductCategoryText(product);
    
    if (activeCategory === 'pdf-books') {
      return prodCat.includes('pdf') || prodCat.includes('book');
    }
    if (activeCategory === 'ebooks-plr') {
      return prodCat.includes('ebook') || prodCat.includes('plr') || prodCat.includes('book');
    }
    if (activeCategory === 'workbooks-planners') {
      return prodCat.includes('workbook') || prodCat.includes('planner') || prodCat.includes('assets');
    }
    if (activeCategory === 'templates') {
      return prodCat.includes('template') || prodCat.includes('assets');
    }
    if (activeCategory === 'digital-courses') {
      return prodCat.includes('course') || prodCat.includes('tutorial');
    }
    if (activeCategory === 'digital-tools-software') {
      return prodCat.includes('tool') || prodCat.includes('software') || prodCat.includes('code');
    }
    if (activeCategory === 'freebies') {
      return Number(product.price) === 0 && (!product.language || product.language === productLanguage);
    }
    
    return prodCat === activeCategory.toLowerCase();
  });

  return (
    <div className="bg-transparent min-h-screen transition-colors duration-500">
      <SEO 
        title={t('pages.products.seoTitle')}
        description={t('pages.products.seoDesc')}
      />
      <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-slate-100/30 dark:border-slate-800/20 py-20 relative overflow-hidden">
        <div className={`absolute inset-0 ${isFreebiesActive ? 'bg-linear-to-r from-cyan-500/8 via-sky-500/6 to-transparent dark:from-slate-950/20' : 'bg-linear-to-r from-indigo-500/6 to-transparent dark:from-slate-950/20'} pointer-events-none`} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-slate-900 dark:text-white">
           <span className={`inline-block px-3 py-1 text-[10px] font-bold tracking-wider rounded-lg mb-4 border ${isFreebiesActive ? 'bg-cyan-50/80 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border-cyan-100 dark:border-cyan-900/30' : 'bg-indigo-50/80 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/30'}`}>
             {isFreebiesActive ? t('freebies.freeResource', 'Free resource') : t('pages.products.badge', 'Verified Digital Products')}
           </span>
           <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
             {isFreebiesActive ? (
               <span className="font-serif italic text-cyan-700 dark:text-cyan-300">{t('freebies.title', 'Freebies')}</span>
             ) : (
               <>
                 {t('pages.products.headingPrefix')}{' '}
                 <span className="font-serif italic text-indigo-600 dark:text-indigo-400">
                   {t('pages.products.headingAccent')}
                 </span>
               </>
             )}
           </h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mb-12 text-base md:text-lg">
             {isFreebiesActive ? t('freebies.subtitle', 'Discover free digital products, templates, and starter resources.') : t('pages.products.subtitle')}
           </p>
           
           <div className="max-w-xl relative">
             <div className="search-ui-grid"></div>
             <div className="search-ui-poda">
               <div className="search-ui-glow"></div>
               <div className="search-ui-darkBorderBg"></div>
               <div className="search-ui-darkBorderBg"></div>
               <div className="search-ui-darkBorderBg"></div>
               <div className="search-ui-white"></div>
               <div className="search-ui-border"></div>

               <div className="search-ui-main">
                 <input 
                   placeholder={t('pages.products.searchPlaceholder')}
                   type="text" 
                   name="text" 
                   className="search-ui-input" 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
                 <div className="search-ui-input-mask"></div>
                 <div className="search-ui-accent-mask"></div>
                 <div className="search-ui-filterBorder"></div>
                 <div className="search-ui-filter-icon" onClick={fetchProducts} title={t('pages.products.filterTitle')}>
                   <svg
                     preserveAspectRatio="none"
                     height="27"
                     width="27"
                     viewBox="4.8 4.56 14.832 15.408"
                     fill="none"
                   >
                     <path
                       d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"
                       stroke="#e2e8f0"
                       strokeWidth="1.2"
                       strokeMiterlimit="10"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                     ></path>
                   </svg>
                 </div>
                 <div className="search-ui-search-icon">
                   <svg
                     xmlns="http://www.w3.org/2000/svg"
                     width="22"
                     height="22"
                     viewBox="0 0 24 24"
                     strokeWidth="2"
                     strokeLinejoin="round"
                     strokeLinecap="round"
                     fill="none"
                     className="text-slate-200"
                   >
                     <circle stroke="url(#searchThemeGrad)" r="8" cy="11" cx="11"></circle>
                     <line
                       stroke="url(#searchThemeGradL)"
                       y2="16.65"
                       y1="22"
                       x2="16.65"
                       x1="22"
                     ></line>
                     <defs>
                       <linearGradient gradientTransform="rotate(50)" id="searchThemeGrad">
                         <stop stopColor="#e0f2fe" offset="0%"></stop>
                         <stop stopColor="#00C4B4" offset="100%"></stop>
                       </linearGradient>
                       <linearGradient id="searchThemeGradL">
                         <stop stopColor="#00C4B4" offset="0%"></stop>
                         <stop stopColor="#4A6CF7" offset="100%"></stop>
                       </linearGradient>
                     </defs>
                   </svg>
                 </div>
               </div>
             </div>

             <div className="hidden">
               <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20 flex gap-2">
                <div className="flex-1 px-4 flex items-center gap-3">
                   <Search className="w-5 h-5 text-emerald-100" />
                   <input 
                     placeholder={t('pages.products.searchPlaceholder')}
                     className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder:text-emerald-100 py-3 text-sm font-medium"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                   />
                </div>
                <button 
                  onClick={fetchProducts}
                  className="bg-white text-emerald-600 px-6 py-2 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  {t('pages.products.searchButton', 'Find')}
                </button>
             </div>
           </div>
        </div>
      </div>
    </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Categories selector horizontal bar/pills */}
        <div className="mb-12">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-1">
            {t('pages.products.filterByCategory')}
          </p>
          <div className="relative group/scroll px-1">
            {/* Left Scroll Button */}
            <button
              onClick={() => handleScroll('left')}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/80 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all opacity-0 group-hover/scroll:opacity-100 focus:opacity-100 focus:outline-none backdrop-blur-md cursor-pointer max-sm:hidden"
              aria-label={t('common.scrollLeft', 'Scroll left')}
            >
              <ChevronLeft className={["w-4 h-4", isRTL ? "rotate-180" : ""].join(" ")} />
            </button>

            {/* Right Scroll Button */}
            <button
              onClick={() => handleScroll('right')}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/80 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all opacity-0 group-hover/scroll:opacity-100 focus:opacity-100 focus:outline-none backdrop-blur-md cursor-pointer max-sm:hidden"
              aria-label={t('common.scrollRight', 'Scroll right')}
            >
              <ChevronRight className={["w-4 h-4", isRTL ? "rotate-180" : ""].join(" ")} />
            </button>

            {/* Scrollable Container with Transparent Mask and custom scrollbar */}
            <div 
              ref={scrollContainerRef}
              className="flex items-center gap-3 overflow-x-auto pb-4 px-2 premium-fade-mask modern-category-scroll"
            >
              <button
                onClick={() => handleCategorySelect('all')}
                className={`flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${
                  activeCategory === 'all'
                    ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-102'
                    : 'bg-white/40 border-slate-100 hover:border-slate-300 dark:bg-slate-900/30 dark:border-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>{t('common.allProducts')}</span>
              </button>

              {marketplaceCategories.map((category) => {
                const IconComponent = LucideIcons[category.icon] || HelpCircle;
                const isSelected = activeCategory === category.slug;
                const isFreebiesCategory = category.slug === 'freebies';
                return (
                  <button
                    key={category.slug}
                    onClick={() => handleCategorySelect(category.slug)}
                    className={`flex items-center gap-2.5 whitespace-nowrap px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${
                      isSelected
                        ? isFreebiesCategory
                          ? 'bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 border-cyan-300/50 dark:border-cyan-400/30 text-white shadow-lg shadow-cyan-500/25 scale-102'
                          : 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-102'
                        : isFreebiesCategory
                          ? 'bg-cyan-50/40 border-cyan-200/40 hover:border-cyan-300/60 dark:bg-slate-900/30 dark:border-cyan-400/15 text-cyan-900 dark:text-cyan-200'
                          : 'bg-white/40 border-slate-100 hover:border-slate-300 dark:bg-slate-900/30 dark:border-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <IconComponent className="w-4.5 h-4.5" />
                    <span>{t(`categories.${category.slug}`, category.label)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchProducts} />
        ) : displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {displayedProducts.map(product => {
              const isFree = Number(product?.price) === 0;
              const Comp = isFree ? FreebieCard : ProductCard;
              return <Comp key={product.id} product={product} />;
            })}
          </div>
        ) : (
          <EmptyState 
            title={t('pages.products.emptyTitle')}
            description={t('pages.products.emptyDesc')}
            icon={Download}
          />
        )}
      </div>
    </div>
  );
};

export default Products;
