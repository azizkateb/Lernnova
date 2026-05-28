import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ShoppingBag,
  Eye,
  User,
  Clock,
  CheckCircle,
  DollarSign,
  XCircle,
} from 'lucide-react';
import { getAdminProductOrders } from '../../api/dashboardApi';
import { updateProductOrderPaymentStatus } from '../../api/productOrdersApi';
import { extractArray, extractPagination } from '../../utils/apiResponse';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';

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

const PaymentStatusControl = ({ currentStatus, onSelect, disabled, t }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue('');
  }, [currentStatus]);

  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => {
        const next = e.target.value;
        setValue('');
        if (!next || next === currentStatus) return;
        onSelect(next);
      }}
      className="px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="">{t('admin.productOrders.actions.updatePayment', 'Update payment')}</option>
      <option value="pending">{t('admin.productOrders.actions.resetPending', 'Reset pending')}</option>
      <option value="paid">{t('admin.productOrders.actions.markPaid', 'Mark paid')}</option>
      <option value="failed">{t('admin.productOrders.actions.markFailed', 'Mark failed')}</option>
      <option value="refunded">{t('admin.productOrders.actions.markRefunded', 'Mark refunded')}</option>
    </select>
  );
};

/* ─── Skeleton row ────────────────────────────────────────── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 10 }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-3/4" />
      </td>
    ))}
  </tr>
);

/* ─── Main Component ──────────────────────────────────────── */
const AllProductOrders = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders]                     = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [search, setSearch]                     = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter]     = useState('');
  const [paymentConfirmOpen, setPaymentConfirmOpen] = useState(false);
  const [paymentConfirmTarget, setPaymentConfirmTarget] = useState(null);
  const [paymentUpdating, setPaymentUpdating] = useState(false);
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

  const openPaymentConfirm = (orderId, nextStatus) => {
    setPaymentConfirmTarget({ orderId, nextStatus });
    setPaymentConfirmOpen(true);
  };

  const closePaymentConfirm = () => {
    if (paymentUpdating) return;
    setPaymentConfirmOpen(false);
    setPaymentConfirmTarget(null);
  };

  const confirmPaymentUpdate = async () => {
    if (!paymentConfirmTarget) return;
    setPaymentUpdating(true);
    try {
      await updateProductOrderPaymentStatus(paymentConfirmTarget.orderId, paymentConfirmTarget.nextStatus);
      toast.success(t('admin.productOrders.paymentUpdated', 'Payment status updated successfully.'));
      setPaymentConfirmOpen(false);
      setPaymentConfirmTarget(null);
      await fetchOrders();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t('dashboard.admin.loadingProductOrders', 'Failed to load orders');
      toast.error(message);
    } finally {
      setPaymentUpdating(false);
    }
  };

  /* ─── Stats (computed from current page) ──────────────── */
  const stats = {
    total: pagination.total || orders.length,
    pendingPayments: orders.filter(o => o.payment_status === 'pending').length,
    paidOrders: orders.filter(o => o.payment_status === 'paid').length,
    completedOrders: orders.filter(o => o.order_status === 'completed').length,
    revenue: orders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0),
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <ShoppingBag className="w-4 h-4" />
            {t('dashboard.admin.totalOrders', 'Total Orders')}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.total}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-medium mb-1">
            <Clock className="w-4 h-4" />
            {t('dashboard.admin.pendingPayments', 'Pending Payments')}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.pendingPayments}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">
            {t('dashboard.admin.onThisPage', 'On this page')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-1">
            <CheckCircle className="w-4 h-4" />
            {t('dashboard.admin.paid', 'Paid')}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.paidOrders}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">
            {t('dashboard.admin.onThisPage', 'On this page')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-medium mb-1">
            <CheckCircle className="w-4 h-4" />
            {t('dashboard.admin.completed', 'Completed')}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.completedOrders}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">
            {t('dashboard.admin.onThisPage', 'On this page')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-1">
            <DollarSign className="w-4 h-4" />
            {t('dashboard.admin.revenue', 'Revenue')}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(stats.revenue)}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">
            {t('dashboard.admin.onThisPage', 'On this page')}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
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
          className="w-full sm:w-auto px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition cursor-pointer"
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
          className="w-full sm:w-auto px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition cursor-pointer"
        >
          <option value="">{t('dashboard.admin.allOrderStatuses', 'All Order Statuses')}</option>
          <option value="new">{t('status.new', 'New')}</option>
          <option value="completed">{t('status.completed', 'Completed')}</option>
          <option value="cancelled">{t('status.cancelled', 'Cancelled')}</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
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
          <>
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse p-4 space-y-3">
                <div className="h-4 w-24 rounded-full bg-slate-100 dark:bg-slate-700" />
                <div className="h-5 w-2/3 rounded-full bg-slate-100 dark:bg-slate-700" />
                <div className="h-4 w-1/2 rounded-full bg-slate-100 dark:bg-slate-700" />
              </div>
            ))}

            {!loading && filteredOrders.map((order) => (
              <div key={order.id} className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {t('dashboard.admin.orderNumber', 'Order #')}
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-300">#{order.id}</p>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDate(order.created_at) || '—'}
                  </span>
                </div>

                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    {order.product?.title || '—'}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {t('dashboard.admin.buyer', 'Buyer')}: {order.buyer?.name || '—'}
                  </p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {t('dashboard.admin.seller', 'Seller')}: {order.seller?.name || '—'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900/60">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {t('dashboard.admin.price', 'Amount')}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">{formatCurrency(order.price)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900/60">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {t('dashboard.admin.paymentMethod', 'Payment Method')}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">{capitalize(order.payment_method)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${paymentStatusBadgeClass(order.payment_status)}`}>
                    {statusLabel(order.payment_status, t)}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${orderStatusBadgeClass(order.order_status)}`}>
                    {statusLabel(order.order_status, t)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <PaymentStatusControl
                      currentStatus={order.payment_status}
                      disabled={loading || paymentUpdating}
                      t={t}
                      onSelect={(nextStatus) => openPaymentConfirm(order.id, nextStatus)}
                    />
                  </div>
                  {order.product?.id ? (
                    <button
                      onClick={() => navigate(`/products/${order.product.id}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
                    >
                      <Eye className="h-4 w-4" />
                      {t('dashboard.admin.viewProduct', 'View Product')}
                    </button>
                  ) : null}
                  {order.buyer?.profile_slug || order.buyer?.public_id ? (
                    <button
                      onClick={() => navigate(`/profile/${order.buyer.profile_slug || order.buyer.public_id}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                    >
                      <User className="h-4 w-4" />
                      {t('dashboard.admin.buyerProfile', 'Buyer Profile')}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}

            {!loading && !error && filteredOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-slate-200 dark:text-slate-700" />
                <p className="font-semibold text-slate-600 dark:text-slate-400">
                  {t('dashboard.admin.noProductOrdersFound', 'No product orders found')}
                </p>
                <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                  {t('dashboard.admin.noProductOrdersSubtitle', 'No product orders have been placed yet.')}
                </p>
              </div>
            ) : null}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.orderNumber', 'Order #')}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.productColumn', 'Product')}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.buyer', 'Buyer')}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.seller', 'Seller')}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.price', 'Amount')}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.paymentMethod', 'Payment Method')}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.paymentStatus', 'Payment Status')}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.orderStatus', 'Order Status')}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.createdColumn', 'Created')}
                  </th>
                  <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {/* Loading skeletons */}
                {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                {/* Data rows */}
                {!loading && filteredOrders.map(order => (
                  <tr
                    key={order.id}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    {/* Order # */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        #{order.id}
                      </span>
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {order.product?.title || '—'}
                      </p>
                    </td>

                    {/* Buyer */}
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {order.buyer?.name || '—'}
                      </p>
                    </td>

                    {/* Seller */}
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {order.seller?.name || '—'}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(order.price)}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-700 dark:text-slate-300">
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
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <PaymentStatusControl
                          currentStatus={order.payment_status}
                          disabled={loading || paymentUpdating}
                          t={t}
                          onSelect={(nextStatus) => openPaymentConfirm(order.id, nextStatus)}
                        />
                        {order.product?.id && (
                          <button
                            onClick={() => navigate(`/products/${order.product.id}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 transition-colors"
                            title={t('dashboard.admin.viewProduct', 'View Product')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {order.buyer?.profile_slug || order.buyer?.public_id ? (
                          <button
                            onClick={() => navigate(`/profile/${order.buyer.profile_slug || order.buyer.public_id}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                            title={t('dashboard.admin.buyerProfile', 'Buyer Profile')}
                          >
                            <User className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty state */}
                {!loading && !error && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-20 text-center">
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
          </>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 px-4 py-4 border-t border-slate-200 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
      <ConfirmDialog
        isOpen={paymentConfirmOpen}
        title={t('admin.productOrders.confirmPaymentTitle', 'Update payment status?')}
        description={t(
          'admin.productOrders.confirmPaymentMessage',
          'This is a manual admin action for testing or correction. Stripe webhooks will normally update payment status automatically.'
        )}
        confirmText={t('common.confirm', 'Confirm')}
        cancelText={t('common.cancel', 'Cancel')}
        confirmVariant="primary"
        loading={paymentUpdating}
        onConfirm={confirmPaymentUpdate}
        onCancel={closePaymentConfirm}
      />
    </div>
  );
};

export default AllProductOrders;
