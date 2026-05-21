import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../common/Card';
import Button from '../common/Button';
import MediaThumbnail from '../common/MediaThumbnail';
import Avatar from '../common/Avatar';
import { formatCurrency } from '../../utils/formatCurrency';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';

const ServiceCard = ({ service }) => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);

  const getCategoryLabel = () => {
    if (!service) return 'Category';
    const category = service.category ?? service.category_name ?? service.categoryLabel;
    if (!category) return 'Category';
    if (typeof category === 'object') return category.name || category.label || 'Category';
    return category;
  };

  const firstImage = Array.isArray(service?.images) ? service.images[0] : null;
  const coverImage =
    (typeof firstImage === 'string' ? firstImage : null) ||
    firstImage?.url ||
    firstImage?.image_url ||
    firstImage?.path ||
    service?.thumbnail_url ||
    service?.image ||
    service?.image_url;

  const seller = service?.user || service?.seller || service?.owner || null;
  const sellerName =
    seller?.name ||
    service?.seller_name ||
    t('common.unknownSeller', 'Unknown seller');
  const sellerHeadline = seller?.headline || null;
  const sellerAvatar = seller?.avatar_url || seller?.avatar || null;

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
      <Card noPadding className="h-full flex flex-col group">
        <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
          <MediaThumbnail type="service" src={coverImage} alt={service?.title} category={getCategoryLabel()} />
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Avatar src={sellerAvatar} name={sellerName} size={28} />
            <div className="min-w-0">
              <p dir="auto" className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate unicode-bidi-plaintext">
                {sellerName}
              </p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
                {sellerHeadline || t('common.seller', 'Seller')}
              </p>
            </div>
          </div>

          <h3 dir="auto" className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2 mb-3 group-hover:text-emerald-600 transition-colors unicode-bidi-plaintext">
            {service.title}
          </h3>

          <div className="mt-auto space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-slate-900 dark:text-white">4.9</span>
                <span>(120)</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{service.delivery_time || t('serviceCard.deliveryFallback', '2 days')}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                  {t('common.startingAt')}
                </span>
                <span className="text-lg font-black text-emerald-600 leading-none">{formatCurrency(service.price)}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                icon={ShoppingCart}
                onClick={handleAddToCart}
                isLoading={addingToCart}
                className="w-full"
              >
                {t('serviceCard.addToCart', 'Add to Cart')}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ServiceCard;
