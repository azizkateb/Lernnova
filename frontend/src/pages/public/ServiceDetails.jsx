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
  Zap
} from 'lucide-react';
import { getServiceById, createServiceOrder } from '../../api/servicesApi';
import { useAuth } from '../../context/AuthContext';
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
  const { t } = useLanguage();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
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

  const handleOrder = async () => {
    if (!isAuthenticated) {
      toast(t('pages.serviceDetails.authRequired'), { icon: '🔑' });
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }

    setOrdering(true);
    try {
      await createServiceOrder(id);
      toast.success(t('pages.serviceDetails.orderSuccess'), { duration: 4000 });
      setTimeout(() => navigate('/buyer/service-orders'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || t('pages.serviceDetails.orderError'));
    } finally {
      setOrdering(false);
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

  const firstImage = Array.isArray(service?.images) ? service.images[0] : null;
  const serviceCover =
    (typeof firstImage === 'string' ? firstImage : null) ||
    firstImage?.url ||
    firstImage?.image_url ||
    firstImage?.path ||
    service?.thumbnail_url ||
    service?.image ||
    service?.image_url;

  return (
    <div className="bg-transparent min-h-screen pb-20 mt-12">
      <SEO 
        title={`${service.title} - Professional Service`} 
        description={service.description ? service.description.slice(0, 160) : `Hire expert support and bespoke executions for ${service.title} through Lernnova.`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest">
           <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('nav.home')}</Link>
           <ChevronRight className="w-3 h-3" />
           <Link to="/services" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('pages.serviceDetails.breadcrumbServices')}</Link>
           <ChevronRight className="w-3 h-3" />
           <span className="text-emerald-600 font-bold">{categoryLabel}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <h1 className="text-4xl font-light text-slate-900 dark:text-white tracking-tight leading-tight">
              {service.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 py-4 border-y border-slate-200 dark:border-slate-800">
               {seller?.id ? (
                 <Link to={`/profile/${seller.id}`} className="flex items-center gap-3 min-w-0">
                   <Avatar src={sellerAvatar} name={sellerName} size={40} />
                   <div className="min-w-0">
                     <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{sellerName}</p>
                     {sellerHeadline ? (
                       <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                         {sellerHeadline}
                       </p>
                     ) : (
                       <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                         {t('common.seller', 'Seller')}
                       </p>
                     )}
                   </div>
                 </Link>
               ) : (
                 <div className="flex items-center gap-3 min-w-0">
                   <Avatar src={sellerAvatar} name={sellerName} size={40} />
                   <div className="min-w-0">
                     <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{sellerName}</p>
                     {sellerHeadline ? (
                       <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                         {sellerHeadline}
                       </p>
                     ) : (
                       <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
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
               <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                 {service.description || t('pages.serviceDetails.descFallback', 'No description provided for this service.')}
               </p>
            </div>
          </div>

          {/* Sidebar / Checkout */}
          <div className="space-y-6">
            <Card className="sticky top-24 p-8 border-2 border-emerald-600 shadow-2xl shadow-emerald-100 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
               <div className="flex items-end justify-between mb-8">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-widest">{t('pages.serviceDetails.basePrice')}</p>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                     {formatCurrency(service.price)}
                  </h3>
               </div>

               <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                     <Clock className="w-4 h-4 text-emerald-600" />
                     <span>{service.delivery_time || t('pages.serviceDetails.deliveryFallback', '2-3 Days Delivery')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                     <RotateCcw className="w-4 h-4 text-emerald-600" />
                     <span>{t('pages.serviceDetails.revisions')}</span>
                  </div>
               </div>

               <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t('pages.serviceDetails.includedTitle')}</h4>
               <ul className="space-y-3 mb-10">
                  {includedItems.map(item => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                       {item}
                    </li>
                  ))}
               </ul>

               <Button 
                 className="w-full py-4 text-base" 
                 size="lg" 
                 icon={Zap}
                 onClick={handleOrder}
                 isLoading={ordering}
               >
                  {t('pages.serviceDetails.orderButton')}
               </Button>
               
               <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-6 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                 <ShieldCheck className="w-3 h-3" />
                 {t('pages.serviceDetails.securePayment')}
               </p>
            </Card>

            <Card className="p-6 bg-slate-900 dark:bg-slate-950 border-none text-white overflow-hidden relative">
               <div className="relative z-10">
                 <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">{t('pages.serviceDetails.helpCenter')}</p>
                 <h4 className="text-lg font-bold mb-4">{t('pages.serviceDetails.helpTitle')}</h4>
                 <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white" icon={MessageSquare}>
                    {t('pages.serviceDetails.contactSeller')}
                 </Button>
               </div>
               <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-600/30 rounded-full blur-2xl" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
