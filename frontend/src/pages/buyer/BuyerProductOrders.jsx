import React, { useEffect, useState } from 'react';
import { ShoppingBag, Download, ExternalLink, Calendar, Search, ShieldCheck, Loader2 } from 'lucide-react';
import { getBuyerProductOrders } from '../../api/dashboardApi';
import { extractArray } from '../../utils/apiResponse';
import { downloadPurchasedProductFile, getPurchasedProductFiles } from '../../api/productOrdersApi';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import OrderStatusBadge from '../../components/marketplace/OrderStatusBadge';
import { formatDate } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('data:') || path.startsWith('blob:')) return path;

  const rawBase = String(import.meta.env.VITE_API_URL || 'http://localhost:5000');
  const baseUrl = rawBase.replace(/\/+$/, '').replace(/\/api$/, '');
  return `${baseUrl}/${path.replace(/^\/+/, '')}`;
};

const resolveProductThumbnail = (product) =>
  product?.thumbnail_url || product?.thumbnail || product?.image_url || product?.cover_url || null;

const ProductThumbnail = ({ product, fallbackLabel }) => {
  const thumbnail = resolveProductThumbnail(product);
  const url = getFileUrl(thumbnail);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [url]);

  if (url && !imageFailed) {
    return (
      <img
        src={url}
        alt={product?.title || 'Product thumbnail'}
        className="h-full w-full object-cover object-center"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-emerald-500/10">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">{fallbackLabel}</p>
      </div>
    </div>
  );
};

const BuyerProductOrders = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getBuyerProductOrders();
      setOrders(extractArray(data, ['orders']));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const triggerBlobDownload = (blob, fileName) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = async (orderId) => {
    setDownloadingOrderId(orderId);
    toast.loading(
      t(
        'dashboard.buyerOrders.downloadPreparing',
        'Compiling your digital bundle. Please wait a brief moment...'
      ),
      { id: `dl-${orderId}` }
    );
    try {
      const filesResponse = await getPurchasedProductFiles(orderId);
      const canDownload = filesResponse?.can_download;
      const files = filesResponse?.files || [];

      if (!canDownload) {
        toast.error(
          t(
            'dashboard.buyerOrders.downloadNotAvailable',
            'Files not available for download yet'
          ),
          { id: `dl-${orderId}` }
        );
        return;
      }

      if (files.length === 0) {
        toast.error(
          t('dashboard.buyerOrders.noFilesAvailable', 'No files available'),
          { id: `dl-${orderId}` }
        );
        return;
      }

      for (const file of files) {
        const blob = await downloadPurchasedProductFile(orderId, file.id);
        triggerBlobDownload(blob, file.file_name || `file-${file.id}`);
      }

      toast.success(
        t('dashboard.buyerOrders.downloadSuccess', 'Download started'),
        { id: `dl-${orderId}` }
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t('dashboard.buyerOrders.downloadError', 'Download failed');
      toast.error(message, { id: `dl-${orderId}` });
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const filteredOrders = orders.filter(o =>
    o.product?.title?.toLowerCase().includes(filter.toLowerCase()) ||
    o.id?.toString().includes(filter)
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={fetchOrders} />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('dashboard.buyerOrders.libraryTitle', 'Digital Library')}</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium">{t('dashboard.buyerOrders.librarySubtitle', 'Access your purchased templates, e-books, and assets.')}</p>
        </div>
        <div className="w-full md:w-80">
           <Input
             placeholder={t('dashboard.buyer.orders.productSearch', 'Search product orders...')}
             icon={Search}
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
           />
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} noPadding className="flex flex-col group overflow-hidden">
               <div className="aspect-video bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-emerald-500/5" />
                  <ProductThumbnail
                    product={order.product}
                    fallbackLabel={t('dashboard.buyerOrders.productFallback', 'E-Book / Asset')}
                  />
                  <div className="absolute top-4 right-4">
                     <OrderStatusBadge status={order.payment_status} />
                  </div>
               </div>

               <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 truncate">{order.product?.title || t('dashboard.buyerOrders.productFallback', 'E-Book / Asset')}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mb-4">
                      {order.product?.category || t('dashboard.buyerOrders.categoryFallback', 'Digital Product')}
                    </p>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {t('dashboard.buyerOrders.orderedOn', 'Ordered')} {formatDate(order.created_at)}</span>
                       <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {t('dashboard.buyerOrders.lifetimeAccess', 'Lifetime Access')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                     {order.payment_status === 'paid' && order.order_status === 'completed' ? (
                       <Button
                         className="flex-1 rounded-xl py-3"
                         icon={downloadingOrderId === order.id ? Loader2 : Download}
                         variant="primary"
                         disabled={downloadingOrderId === order.id}
                         onClick={() => handleDownload(order.id)}
                       >
                          {downloadingOrderId === order.id
                            ? t('dashboard.buyerOrders.downloading', 'Downloading...')
                            : t('dashboard.buyerOrders.downloadFiles', 'Download Files')}
                       </Button>
                     ) : (
                       <div className="flex-1 flex flex-col gap-2">
                         <Button
                           className="w-full rounded-xl py-3"
                           icon={Download}
                           variant="outline"
                           disabled
                           title={t('dashboard.buyerOrders.downloadUnavailable', 'Download available after payment confirmation.')}
                         >
                            {order.payment_status !== 'paid'
                              ? t('dashboard.buyerOrders.pendingPayment', 'Payment pending')
                              : t('dashboard.buyerOrders.processing', 'Processing...')}
                         </Button>
                         {order.payment_status !== 'paid' && (
                           <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                             {t('dashboard.buyerOrders.downloadUnavailable', 'Download available after payment confirmation.')}
                           </p>
                         )}
                       </div>
                     )}
                     <Button variant="outline" className="p-3 min-w-0 h-full rounded-xl" title={t('dashboard.buyerOrders.viewProduct', 'View product')}>
                        <ExternalLink className="w-5 h-5" />
                     </Button>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title={t('dashboard.buyerOrders.libraryEmptyTitle', 'Your library is empty')}
          description={t('dashboard.buyerOrders.libraryEmptyDesc', 'Browse the digital products store to find templates, books, and assets for your work.')}
          icon={ShoppingBag}
        />
      )}
    </div>
  );
};

export default BuyerProductOrders;
