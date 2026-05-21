import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  Hash,
  Package,
  User,
  Coins,
  CreditCard,
  CheckCircle2,
  Clock,
  DollarSign,
  CalendarDays,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getSellerProductOrders } from '../../api/dashboardApi';
import { updateProductOrderStatus } from '../../api/productOrdersApi';
import { extractArray, extractPagination } from '../../utils/apiResponse';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

/* ─── Helpers ─────────────────────────────────────────────── */
const paymentStatusBadgeClass = (status) => {
  const map = {
    pending:  'bg-amber-100 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-900/40 dark:text-amber-300 dark:ring-amber-700/40',
    paid:     'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-700/40',
    failed:   'bg-rose-100 text-rose-700 ring-1 ring-rose-200/70 dark:bg-rose-900/40 dark:text-rose-300 dark:ring-rose-700/40',
    refunded: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200/70 dark:bg-sky-900/40 dark:text-sky-300 dark:ring-sky-700/40',
  };
  return map[status?.toLowerCase()] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
};

const orderStatusBadgeClass = (status) => {
  const map = {
    new:       'bg-sky-100 text-sky-700 ring-1 ring-sky-200/70 dark:bg-sky-900/40 dark:text-sky-300 dark:ring-sky-700/40',
    completed: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-700/40',
    cancelled: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200/70 dark:bg-rose-900/40 dark:text-rose-300 dark:ring-rose-700/40',
  };
  return map[status?.toLowerCase()] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
};

const statusLabel = (status, t) => {
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
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 bg-slate-100 dark:bg-slate-700/60 rounded-full w-3/4" />
      </td>
    ))}
  </tr>
);

