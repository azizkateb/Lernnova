import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, ShoppingCart, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { marketplaceCategories } from '../../utils/constants';
import { useLanguage } from '../../context/LanguageContext';
import { getFileUrl } from '../../utils/fileUrl';

const ProductCard = ({ product }) => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const inCart = isInCart(product.id);

  const getCategoryLabel = () => {
    if (!product) return 'Category';
    if (!product.category) return 'Category';
    if (typeof product.category === 'object') return product.category.name || 'Category';
    const match = marketplaceCategories.find(c => c.slug === product.category || c.label === product.category);
    // Only translate when the category matches our frontend-known slugs.
    return match ? t(`categories.${match.slug}`, match.label) : product.category;
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

  const description = product?.description || product?.short_description || '';

  const handleCta = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCart) {
      navigate('/cart');
      return;
    }

    addToCart(product);
    toast.success(t('pages.productCard.addedToCart', 'Product added to cart'));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-transform duration-300 hover:scale-[1.02]">
      <Link to={`/products/${product.id}`} className="flex-1 flex flex-col">
        <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-slate-800">
          {coverSrc ? (
            <img
              src={coverSrc}
              alt={product?.title || ''}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-indigo-600/90 to-cyan-400/90 dark:from-indigo-600/40 dark:to-cyan-400/40 flex items-center justify-center">
              <div className="absolute inset-0 bg-linear-to-br from-white/15 to-transparent dark:from-white/10" />
              <div className="relative text-center px-6">
                <p className="text-white/95 font-black tracking-tight text-lg">
                  {t('common.digitalProduct', 'Digital Product')}
                </p>
              </div>
            </div>
          )}

          <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white backdrop-blur-sm border border-white/30 dark:border-slate-700 px-3 py-1 text-xs font-bold">
              {rating != null ? (
                <>
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{Number(rating).toFixed(1)}</span>
                </>
              ) : (
                <span>{t('common.digitalProduct', 'Digital Product')}</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-start justify-between gap-4">
            <h3
              dir="auto"
              className="min-w-0 flex-1 text-lg font-bold text-slate-900 dark:text-white line-clamp-2 unicode-bidi-plaintext"
            >
              {product?.title}
            </h3>
            <span className="shrink-0 text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(product?.price)}
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
            <div className="inline-flex items-center gap-2 min-w-0">
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{t('components.productCard.instantDownload', 'Instant Download')}</span>
            </div>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">{getCategoryLabel()}</span>
          </div>
        </div>
      </Link>

      <div className="p-6 pt-0 mt-auto">
        <button
          type="button"
          onClick={handleCta}
          className="w-full rounded-xl bg-indigo-600 text-white py-3 font-semibold flex items-center justify-center gap-2 hover:bg-indigo-500 transition active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          {inCart
            ? t('common.viewCart', t('pages.productCard.viewCart', 'View Cart'))
            : t('common.addToCart', t('pages.productCard.addToCart', 'Add to Cart'))}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
