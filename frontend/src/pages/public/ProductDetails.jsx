import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  ShoppingBag, 
  ChevronRight,
  FileText,
  Zap,
  Star
} from 'lucide-react';
import { getProductById } from '../../api/productsApi';
import { createProductOrder, createCheckoutSession } from '../../api/productOrdersApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import MediaThumbnail from '../../components/common/MediaThumbnail';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { marketplaceCategories } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatCurrency';
import { getFileUrl } from '../../utils/fileUrl';



import toast from 'react-hot-toast';
import SEO from '../../components/common/SEO';
import { useLanguage } from '../../context/LanguageContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { t, language } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyingNow, setBuyingNow] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const featureItems = t('pages.productDetails.features', [
    'High-resolution source files',
    'Step-by-step documentation',
    'Lifetime free updates',
    'Commercial usage license',
    'Direct support from creator',
    'Multi-format support',
  ]);
  // Helper to get readable category label
  const getCategoryLabel = () => {
    if (!product) return t('common.categoryFallback', 'Category');
    if (!product.category) return t('common.categoryFallback', 'Category');
    if (typeof product.category === 'object')
      return product.category.name || t('common.categoryFallback', 'Category');
    const match = marketplaceCategories.find(c => c.slug === product.category || c.label === product.category);
    // Only translate when the category matches our frontend-known slugs.
    return match ? t(`categories.${match.slug}`, match.label) : product.category || t('common.categoryFallback', 'Category');
  };

  const getProductLanguageLabel = () => {
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


  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setProduct(null);
      setSelectedImage(null);
      try {
        const data = await getProductById(id);
        setProduct(data?.product || data?.data || data);
        setError(null);
        setNotFound(false);
      } catch (err) {
        if (err?.response?.status === 404) {
          setNotFound(true);
          setError(null);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const galleryImages = useMemo(() => {
    const galleryRaw = product?.galleryImages ?? product?.gallery_images ?? [];

    if (Array.isArray(galleryRaw)) {
      return galleryRaw.filter((v) => typeof v === 'string' && v.trim()).slice(0, 3);
    }

    if (typeof galleryRaw === 'string') {
      try {
        const parsed = JSON.parse(galleryRaw);
        if (Array.isArray(parsed)) {
          return parsed.filter((v) => typeof v === 'string' && v.trim()).slice(0, 3);
        }
      } catch {
        return [];
      }
    }

    return [];
  }, [product]);

  const images = useMemo(() => {
    const base = product?.thumbnail || product?.thumbnail_url || null;
    return [base, ...galleryImages].filter(Boolean);
  }, [product, galleryImages]);

  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage((current) => (current && images.includes(current) ? current : images[0]));
    }
  }, [images]);

  const mainImage = selectedImage && images.includes(selectedImage) ? selectedImage : images[0] || null;

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      addToCart(product, 'product');
      toast.success(t('pages.productDetails.addedToCart', 'Product added to cart'));
    } catch (err) {
      toast.error(t('pages.productDetails.addCartError', 'Failed to add to cart'));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error(t('pages.productDetails.authRequired', 'Please sign in to continue checkout'));
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }

    setBuyingNow(true);
    try {
      const data = await createCheckoutSession(id);
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.error(t('pages.productDetails.checkoutError', 'Failed to create checkout session'));
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || t('pages.productDetails.purchaseError')
      );
    } finally {
      setBuyingNow(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (notFound || (!loading && !product && !error)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('pages.productDetails.notFoundTitle', 'Product not found')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {t('pages.productDetails.notFoundDesc', "This product may have been removed or doesn't exist.")}
          </p>
          <Link
            to="/products"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold"
          >
            ← {t('pages.productDetails.backToMarketplace', 'Back to Marketplace')}
          </Link>
        </div>
      </div>
    );
  }
  if (error || !product) return <ErrorState error={error} />;

  const safeFeatureItems = Array.isArray(featureItems) ? featureItems : [];

  return (
    <div className="bg-transparent min-h-screen pb-20 mt-12">
      <SEO 
        title={t('pages.productDetails.seoTitle', '{{title}} - Download Digital Resource', {
          title: product.title,
        })}
        description={
          product.short_description ||
          t(
            'pages.productDetails.seoDescFallback',
            'Secure and download {{title}} instantly from the Lernnova resource library. Premium handpicked files and expert templates.',
            { title: product.title }
          )
        }
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-8 tracking-widest">
           <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('nav.home')}</Link>
           <ChevronRight className="w-3 h-3" />
           <Link to="/products" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('pages.productDetails.breadcrumbLibrary')}</Link>
           <ChevronRight className="w-3 h-3" />
           <span className="text-indigo-600 dark:text-indigo-400">{getCategoryLabel()}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Visual Section */}
            <div className="space-y-8">
               <div className="aspect-square rounded-[3rem] bg-white/45 dark:bg-slate-900/40 border border-slate-100/40 dark:border-slate-800/30 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                  <MediaThumbnail type="product" src={mainImage} alt={product?.title} category={getCategoryLabel()} />
               </div>

               {images.length > 1 ? (
                 <div className="flex items-center gap-4 overflow-x-auto pb-2">
                   {images.map((src, index) => {
                     const active = src === mainImage;
                     return (
                       <button
                         key={`${src}-${index}`}
                         type="button"
                         onClick={() => setSelectedImage(src)}
                         className={`shrink-0 aspect-square w-24 rounded-2xl overflow-hidden border bg-white/30 dark:bg-slate-900/20 ${
                           active
                             ? 'border-cyan-400 ring-2 ring-cyan-400/40'
                             : 'border-slate-100/50 dark:border-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700'
                         } transition-colors`}
                         aria-label={product?.title || ''}
                       >
                         <img
                           src={getFileUrl(src)}
                           alt=""
                           className="w-full h-full object-cover"
                           loading="lazy"
                           decoding="async"
                         />
                       </button>
                     );
                   })}
                 </div>
               ) : null}
            </div>

            {/* Info Section */}
            <div className="space-y-8">
               <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="primary">{getCategoryLabel()}</Badge>
                    {getProductLanguageLabel() ? (
                      <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-1 text-xs font-semibold">
                        {getProductLanguageLabel()}
                      </span>
                    ) : null}
                  </div>
                  <h1 dir="auto" className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-4 unicode-bidi-plaintext">
                    {product.title}
                  </h1>
                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>4.8</span>
                        <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">
                          (256 {t('pages.productDetails.statsSales')})
                        </span>
                     </div>
                     <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                     <p className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        {t('pages.productDetails.includedLabel')}
                     </p>
                  </div>
               </div>

               <div className="bg-white/60 dark:bg-slate-900/60 p-8 rounded-[2rem] border border-slate-100/40 dark:border-slate-800/50 backdrop-blur-md shadow-subtle">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">
                          {t('pages.productDetails.licenseTitle')}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                          {t('pages.productDetails.licenseSubtitle')}
                        </p>
                     </div>
                     <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {formatCurrency(product.price)}
                     </h3>
                  </div>

                  <Button 
                    className="w-full py-5 text-lg rounded-2xl" 
                    size="lg" 
                    icon={Zap}
                    onClick={handleBuyNow}
                    isLoading={buyingNow}
                  >
                     {t('pages.productDetails.buttonBuy')}
                  </Button>

                  <Button 
                    className="w-full py-5 text-lg rounded-2xl mt-3" 
                    variant="outline"
                    size="lg" 
                    icon={ShoppingBag}
                    onClick={handleAddToCart}
                    isLoading={addingToCart}
                  >
                     {isInCart(id) ? t('pages.productDetails.viewCart', 'View Cart') : t('pages.productDetails.addToCart', 'Add to Cart')}
                  </Button>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-widest">
                        <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        {t('pages.productDetails.verified')}
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-widest">
                        <Download className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        {t('pages.productDetails.updates')}
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white">{t('pages.productDetails.descriptionTitle')}</h4>
                  <p dir="auto" className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium unicode-bidi-plaintext">
                    {product.description ||
                      t(
                        'pages.productDetails.descFallback',
                        'Elevate your project with this premium digital asset. Crafted by industry experts to save you time and maximize your results. Includes full documentation and support.'
                      )}
                  </p>

                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                     {safeFeatureItems.map(item => (
                       <li key={item} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          {item}
                       </li>
                     ))}
                  </ul>
               </div>

               <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{t('pages.productDetails.satisfactionTitle')}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-none">{t('pages.productDetails.satisfactionSubtitle')}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProductDetails;
