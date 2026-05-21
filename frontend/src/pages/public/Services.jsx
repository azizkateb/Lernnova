import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { getServices } from '../../api/servicesApi';
import { extractArray, extractPagination } from '../../utils/apiResponse';
import ServiceCard from '../../components/marketplace/ServiceCard';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import SEO from '../../components/common/SEO';
import { useLanguage } from '../../context/LanguageContext';

const Services = () => {
  const { t } = useLanguage();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [params, setParams] = useState({ page: 1, limit: 12 });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getServices({ ...params, search });
      const items = extractArray(data, ['services', 'items']);
      setServices(items);
      setParams(prev => ({ ...prev, ...extractPagination(data, items) }));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [params.page, params.limit, search]);

  return (
    <div className="bg-transparent min-h-screen transition-colors duration-500">
      <SEO 
        title={t('pages.services.seoTitle')}
        description={t('pages.services.seoDesc')}
      />
      <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-slate-100/30 dark:border-slate-800/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <span className="inline-block px-3 py-1 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-lg mb-4 border border-emerald-100 dark:border-emerald-900/30">
             {t('pages.services.badge', 'Elite Service Marketplace')}
           </span>
           <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
             {t('pages.services.titlePrefix', 'Explore')}{' '}
             <span className="font-serif italic text-emerald-600">
               {t('pages.services.titleAccent', 'Expert Services')}
             </span>
           </h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mb-12 text-base md:text-lg">
             {t(
               'pages.services.subtitle',
               'Hire checked, verified agencies and top developers. Handpicked talents delivering premium execution of custom requirements.'
             )}
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
                   placeholder={t('pages.services.searchPlaceholder')}
                   type="text" 
                   name="text" 
                   className="search-ui-input" 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
                 <div className="search-ui-input-mask"></div>
                 <div className="search-ui-accent-mask" style={{ backgroundColor: '#059669' }}></div>
                 <div className="search-ui-filterBorder"></div>
                 <div className="search-ui-filter-icon" onClick={fetchServices} title={t('pages.services.filterTitle')}>
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
                     <circle stroke="url(#searchThemeGradServ)" r="8" cy="11" cx="11"></circle>
                     <line
                       stroke="url(#searchThemeGradServL)"
                       y2="16.65"
                       y1="22"
                       x2="16.65"
                       x1="22"
                     ></line>
                     <defs>
                       <linearGradient gradientTransform="rotate(50)" id="searchThemeGradServ">
                         <stop stopColor="#ecfdf5" offset="0%"></stop>
                         <stop stopColor="#059669" offset="100%"></stop>
                       </linearGradient>
                       <linearGradient id="searchThemeGradServL">
                         <stop stopColor="#059669" offset="0%"></stop>
                         <stop stopColor="#34d399" offset="100%"></stop>
                       </linearGradient>
                     </defs>
                   </svg>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchServices} />
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <EmptyState 
            title={t('pages.services.emptyTitle')}
            description={t('pages.services.emptyDesc')}
          />
        )}
      </div>
    </div>
  );
};

export default Services;