/* ─── Local Stat tile ────────────────────────────────────── */
const StatTile = ({ label, value, sublabel, icon: Icon, tone = 'emerald' }) => {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    sky:     'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400',
    indigo:  'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
  };
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl md:text-3xl font-black tabular-nums text-slate-900 dark:text-white tracking-tight truncate">
            {value}
          </p>
          {sublabel && (
            <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {sublabel}
            </p>
          )}
        </div>
        <div className={`shrink-0 p-2.5 rounded-xl ${tones[tone] ?? tones.emerald}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────── */
const SellerProductOrders = () => {
  const { t } = useLanguage();
  const { isSeller } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders]                           = useState([]);
  const [loading, setLoading]                         = useState(true);
  const [error, setError]                             = useState(null);
  const [search, setSearch]                           = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter]     = useState('');
  const [pagination, setPagination]                   = useState({
    page: 1, limit: 10, total: 0, totalPages: 1,
  });

  /* Status update state */
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // { orderId, newStatus }
  const [updating, setUpdating]           = useState(false);

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

      const result = await getSellerProductOrders(params);
      const arr = extractArray(result, ['orders']);

      setOrders(arr);
      setPagination(extractPagination(result, arr));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        t('pages.seller.productOrders.loadError', 'Failed to load product orders.')
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, paymentStatusFilter, orderStatusFilter, t]);

  /* ─── Effects ─────────────────────────────────────────── */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchOrders(1);
    }, search ? 400 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [search, paymentStatusFilter, orderStatusFilter]); // eslint-disable-line

  useEffect(() => {
    fetchOrders();
  }, [pagination.page]); // eslint-disable-line

  /* ─── Status update handlers ───────────────────────── */
  const openStatusConfirm = (orderId, newStatus) => {
    setConfirmTarget({ orderId, newStatus });
    setConfirmOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!confirmTarget) return;
    setUpdating(true);
    try {
      await updateProductOrderStatus(confirmTarget.orderId, confirmTarget.newStatus);
      toast.success(t('seller.orders.statusUpdated', 'Order status updated successfully.'));
      fetchOrders();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || t('errors.generic', 'Something went wrong')
      );
    } finally {
      setUpdating(false);
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  /* ─── Permission guard ────────────────────────────────── */
  if (!isSeller) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            {t('pages.seller.productOrders.noAccess', 'You do not have permission to view this page.')}
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
  const safeOrders = Array.isArray(orders) ? orders : [];
  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return safeOrders;
    return safeOrders.filter(order => {
      const productTitle = order.product?.title?.toLowerCase() || '';
      const buyerName    = order.buyer?.name?.toLowerCase()    || '';
      const buyerEmail   = order.buyer?.email?.toLowerCase()   || '';
      return (
        productTitle.includes(term) ||
        buyerName.includes(term) ||
        buyerEmail.includes(term)
      );
    });
  }, [safeOrders, search]);

  /* ─── Stats (current page) ────────────────────────────── */
  const stats = useMemo(() => {
    const paidCount = safeOrders.filter(o =>
      String(o?.payment_status || '').toLowerCase() === 'paid'
    ).length;
    const pendingCount = safeOrders.filter(o =>
      String(o?.payment_status || '').toLowerCase() === 'pending'
    ).length;
    const revenue = safeOrders
      .filter(o => String(o?.payment_status || '').toLowerCase() === 'paid')
      .reduce((sum, o) => sum + (Number(o?.price) || 0), 0);
    return {
      total: pagination.total ?? safeOrders.length,
      paid: paidCount,
      pending: pendingCount,
      revenue,
    };
  }, [safeOrders, pagination.total]);

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <span className="bg-emerald-600 dark:bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block tracking-widest">
          {t('pages.seller.productOrders.kicker', 'Seller Workspace')}
        </span>
        <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mb-1">
          {t('pages.seller.productOrders.titlePrefix', 'My Product')}{' '}
          <span className="font-serif italic text-emerald-600 dark:text-emerald-400">
            {t('pages.seller.productOrders.titleAccent', 'Orders')}
          </span>
        </h1>
        <p className="text-slate-600 dark:text-slate-300 font-medium">
          {t(
            'pages.seller.productOrders.subtitle',
            'Track purchases of your digital products and their payment status.'
          )}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label={t('pages.seller.productOrders.stats.total', 'Total Orders')}
          value={stats.total}
          icon={ShoppingBag}
          tone="indigo"
        />
        <StatTile
          label={t('pages.seller.productOrders.stats.paid', 'Paid Orders')}
          value={stats.paid}
          sublabel={t('pages.seller.productOrders.stats.onThisPage', 'On this page')}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatTile
          label={t('pages.seller.productOrders.stats.pending', 'Pending Payments')}
          value={stats.pending}
          sublabel={t('pages.seller.productOrders.stats.onThisPage', 'On this page')}
          icon={Clock}
          tone="amber"
        />
        <StatTile
          label={t('pages.seller.productOrders.stats.revenue', 'Product Revenue')}
          value={formatCurrency(stats.revenue || 0)}
          sublabel={t('pages.seller.productOrders.stats.onThisPage', 'On this page')}
          icon={DollarSign}
          tone="sky"
        />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t(
              'pages.seller.productOrders.searchPlaceholder',
              'Search by product or buyer...'
            )}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition"
          />
        </div>

        <select
          value={paymentStatusFilter}
          onChange={e => setPaymentStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition cursor-pointer"
        >
          <option value="">{t('pages.seller.productOrders.allPaymentStatuses', 'All Payment Statuses')}</option>
          <option value="pending">{t('status.pending', 'Pending')}</option>
          <option value="paid">{t('status.paid', 'Paid')}</option>
          <option value="failed">{t('status.failed', 'Failed')}</option>
          <option value="refunded">{t('status.refunded', 'Refunded')}</option>
        </select>

        <select
          value={orderStatusFilter}
          onChange={e => setOrderStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition cursor-pointer"
        >
          <option value="">{t('pages.seller.productOrders.allOrderStatuses', 'All Order Statuses')}</option>
          <option value="new">{t('status.new', 'New')}</option>
          <option value="completed">{t('status.completed', 'Completed')}</option>
          <option value="cancelled">{t('status.cancelled', 'Cancelled')}</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">
              {error}
            </p>
            <button
              onClick={() => fetchOrders()}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition"
            >
              {t('common.retry', 'Retry')}
            </button>
          </div>
        )}

        {!error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" />
                      {t('pages.seller.productOrders.columns.orderId', 'Order ID')}
                    </span>
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      {t('pages.seller.productOrders.columns.product', 'Product')}
                    </span>
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {t('pages.seller.productOrders.columns.buyer', 'Buyer')}
                    </span>
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5" />
                      {t('pages.seller.productOrders.columns.amount', 'Amount')}
                    </span>
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      {t('pages.seller.productOrders.columns.paymentMethod', 'Payment Method')}
                    </span>
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    {t('pages.seller.productOrders.columns.paymentStatus', 'Payment Status')}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    {t('pages.seller.productOrders.columns.orderStatus', 'Order Status')}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {t('pages.seller.productOrders.columns.created', 'Created')}
                    </span>
                  </th>
                  <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    {t('pages.seller.productOrders.columns.actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                {!loading && filteredOrders.map(order => (
                  <tr
                    key={order.id}
                    className="group hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors"
                  >
                    {/* Order # */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                        #{order.id}
                      </span>
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3.5">
                      <p
                        dir="auto"
                        className="font-semibold text-slate-900 dark:text-white truncate max-w-[220px]"
                      >
                        {order.product?.title || '—'}
                      </p>
                    </td>

                    {/* Buyer */}
                    <td className="px-4 py-3.5">
                      <p
                        dir="auto"
                        className="text-slate-800 dark:text-slate-200 font-medium"
                      >
                        {order.buyer?.name || '—'}
                      </p>
                      {order.buyer?.email && (
                        <p
                          dir="auto"
                          className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate max-w-[200px]"
                        >
                          {order.buyer.email}
                        </p>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(order.price)}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="px-4 py-3.5">
                      <span className="text-slate-700 dark:text-slate-300">
                        {capitalize(order.payment_method)}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${paymentStatusBadgeClass(order.payment_status)}`}>
                        {statusLabel(order.payment_status, t)}
                      </span>
                    </td>

                    {/* Order Status */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${orderStatusBadgeClass(order.order_status)}`}>
                        {statusLabel(order.order_status, t)}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                      {formatDate(order.created_at) || '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Status action buttons — seller can mark completed or cancel */}
                        {order.order_status === 'new' && (
                          <button
                            onClick={() => openStatusConfirm(order.id, 'completed')}
                            title={t('seller.orders.actions.markCompleted', 'Mark Completed')}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg border border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">
                              {t('seller.orders.actions.markCompleted', 'Mark Completed')}
                            </span>
                          </button>
                        )}
                        {order.order_status !== 'cancelled' && order.order_status !== 'completed' && (
                          <button
                            onClick={() => openStatusConfirm(order.id, 'cancelled')}
                            title={t('seller.orders.actions.cancelOrder', 'Cancel Order')}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-700/50 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">
                              {t('seller.orders.actions.cancelOrder', 'Cancel Order')}
                            </span>
                          </button>
                        )}
                        {order.product?.id ? (
                          <button
                            onClick={() => navigate(`/products/${order.product.id}`)}
                            title={t('pages.seller.productOrders.actions.viewProduct', 'View Product')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-700/40 dark:hover:text-emerald-300 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">
                              {t('pages.seller.productOrders.actions.viewProduct', 'View Product')}
                            </span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty state */}
                {!loading && !error && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-0">
                      <div className="px-6 py-10">
                        <EmptyState
                          icon={ShoppingBag}
                          title={t(
                            'pages.seller.productOrders.empty.title',
                            'No product orders found'
                          )}
                          description={t(
                            'pages.seller.productOrders.empty.description',
                            'You have not received any product orders yet.'
                          )}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('common.prev', 'Previous')}
            </button>

            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {t('pages.seller.productOrders.pageMeta', 'Page {{page}} of {{totalPages}}', {
                page: pagination.page,
                totalPages: pagination.totalPages,
              })}
            </span>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {t('common.next', 'Next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Status Update Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={t('seller.productOrders.confirmStatusTitle', 'Update product order status\u061F')}
        description={t('seller.productOrders.confirmStatusMessage', 'This will update the fulfillment status for this product order.')}
        confirmText={t('seller.orders.actions.updateStatus', 'Update Status')}
        confirmVariant="primary"
        onConfirm={handleStatusUpdate}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        loading={updating}
      />
    </div>
  );
};

export default SellerProductOrders;
