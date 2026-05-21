import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { getAdminProductOrders } from '../../api/dashboardApi';
import { extractArray, extractPagination } from '../../utils/apiResponse';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

/* ─── Helpers ─────────────────────────────────────────────── */
const paymentStatusBadgeClass = (status) => {
  const map = {
    pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    paid:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    failed:   'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    refunded: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  };
  return map[status?.toLowerCase()] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
};

const orderStatusBadgeClass = (status) => {
  const map = {
    new:       'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  };
  return map[status?.toLowerCase()] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
};

const statusLabel = (status, t, type) => {
  const keyMap = {
    pending:   'status.pending',
    paid:      'status.paid',
    failed:    'status.failed',
    refunded:  'status.refunded',
    new:       'status.new',
    completed: 'status.completed',
    cancelled: 'status.cancelled',
  };
  const key = keyMap[status?.toLowerCase()];
  const fallback = status ? status.replace(/_/g, ' ') : '—';
  return key ? t(key, fallback) : fallback;
};

const capitalize = (str) => {
  if (!str) return '—';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/* ─── Skeleton row ────────────────────────────────────────── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 9 }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-3/4" />
      </td>
    ))}
  </tr>
);

/* ─── Main Component ──────────────────────────────────────── */
const AllProductOrders = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  const [orders, setOrders]                     = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [search, setSearch]                     = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter]     = useState('');
  const [pagination, setPagination]             = useState({
    page: 1, limit: 10, total: 0, totalPages: 1,
  });

  const debounceRef = useRef(null);

  /* ─── Fetch ───────────────────────────────────────────── */
  const fetchOrders = useCallback(async (overridePage) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page:  overridePage ?? pagination.page,
        limit: pagination.limit,
      };
      if (paymentStatusFilter) params.payment_status = paymentStatusFilter;
      if (orderStatusFilter)   params.order_status   = orderStatusFilter;

      const result = await getAdminProductOrders(params);

      const arr = extractArray(result, ['orders']);

      setOrders(arr);
      setPagination(extractPagination(result, arr));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('dashboard.admin.loadingProductOrders', 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, paymentStatusFilter, orderStatusFilter, t]);

  /* ─── Effects ─────────────────────────────────────────── */
  // Debounced search + filter trigger
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchOrders(1);
    }, search ? 400 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [search, paymentStatusFilter, orderStatusFilter]); // eslint-disable-line

  // Page change (no debounce)
  useEffect(() => {
    fetchOrders();
  }, [pagination.page]); // eslint-disable-line

  /* ─── Permission guard ────────────────────────────────── */
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {t('dashboard.admin.noPermission', 'You do not have permission to view this page.')}
          </p>
        </div>
      </div>
    );
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  /* ─── Client-side search filter ───────────────────────── */
  const filteredOrders = orders.filter(order => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    const productTitle = order.product?.title || '';
    const buyerName    = order.buyer?.name    || '';
    const sellerName   = order.seller?.name   || '';
    return (
      productTitle.toLowerCase().includes(term) ||
      buyerName.toLowerCase().includes(term)    ||
      sellerName.toLowerCase().includes(term)
    );
  });

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <span className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block tracking-widest">
          Admin
        </span>
        <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mb-1">
          {t('dashboard.admin.allProductOrders', 'All Product')}{' '}
          <span className="font-serif italic text-emerald-600">
            {t('dashboard.admin.allProductOrdersAccent', 'Orders')}
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {t('dashboard.admin.allProductOrdersSubtitle', 'Monitor digital product purchases and payment status.')}
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('dashboard.admin.searchProductOrders', 'Search by product, buyer, or seller...')}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition"
          />
        </div>

        {/* Payment status filter */}
        <select
          value={paymentStatusFilter}
          onChange={e => setPaymentStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition cursor-pointer"
        >
          <option value="">{t('dashboard.admin.allPaymentStatuses', 'All Payment Statuses')}</option>
          <option value="pending">{t('status.pending', 'Pending')}</option>
          <option value="paid">{t('status.paid', 'Paid')}</option>
          <option value="failed">{t('status.failed', 'Failed')}</option>
          <option value="refunded">{t('status.refunded', 'Refunded')}</option>
        </select>

        {/* Order status filter */}
        <select
          value={orderStatusFilter}
          onChange={e => setOrderStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition cursor-pointer"
        >
          <option value="">{t('dashboard.admin.allOrderStatuses', 'All Order Statuses')}</option>
          <option value="new">{t('status.new', 'New')}</option>
          <option value="completed">{t('status.completed', 'Completed')}</option>
          <option value="cancelled">{t('status.cancelled', 'Cancelled')}</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              {error}
            </p>
            <button
              onClick={() => fetchOrders()}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition"
            >
              {t('dashboard.admin.retry', 'Retry')}
            </button>
          </div>
        )}

        {/* Table (scrollable on mobile) */}
        {!error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-slate-50 dark:bg-slate-900/30">
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.orderNumber', 'Order #')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.productColumn', 'Product')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.buyer', 'Buyer')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.seller', 'Seller')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.price', 'Amount')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.paymentMethod', 'Payment Method')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.paymentStatus', 'Payment Status')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.orderStatus', 'Order Status')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.createdColumn', 'Created')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {/* Loading skeletons */}
                {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                {/* Data rows */}
                {!loading && filteredOrders.map(order => (
                  <tr
                    key={order.id}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    {/* Order # */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        #{order.id}
                      </span>
                    </td>

                    {/* Product */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {order.product?.title || '—'}
                      </p>
                    </td>

                    {/* Buyer */}
                    <td className="px-6 py-4">
                      <p className="text-slate-700 dark:text-slate-300">
                        {order.buyer?.name || '—'}
                      </p>
                    </td>

                    {/* Seller */}
                    <td className="px-6 py-4">
                      <p className="text-slate-700 dark:text-slate-300">
                        {order.seller?.name || '—'}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(order.price)}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="px-6 py-4">
                      <span className="text-slate-700 dark:text-slate-300">
                        {capitalize(order.payment_method)}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${paymentStatusBadgeClass(order.payment_status)}`}>
                        {statusLabel(order.payment_status, t)}
                      </span>
                    </td>

                    {/* Order Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${orderStatusBadgeClass(order.order_status)}`}>
                        {statusLabel(order.order_status, t)}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      {formatDate(order.created_at) || '—'}
                    </td>
                  </tr>
                ))}

                {/* Empty state */}
                {!loading && !error && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-20 text-center">
                      <ShoppingBag className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-600 dark:text-slate-400 font-semibold">
                        {t('dashboard.admin.noProductOrdersFound', 'No product orders found')}
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                        {t('dashboard.admin.noProductOrdersSubtitle', 'No product orders have been placed yet.')}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('dashboard.admin.previous', 'Previous')}
            </button>

            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {`${t('dashboard.admin.page', 'Page')} ${pagination.page} ${t('dashboard.admin.of', 'of')} ${pagination.totalPages}`}
            </span>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {t('dashboard.admin.next', 'Next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProductOrders;
