import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, Gift, Sparkles, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { marketplaceCategories } from '../../utils/constants';
import { useLanguage } from '../../context/LanguageContext';
import { getFileUrl } from '../../utils/fileUrl';
import { getImageForCardText } from '../../utils/cardImages';

const FreebieCard = ({ product }) => {
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const inCart = isInCart(product.id);

  const getCategoryLabel = () => {
    if (!product) return t('common.categoryFallback', 'Category');
    if (!product.category) return t('common.categoryFallback', 'Category');
    if (typeof product.category === 'object')
      return product.category.name || t('common.categoryFallback', 'Category');
    const match = marketplaceCategories.find(c => c.slug === product.category || c.label === product.category);
    return match ? t(`categories.${match.slug}`, match.label) : product.category || t('common.categoryFallback', 'Category');
  };

  const rating = useMemo(() => {
    const raw =
      product?.rating ??
      product?.average_rating ??
      product?.avg_rating ??
      product?.reviews_avg ??
      null;
    const n = typeof raw === 'string' ? Number(raw) : raw;
    if (typeof n !== 'number' || Number.isNaN(n)) return null;
    return n;
  }, [product]);

  const coverSrc = useMemo(() => {
    const raw = product?.thumbnail_url || product?.thumbnail || product?.image_url || null;
    if (!raw || imageError) return null;
    return getFileUrl(raw);
  }, [product, imageError]);

  const fallbackCover = useMemo(() => {
    const title = product?.title || '';
    const categoryRaw =
      typeof product?.category === 'object'
        ? product?.category?.name || product?.category?.label || ''
        : product?.category || '';

    return getImageForCardText(`free ${title} ${categoryRaw}`);
  }, [product]);

  const description = product?.description || product?.short_description || '';

  const getLanguageLabel = () => {
    const lang = product?.language;
    if (!lang) return null;

    const labelKey = {
      ar: 'product.languageArabic',
      en: 'product.languageEnglish',
      de: 'product.languageGerman',
    }[lang];

    const fallbacks = {
      ar: { en: 'Arabic', ar: 'العربية', de: 'Arabisch' },
      en: { en: 'English', ar: 'الإنجليزية', de: 'Englisch' },
      de: { en: 'German', ar: 'الألمانية', de: 'Deutsch' },
    };

    const currentLang = language || 'en';
    return t(labelKey, fallbacks[lang]?.[currentLang] || lang);
  };

  const handleCta = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCart) {
      navigate('/cart');
      return;
    }

    addToCart(product);
    toast.success(t('pages.freebieCard.addedToCart', 'Freebie added to cart'));
  };

  const freeLabel = t('freebies.free', t('common.free', 'Free'));

  return (
    <div className="group relative h-full flex flex-col overflow-hidden rounded-[1.75rem] border border-amber-300/50 dark:border-amber-400/25 bg-gradient-to-br from-amber-50 via-yellow-50 to-emerald-50 dark:from-amber-950/30 dark:via-slate-900 dark:to-emerald-950/25 shadow-[0_18px_50px_-28px_rgba(245,158,11,0.6)] hover:shadow-[0_24px_60px_-30px_rgba(245,158,11,0.8)] hover:-translate-y-1 transition-all duration-300 ring-1 ring-amber-300/15">
      {/* Decorative orbs */}
      <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-300/25 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl" />

      <Link to={`/products/${product.id}`} className="relative flex-1 flex flex-col">
        <div className="px-6 pt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 dark:border-amber-400/15 bg-white/70 dark:bg-slate-950/25 px-3.5 py-1.5 text-[11px] font-bold text-amber-900 dark:text-amber-200">
            <Sparkles className="w-4 h-4" />
            {t('freebies.freeResource', 'Free resource')}
          </div>
        </div>

        {/* Image area */}
        <div className="relative mx-5 mt-5 flex h-44 items-center justify-center overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-inner dark:border-white/10 dark:bg-white/5">
          {coverSrc ? (
            <img
              src={coverSrc}
              alt={product?.title || ''}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
            />
          ) : (
            <img
              src={fallbackCover}
              alt=""
              className="h-32 w-32 object-contain"
              loading="lazy"
              decoding="async"
            />
          )}

          {/* FREE badge */}
          <div className="absolute top-4 start-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/25 px-3 py-1 text-xs font-bold">
              <Gift className="w-3.5 h-3.5" />
              <span>{freeLabel}</span>
            </div>
          </div>

          {/* Language badge (opposite corner) */}
          {getLanguageLabel() && (
            <div className="absolute top-4 end-4">
              <span className="inline-flex items-center rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 backdrop-blur-sm border border-white/40 dark:border-slate-700 px-2.5 py-1 text-[10px] font-semibold">
                {getLanguageLabel()}
              </span>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="p-6 flex flex-col flex-grow">
          <h3
            dir="auto"
            className="text-lg font-extrabold text-slate-950 dark:text-white line-clamp-2 unicode-bidi-plaintext"
          >
            {product?.title}
          </h3>

          {description ? (
            <p
              dir="auto"
              className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300 line-clamp-3 unicode-bidi-plaintext"
            >
              {description}
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <div className="inline-flex items-center gap-2 min-w-0">
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{t('freebies.instantDownload', t('components.productCard.instantDownload', 'Instant Download'))}</span>
            </div>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">{getCategoryLabel()}</span>
          </div>
        </div>
      </Link>

      {/* CTA button */}
      <div className="p-6 pt-0 mt-auto">
        <button
          type="button"
          onClick={handleCta}
          className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-emerald-500 text-white font-bold py-3 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:via-yellow-400 hover:to-emerald-400 active:scale-[0.98] transition-all"
        >
          <Gift className="w-4 h-4" />
          {inCart
            ? t('common.viewCart', t('pages.freebieCard.viewCart', 'View Cart'))
            : t('freebies.getProduct', 'Get Free Product')}
        </button>
      </div>
    </div>
  );
};

export default FreebieCard;
