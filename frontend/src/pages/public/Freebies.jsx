import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Download, Gift, Sparkles } from 'lucide-react';
import { getProducts } from '../../api/productsApi';
import { extractArray } from '../../utils/apiResponse';
import FreebieCard from '../../components/marketplace/FreebieCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import SEO from '../../components/common/SEO';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../../components/common/Button';
import { getStitchCardImage } from '../../utils/cardImages';

const Freebies = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const productLanguage = language === 'ar' ? 'ar' : language === 'de' ? 'de' : 'en';

  const fetchFreebies = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ page: 1, limit: 48, search, language: productLanguage });
      const products = extractArray(data, ['products', 'items']);
      const freebies = products.filter(p => Number(p?.price) === 0);
      setItems(freebies);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreebies();
  }, [productLanguage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      searchParams.set('search', search.trim());
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
    fetchFreebies();
  };

  return (
    <div className="bg-transparent min-h-screen transition-colors duration-500">
      <SEO
        title={t('pages.freebies.seoTitle', 'Freebies | Lernnova')}
        description={t('pages.freebies.seoDesc', 'Browse free downloadable resources, templates, and starter assets on Lernnova.')}
      />

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-cyan-300/30 bg-gradient-to-br from-cyan-50 via-sky-50 to-indigo-50 dark:from-cyan-950/30 dark:via-slate-900 dark:to-blue-950/30 overflow-hidden relative">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-cyan-400/25 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-sky-500/15 blur-3xl" />
            </div>
            <div className="relative z-10 p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/75 dark:bg-slate-950/25 text-cyan-800 dark:text-cyan-200 text-[10px] font-bold tracking-wider rounded-full mb-4 border border-cyan-200/40 dark:border-cyan-400/15">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('pages.freebies.badge', t('freebies.freeResource', 'Free resource'))}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white">
                  {t('freebies.title', 'Freebies')}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 font-medium max-w-2xl mb-10 text-base md:text-lg">
                  {t('freebies.subtitle', 'Discover free digital products, templates, and starter resources.')}
                </p>

                <form onSubmit={handleSubmit} className="max-w-xl">
                  <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center overflow-hidden">
                    <input
                      placeholder={t('freebies.searchPlaceholder', 'Search freebies...')}
                      type="text"
                      className="w-full bg-transparent px-4 py-3 text-slate-700 dark:text-slate-100 outline-none"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="px-4 py-3 bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:via-sky-500 hover:to-indigo-500 text-white"
                    >
                      <Gift className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link to="/products?category=freebies">
                      <Button variant="outline" size="sm">{t('freebies.viewInProducts', 'View in products')}</Button>
                    </Link>
                    <Link to="/products">
                      <Button variant="ghost" size="sm">{t('freebies.browseAll', 'Browse all products')}</Button>
                    </Link>
                  </div>
                </form>
              </div>
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="w-full max-w-sm rounded-[2rem] border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md p-8 flex items-center justify-center">
                  <img
                    src={getStitchCardImage('freebies')}
                    alt=""
                    className="h-40 w-40 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchFreebies} />
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {items.map(product => (
              <FreebieCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t('freebies.empty', 'No freebies available right now.')}
            description={t('freebies.emptyDesc', 'Try a different search, or check back soon for new resources.')}
            icon={Download}
          />
        )}
      </div>
    </div>
  );
};

export default Freebies;
