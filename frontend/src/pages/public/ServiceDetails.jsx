import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Clock, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  Star,
  ChevronRight,
  Zap,
  ShoppingCart
} from 'lucide-react';
import { getServiceById } from '../../api/servicesApi';
import { createServiceCheckoutSession } from '../../api/serviceOrdersApi';
import { createServiceInquiry } from '../../api/serviceInquiriesApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import MediaThumbnail from '../../components/common/MediaThumbnail';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';
import SEO from '../../components/common/SEO';
import { useLanguage } from '../../context/LanguageContext';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { t } = useLanguage();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [contactingSeller, setContactingSeller] = useState(false);
  const [error, setError] = useState(null);
  const includedItems = t('pages.serviceDetails.includedItems', [
    'High resolution files',
    'Source file provided',
    'Commercial use license',
    'Priority support',
  ]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await getServiceById(id);
        setService(data?.service || data?.data || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      addToCart(service, 'service');
      toast.success(t('pages.serviceDetails.addedToCart', 'Service added to cart'));
    } catch (err) {
      toast.error(t('pages.serviceDetails.addCartError', 'Failed to add to cart'));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleOrder = async () => {
    if (!isAuthenticated) {
      toast.error(t('pages.serviceDetails.authRequired', 'Please sign in to continue'));
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }

    setOrdering(true);
    try {
      const result = await createServiceCheckoutSession(service.id);
      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        toast.error(t('services.checkout.failed', 'Could not start checkout. Please try again.'));
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('services.checkout.failed', 'Could not start checkout. Please try again.');
      toast.error(msg);
    } finally {
      setOrdering(false);
    }
  };

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      toast.error(t('services.inquiry.loginRequired', 'Please log in to contact the seller.'));
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }

    const sellerId = service?.user_id ?? service?.seller_id ?? service?.seller?.id ?? service?.user?.id ?? null;
    if (sellerId && user?.id === sellerId) {
      toast.error(t('services.inquiry.cannotContactSelf', 'You cannot contact yourself.'));
      return;
    }

    setContactingSeller(true);
    try {
      const res = await createServiceInquiry(service.id);
      const inquiry = res?.inquiry || res?.data?.inquiry || res?.data;
      if (inquiry?.id) {
        toast.success(t('services.inquiry.created', 'Inquiry opened successfully.'));
        navigate(`/service-inquiries/${inquiry.id}`);
      } else {
        toast.error(t('components.errorState.title', 'Something went wrong'));
      }
    } catch (err) {
      toast.error(t('components.errorState.title', 'Something went wrong'));
    } finally {
      setContactingSeller(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (error || !service) return <ErrorState error={error} />;

  const categoryLabel =
    (typeof service?.category === 'string' ? service.category : service?.category?.name) ||
    t('pages.serviceDetails.categoryFallback', 'Uncategorized');

  const seller = service?.user || service?.seller || service?.owner || null;
  const sellerName = seller?.name || t('common.unknownSeller', 'Unknown seller');
  const sellerHeadline = seller?.headline || null;
  const sellerAvatar = seller?.avatar_url || seller?.avatar || null;
  const isSeller = Boolean((seller?.id && seller?.id === user?.id) || service?.user_id === user?.id);

  const firstImage = Array.isArray(service?.images) ? service.images[0] : null;
  const serviceCover =
    (typeof firstImage === 'string' ? firstImage : null) ||
    firstImage?.url ||
    firstImage?.image_url ||
    firstImage?.path ||
    service?.thumbnail_url ||
    service?.image ||
    service?.image_url;

  const safeIncludedItems = Array.isArray(includedItems) ? includedItems : [];

  return (
    <div className="bg-transparent min-h-screen pb-20 mt-12">
      <SEO 
        title={t('pages.serviceDetails.seoTitle', '{{title}} - Professional Service', { title: service.title })}
        description={
          service.description
            ? service.description.slice(0, 160)
            : t(
                'pages.serviceDetails.seoDescFallback',
                'Hire expert support and bespoke executions for {{title}} through Lernnova.',
                { title: service.title }
              )
        }
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-8 tracking-widest">
           <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('nav.home')}</Link>
           <ChevronRight className="w-3 h-3" />
           <Link to="/services" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('pages.serviceDetails.breadcrumbServices')}</Link>
           <ChevronRight className="w-3 h-3" />
           <span className="text-indigo-600 dark:text-indigo-400 font-bold">{categoryLabel}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <h1 dir="auto" className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight unicode-bidi-plaintext">
              {service.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 py-4 border-y border-slate-200 dark:border-slate-800">
               {seller?.profile_slug || seller?.public_id ? (
                   <Link to={`/profile/${seller.profile_slug || seller.public_id}`} className="flex items-center gap-3 min-w-0">
                   <Avatar src={sellerAvatar} name={sellerName} size={40} />
                   <div className="min-w-0">
                     <p dir="auto" className="text-sm font-bold text-slate-900 dark:text-white truncate unicode-bidi-plaintext">{sellerName}</p>
                     {sellerHeadline ? (
                       <p dir="auto" className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate unicode-bidi-plaintext">
                         {sellerHeadline}
                       </p>
                     ) : (
                       <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest">
                         {t('common.seller', 'Seller')}
                       </p>
                     )}
                   </div>
                 </Link>
               ) : (
                 <div className="flex items-center gap-3 min-w-0">
                   <Avatar src={sellerAvatar} name={sellerName} size={40} />
                   <div className="min-w-0">
                     <p dir="auto" className="text-sm font-bold text-slate-900 dark:text-white truncate unicode-bidi-plaintext">{sellerName}</p>
                     {sellerHeadline ? (
                       <p dir="auto" className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate unicode-bidi-plaintext">
                         {sellerHeadline}
                       </p>
                     ) : (
                       <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest">
                         {t('common.seller', 'Seller')}
                       </p>
                     )}
                   </div>
                 </div>
               )}
               <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    4.9 (120 {t('pages.serviceDetails.reviews', 'reviews')})
                  </span>
               </div>
               <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
               <Badge variant="primary">{categoryLabel}</Badge>
            </div>

            <div className="aspect-video rounded-3xl bg-slate-200 dark:bg-slate-900 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none group">
               <MediaThumbnail type="service" src={serviceCover} alt={service?.title} category={categoryLabel} />
            </div>

            <div className="bg-white/70 dark:bg-slate-900/60 p-8 md:p-12 rounded-[2rem] border border-slate-100/40 dark:border-slate-800/40 prose prose-slate max-w-none backdrop-blur-md shadow-subtle">
               <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">{t('pages.serviceDetails.aboutTitle')}</h3>
               <p dir="auto" className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium unicode-bidi-plaintext">
                 {service.description || t('pages.serviceDetails.descFallback', 'No description provided for this service.')}
               </p>
            </div>
          </div>

          {/* Sidebar / Checkout */}
          <div className="space-y-6">
            <Card className="sticky top-24 p-8 bg-white/80 dark:bg-slate-900/75 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/70 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.12)] hover:-translate-y-0">
               <div className="flex items-end justify-between mb-8">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest">{t('pages.serviceDetails.basePrice')}</p>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                     {formatCurrency(service.price)}
                  </h3>
               </div>

               <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                     <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                     <span>{service.delivery_time || t('pages.serviceDetails.deliveryFallback', '2-3 Days Delivery')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                     <RotateCcw className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                     <span>{t('pages.serviceDetails.revisions')}</span>
                  </div>
               </div>

               <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t('pages.serviceDetails.includedTitle')}</h4>
               <ul className="space-y-3 mb-10">
                  {safeIncludedItems.map(item => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                       <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5" />
                       {item}
                    </li>
                  ))}
               </ul>

              <div>
                 <Button 
                   className="w-full py-4 text-base" 
                   size="lg" 
                   icon={Zap}
                   onClick={handleOrder}
                   isLoading={ordering}
                 >
                    {ordering
                      ? t('services.checkout.redirecting', 'Redirecting to checkout...')
                      : t('pages.serviceDetails.orderButton')}
                 </Button>
               </div>
               
               <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-6 font-bold tracking-widest flex items-center justify-center gap-2">
                 <ShieldCheck className="w-3 h-3" />
                 {t('pages.serviceDetails.securePayment')}
               </p>
            </Card>

            <Card className="p-6 bg-slate-900 dark:bg-slate-950 border-none text-white overflow-hidden relative">
               <div className="relative z-10">
                 <p className="text-xs font-bold text-cyan-300 tracking-widest mb-2">{t('pages.serviceDetails.helpCenter')}</p>
                 <h4 className="text-lg font-bold mb-4">{t('pages.serviceDetails.helpTitle')}</h4>
                 <Button
                   variant="outline"
                   className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white"
                   icon={MessageSquare}
                   onClick={handleContactSeller}
                   isLoading={contactingSeller}
                   disabled={isSeller}
                   title={
                     isSeller
                       ? t('services.inquiry.cannotContactSelf', 'You cannot contact yourself.')
                       : undefined
                   }
                 >
                    {t('services.contactSeller', t('pages.serviceDetails.contactSeller'))}
                 </Button>
                 {isSeller ? (
                   <p className="mt-2 text-center text-[11px] text-white/70 font-semibold">
                    {t('services.inquiry.cannotContactSelf', 'You cannot contact yourself.')}
                   </p>
                 ) : null}

                <Button 
                  variant="outline"
                  className="w-full py-4 text-base mt-3" 
                  size="lg" 
                  icon={ShoppingCart}
                  onClick={handleAddToCart}
                  isLoading={addingToCart}
                >
                   {t('pages.serviceDetails.addToCart', 'Add to Cart')}
                </Button>
               </div>
               <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
