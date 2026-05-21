import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../common/Card';
import MediaThumbnail from '../common/MediaThumbnail';
import Button from '../common/Button';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { marketplaceCategories } from '../../utils/constants';
import { useLanguage } from '../../context/LanguageContext';

const ProductCard = ({ product }) => {
  const { t } = useLanguage();
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(product.id);

  const getCategoryLabel = () => {
    if (!product) return 'Category';
    if (!product.category) return 'Category';
    if (typeof product.category === 'object') return product.category.name || 'Category';
    const match = marketplaceCategories.find(c => c.slug === product.category || c.label === product.category);
    // Only translate when the category matches our frontend-known slugs.
    return match ? t(`categories.${match.slug}`, match.label) : product.category;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success(t('pages.productCard.addedToCart', 'Product added to cart'));
  };

  return (
    <Card noPadding className="h-full flex flex-col group">
      <Link to={`/products/${product.id}`} className="flex-1 flex flex-col">
        <div className="aspect-square bg-slate-50 dark:bg-slate-900 transition-colors duration-500 relative overflow-hidden">
          <MediaThumbnail
            type="product"
            src={product?.thumbnail_url || product?.thumbnail}
            alt={product?.title}
            category={getCategoryLabel()}
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-lg">
                <Eye className="w-5 h-5" />
             </div>
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <h3 dir="auto" className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1 mb-1 group-hover:text-emerald-600 transition-colors unicode-bidi-plaintext">
            {product.title}
          </h3>
          <p dir="auto" className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed unicode-bidi-plaintext">
            {product.description || 'Premium digital asset for your next big project.'}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(product.price)}</span>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
               <Download className="w-3 h-3" />
               {t('components.productCard.instantDownload')}
            </div>
          </div>
        </div>
      </Link>
      
      <div className="px-5 pb-5">
        <Button
          onClick={handleAddToCart}
          variant={inCart ? 'outline' : 'primary'}
          size="sm"
          className="w-full"
          icon={ShoppingCart}
        >
          {inCart ? t('pages.productCard.viewCart', 'View Cart') : t('pages.productCard.addToCart', 'Add to Cart')}
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
