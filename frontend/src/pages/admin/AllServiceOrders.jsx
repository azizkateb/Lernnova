import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, AlertCircle, MessageSquare, FileText, ClipboardList, Briefcase, Clock, Loader2, CheckCircle2, DollarSign, Eye, ExternalLink } from 'lucide-react';
import { getAdminServiceOrders } from '../../api/dashboardApi';
import { extractArray, extractPagination } from '../../utils/apiResponse';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { useNavigate } from 'react-router-dom';

/* ─── Helpers ─────────────────────────────────────────────── */
const statusBadgeClass = (status) => {
  const map = {
    pending:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    in_progress:'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    delivered:  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    completed:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    cancelled:  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  };
  return map[status?.toLowerCase()] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
};

const statusLabel = (status, t) => {
  const keyMap = {
    pending:     'status.pending',
    in_progress: 'status.in_progress',
    delivered:   'status.delivered',
    completed:   'status.completed',
    cancelled:   'status.cancelled',
  };
  const key = keyMap[status?.toLowerCase()];
  const fallback = status ? status.replace(/_/g, ' ') : '—';
  return key ? t(key, fallback) : fallback;
};

/* ─── Skeleton row ────────────────────────────────────────── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 11 }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-3/4" />
      </td>
    ))}
  </tr>
);

/* ─── Main Component ──────────────────────────────────────── */
const AllServiceOrders = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination]   = useState({
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
      if (statusFilter) params.status = statusFilter;

      const result = await getAdminServiceOrders(params);

      const arr = extractArray(result, ['orders']);

      setOrders(arr);
      setPagination(extractPagination(result, arr));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('dashboard.admin.loadingServiceOrders', 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, t]);

  /* ─── Effects ─────────────────────────────────────────── */
  // Debounced search + filter trigger (search is client-side, but filter triggers refetch)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchOrders(1);
    }, search ? 400 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [search, statusFilter]); // eslint-disable-line

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

  /* ─── Page-level stats (computed from current page data) ─ */
  const stats = {
    total: pagination.total || orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders
      .filter(o => String(o?.payment_status || '').toLowerCase() === 'paid')
      .reduce((sum, o) => sum + (Number(o?.price) || 0), 0),
  };

  /* ─── Client-side search filter ───────────────────────── */
  const filteredOrders = orders.filter(order => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    const serviceTitle = order.service?.title || '';
    const buyerName    = order.buyer?.name    || '';
    const sellerName   = order.seller?.name   || '';
    return (
      serviceTitle.toLowerCase().includes(term) ||
      buyerName.toLowerCase().includes(term)    ||
      sellerName.toLowerCase().includes(term)
    );
  });

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <span className="bg-slate-900 dark:bg-slate-700 dark:text-white text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block tracking-widest">
          Admin
        </span>
        <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mb-1">
          {t('dashboard.admin.allServiceOrders', 'All Service')}{' '}
          <span className="font-serif italic text-emerald-600">
            {t('dashboard.admin.allServiceOrdersAccent', 'Orders')}
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {t('dashboard.admin.allServiceOrdersSubtitle', 'Track every service order across the marketplace.')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Orders */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <Briefcase className="w-4 h-4" />
            <span>{t('dashboard.admin.totalOrders', 'Total Orders')}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-medium mb-1">
            <Clock className="w-4 h-4" />
            <span>{t('status.pending', 'Pending')}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {t('dashboard.admin.onThisPage', 'On this page')}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-medium mb-1">
            <Loader2 className="w-4 h-4" />
            <span>{t('status.in_progress', 'In Progress')}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inProgress}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {t('dashboard.admin.onThisPage', 'On this page')}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('status.completed', 'Completed')}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completed}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {t('dashboard.admin.onThisPage', 'On this page')}
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-1">
            <DollarSign className="w-4 h-4" />
            <span>{t('dashboard.admin.revenue', 'Revenue')}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white truncate">
            {formatCurrency(stats.revenue)}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
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
            placeholder={t('dashboard.admin.searchServiceOrders', 'Search by service, buyer, or seller...')}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition cursor-pointer"
        >
          <option value="">{t('dashboard.admin.allStatuses', 'All Statuses')}</option>
          <option value="pending">{t('status.pending', 'Pending')}</option>
          <option value="in_progress">{t('status.in_progress', 'In Progress')}</option>
          <option value="delivered">{t('status.delivered', 'Delivered')}</option>
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
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700/50">
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse p-4 space-y-3">
                <div className="h-4 w-24 rounded-full bg-slate-100 dark:bg-slate-700" />
                <div className="h-5 w-2/3 rounded-full bg-slate-100 dark:bg-slate-700" />
                <div className="h-4 w-1/2 rounded-full bg-slate-100 dark:bg-slate-700" />
              </div>
            ))}

            {!loading && filteredOrders.map((order) => (
              <div
                key={order.id}
                className="space-y-4 p-4"
                onClick={() => navigate(`/service-orders/${order.id}`)}
              >
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
                    {order.service?.title || '—'}
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
                      {t('dashboard.admin.deadline', 'Deadline')}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">{formatDate(order.delivery_deadline) || '—'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${statusBadgeClass(order.status)}`}>
                    {statusLabel(order.status, t)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {order._count?.messages ?? 0}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <FileText className="h-3.5 w-3.5" />
                    {order._count?.files ?? 0}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/service-orders/${order.id}`)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
                  >
                    <Eye className="h-4 w-4" />
                    {t('dashboard.admin.viewDetails', 'View Details')}
                  </button>
                  <button
                    onClick={() => navigate(`/service-orders/${order.id}`)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {t('dashboard.admin.messages', 'Messages')}
                  </button>
                  {order.service ? (
                    <button
                      onClick={() => navigate(`/services/${order.service.id || order.service_id}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-300"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t('dashboard.admin.viewService', 'View Service')}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}

            {!loading && !error && filteredOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <ClipboardList className="mx-auto mb-3 h-12 w-12 text-slate-200 dark:text-slate-700" />
                <p className="font-semibold text-slate-600 dark:text-slate-400">
                  {t('dashboard.admin.noServiceOrdersFound', 'No service orders found')}
                </p>
                <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                  {t('dashboard.admin.noServiceOrdersSubtitle', 'No service orders have been placed yet.')}
                </p>
              </div>
            ) : null}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-slate-50 dark:bg-slate-900/30">
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.orderNumber', 'Order #')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.serviceColumn', 'Service')}
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
                    {t('dashboard.admin.statusColumn', 'Status')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.messagesCount', 'Messages')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.filesCount', 'Files')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.deadline', 'Deadline')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.createdColumn', 'Created')}
                  </th>
                  <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.actions', 'Actions')}
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
                    onClick={() => navigate(`/service-orders/${order.id}`)}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    {/* Order # */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        #{order.id}
                      </span>
                    </td>

                    {/* Service */}
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {order.service?.title || '—'}
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

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusBadgeClass(order.status)}`}>
                        {statusLabel(order.status, t)}
                      </span>
                    </td>

                    {/* Messages */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-xs">{order._count?.messages ?? 0}</span>
                      </div>
                    </td>

                    {/* Files */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="text-xs">{order._count?.files ?? 0}</span>
                      </div>
                    </td>

                    {/* Deadline */}
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                      {formatDate(order.delivery_deadline) || '—'}
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                      {formatDate(order.created_at) || '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/service-orders/${order.id}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 transition-colors"
                          title={t('dashboard.admin.viewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/service-orders/${order.id}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                          title={t('dashboard.admin.messages', 'Messages')}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        {order.service && (
                          <button
                            onClick={() => navigate(`/services/${order.service.id || order.service_id}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors"
                            title={t('dashboard.admin.viewService', 'View Service')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty state */}
                {!loading && !error && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-20 text-center">
                      <ClipboardList className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-600 dark:text-slate-400 font-semibold">
                        {t('dashboard.admin.noServiceOrdersFound', 'No service orders found')}
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                        {t('dashboard.admin.noServiceOrdersSubtitle', 'No service orders have been placed yet.')}
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
          <div className="flex flex-col gap-3 px-4 py-4 border-t border-gray-100 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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

export default AllServiceOrders;
