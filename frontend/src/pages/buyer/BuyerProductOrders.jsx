import React, { useEffect, useState } from 'react';
import { ShoppingBag, Download, ExternalLink, Calendar, Search, ShieldCheck, Loader2 } from 'lucide-react';
import { getBuyerProductOrders } from '../../api/dashboardApi';
import { extractArray, extractPagination } from '../../utils/apiResponse';
import { downloadPurchasedProductFile, getPurchasedProductFiles } from '../../api/productOrdersApi';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import OrderStatusBadge from '../../components/marketplace/OrderStatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

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
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('dashboard.buyerOrders.libraryTitle', 'Digital Library')}</h1>
           <p className="text-slate-500 font-medium">{t('dashboard.buyerOrders.librarySubtitle', 'Access your purchased templates, e-books, and assets.')}</p>
        </div>
        <div className="w-full md:w-80">
           <Input 
             placeholder={t('dashboard.buyerOrders.productSearchPlaceholder')}
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
               <div className="aspect-video bg-slate-50 flex items-center justify-center p-12 relative">
                  <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-emerald-500/5" />
                  <img 
                    src={order.product?.thumbnail || `https://placehold.co/400x400/000000/ffffff?text=Asset`} 
                    alt={t('dashboard.buyerOrders.productAlt', 'Product')}
                    className="h-full object-contain drop-shadow-xl transition-transform group-hover:scale-110 duration-500"
                  />
                  <div className="absolute top-4 right-4">
                     <OrderStatusBadge status={order.payment_status} />
                  </div>
               </div>
               
               <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">{order.product?.title || t('dashboard.buyerOrders.productFallback', 'E-Book / Asset')}</h3>
                    <p className="text-sm text-slate-500 font-medium line-clamp-1 mb-4">
                      {order.product?.category || t('dashboard.buyerOrders.categoryFallback', 'Digital Product')}
                    </p>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {t('dashboard.buyerOrders.orderedOn', 'Ordered')} {formatDate(order.created_at)}</span>
                       <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {t('dashboard.buyerOrders.lifetimeAccess', 'Lifetime Access')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
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
                            : t('dashboard.buyerOrders.downloadFiles')}
                       </Button>
                     ) : (
                       <Button
                         className="flex-1 rounded-xl py-3"
                         icon={Download}
                         variant="outline"
                         disabled
                       >
                          {order.payment_status !== 'paid'
                            ? t('dashboard.buyerOrders.pendingPayment')
                            : t('dashboard.buyerOrders.processing', 'Processing...')}
                       </Button>
                     )}
                     <Button variant="outline" className="p-3 min-w-0 h-full rounded-xl">
                        <ExternalLink className="w-5 h-5" />
                     </Button>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState 
          title={t('dashboard.buyerOrders.libraryEmptyTitle')}
          description={t('dashboard.buyerOrders.libraryEmptyDesc')}
          icon={ShoppingBag}
        />
      )}
    </div>
  );
};

export default BuyerProductOrders;
