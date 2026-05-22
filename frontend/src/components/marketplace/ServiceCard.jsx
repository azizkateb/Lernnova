import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, ShoppingCart, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '../common/Avatar';
import { formatCurrency } from '../../utils/formatCurrency';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { getFileUrl } from '../../utils/fileUrl';

const ServiceCard = ({ service }) => {
  const { t, isRTL } = useLanguage();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getCategoryLabel = () => {
    if (!service) return 'Category';
    const category = service.category ?? service.category_name ?? service.categoryLabel;
    if (!category) return 'Category';
    if (typeof category === 'object') return category.name || category.label || 'Category';
    return category;
  };

  const coverImage = useMemo(() => {
    const firstImage = Array.isArray(service?.images) ? service.images[0] : null;
    const raw =
      (typeof firstImage === 'string' ? firstImage : null) ||
      firstImage?.url ||
      firstImage?.image_url ||
      firstImage?.path ||
      service?.thumbnail_url ||
      service?.image ||
      service?.image_url ||
      null;

    if (!raw || imageError) return null;
    return getFileUrl(raw);
  }, [service, imageError]);

  const seller = service?.user || service?.seller || service?.owner || null;
  const sellerName =
    seller?.name ||
    service?.seller_name ||
    t('common.unknownSeller', 'Unknown seller');
  const sellerHeadline = seller?.headline || null;
  const sellerAvatar = seller?.avatar_url || seller?.avatar || null;

  const sellerVerified = Boolean(
    seller?.verified || seller?.is_verified || seller?.verified_pro || seller?.isVerified
  );

  const rating = useMemo(() => {
    const raw =
      service?.rating ??
      service?.average_rating ??
      service?.avg_rating ??
      service?.reviews_avg ??
      null;
    const n = typeof raw === 'string' ? Number(raw) : raw;
    if (typeof n !== 'number' || Number.isNaN(n)) return null;
    return n;
  }, [service]);

  const ratingCount = useMemo(() => {
    const raw = service?.reviews_count ?? service?.ratings_count ?? service?.reviewsCount ?? null;
    const n = typeof raw === 'string' ? Number(raw) : raw;
    if (typeof n !== 'number' || Number.isNaN(n)) return null;
    return n;
  }, [service]);

  const description = service?.description || service?.short_description || '';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingToCart(true);
    try {
      addToCart(service, 'service');
      toast.success(t('serviceCard.addedToCart', 'Service added to cart'));
    } catch (err) {
      toast.error(t('serviceCard.addCartError', 'Failed to add to cart'));
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <Link to={`/services/${service.id}`}>
      <div className="h-full flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-transform duration-300 hover:scale-[1.02]">
        <div className="h-64 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
          {coverImage ? (
            <img
              src={coverImage}
              alt={service?.title || ''}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-emerald-500/90 to-indigo-600/90 dark:from-emerald-500/40 dark:to-indigo-600/40 flex items-center justify-center">
              <div className="absolute inset-0 bg-linear-to-br from-white/15 to-transparent dark:from-white/10" />
              <div className="relative flex flex-col items-center gap-3 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-white/20 dark:bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-xs">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <p className="text-white/95 font-black tracking-tight text-lg">
                  {t('common.digitalService', 'Digital Service')}
                </p>
              </div>
            </div>
          )}

          <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white backdrop-blur-sm border border-white/30 dark:border-slate-700 px-3 py-1 text-xs font-bold">
              {sellerVerified ? (
                <span>{t('common.verifiedPro', 'Verified Pro')}</span>
              ) : (
                <span>{t('common.digitalService', 'Digital Service')}</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-4">
            <Avatar src={sellerAvatar} name={sellerName} size={28} />
            <div className="min-w-0">
              <p dir="auto" className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate unicode-bidi-plaintext">
                {sellerName}
              </p>
              {sellerHeadline ? (
                <p dir="auto" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate unicode-bidi-plaintext">
                  {sellerHeadline}
                </p>
              ) : (
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
                  {t('common.seller', 'Seller')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <h3
              dir="auto"
              className="min-w-0 flex-1 text-lg font-bold text-slate-900 dark:text-white line-clamp-2 unicode-bidi-plaintext"
            >
              {service?.title}
            </h3>
            <span className="shrink-0 text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(service?.price)}
            </span>
          </div>

          {description ? (
            <p
              dir="auto"
              className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3 unicode-bidi-plaintext"
            >
              {description}
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-3 min-w-0">
              {service?.delivery_time ? (
                <span className="inline-flex items-center gap-1.5 shrink-0">
                  <Clock className="w-4 h-4" />
                  <span>
                    {typeof service.delivery_time === 'number'
                      ? `${service.delivery_time} ${t('common.days', 'days')}`
                      : service.delivery_time}
                  </span>
                </span>
              ) : null}

              {rating != null ? (
                <span className="inline-flex items-center gap-1.5 min-w-0">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <span className="shrink-0">{Number(rating).toFixed(1)}</span>
                  {ratingCount != null ? (
                    <span className="text-slate-500 dark:text-slate-400 truncate">({ratingCount})</span>
                  ) : null}
                </span>
              ) : null}
            </div>

            <span className="shrink-0 text-slate-500 dark:text-slate-400">{getCategoryLabel()}</span>
          </div>

          <div className="mt-auto pt-5">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full rounded-xl border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white py-3 font-semibold hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {addingToCart ? (
                <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
              {t('common.addToCart', t('serviceCard.addToCart', 'Add to Cart'))}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
