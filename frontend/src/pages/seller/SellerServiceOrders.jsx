import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ClipboardList,
  Filter,
  Hash,
  Briefcase,
  User,
  Coins,
  Activity,
  CalendarDays,
  Eye,
  MessageSquare,
  ShoppingBag,
  Clock,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

import { getSellerServiceOrders } from '../../api/dashboardApi';
import { extractArray, extractPagination } from '../../utils/apiResponse';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

/* ─── Status presentation ────────────────────────────────── */
const STATUS_TONE = {
  pending:     'bg-amber-100 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-700/40',
  in_progress: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200/70 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-700/40',
  delivered:   'bg-violet-100 text-violet-700 ring-1 ring-violet-200/70 dark:bg-violet-900/30 dark:text-violet-300 dark:ring-violet-700/40',
  completed:   'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-700/40',
  cancelled:   'bg-rose-100 text-rose-700 ring-1 ring-rose-200/70 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-700/40',
};

const statusBadgeClass = (status) =>
  STATUS_TONE[status?.toLowerCase()] ??
  'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700';

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

/* ─── Skeleton row ───────────────────────────────────────── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3.5 bg-slate-100 dark:bg-slate-700/60 rounded-full w-3/4" />
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

/* ─── Main Component ─────────────────────────────────────── */
const SellerServiceOrders = () => {
  const { t } = useLanguage();
  const { isSeller, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination]     = useState({
    page: 1, limit: 10, total: 0, totalPages: 1,
  });

  const debounceRef = useRef(null);

  /* ─── Fetch ──────────────────────────────────────────── */
  const fetchOrders = useCallback(async (overridePage) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page:  overridePage ?? pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter) params.status = statusFilter;

      const result = await getSellerServiceOrders(params);
      const arr = extractArray(result, ['orders']);

      setOrders(arr);
      setPagination(extractPagination(result, arr));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        t('pages.seller.serviceOrders.loadError', 'Failed to load service orders.')
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, t]);

  /* ─── Effects ────────────────────────────────────────── */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchOrders(1);
    }, 0);
    return () => clearTimeout(debounceRef.current);
  }, [statusFilter]); // eslint-disable-line

  useEffect(() => {
    fetchOrders();
  }, [pagination.page]); // eslint-disable-line

  /* ─── Permission guard ───────────────────────────────── */
  const canAccess = isSeller || isAdmin;
  if (!canAccess) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            {t(
              'pages.seller.serviceOrders.noAccess',
              'You need a seller account to view service orders.'
            )}
          </p>
        </div>
      </div>
    );
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  /* ─── Client-side search filter ──────────────────────── */
  const safeOrders = Array.isArray(orders) ? orders : [];
  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return safeOrders;
    return safeOrders.filter(order => {
      const serviceTitle = order?.service?.title?.toLowerCase() || '';
      const buyerName    = order?.buyer?.name?.toLowerCase()    || '';
      const buyerEmail   = order?.buyer?.email?.toLowerCase()   || '';
      return (
        serviceTitle.includes(term) ||
        buyerName.includes(term) ||
        buyerEmail.includes(term)
      );
    });
  }, [safeOrders, search]);

  /* ─── Stats (from current page) ──────────────────────── */
  const stats = useMemo(() => {
    const pendingCount = safeOrders.filter(o =>
      ['pending', 'in_progress', 'delivered'].includes(String(o?.status || '').toLowerCase())
    ).length;
    const completedCount = safeOrders.filter(o =>
      String(o?.status || '').toLowerCase() === 'completed'
    ).length;
    const revenue = safeOrders.reduce((sum, o) => sum + (Number(o?.price) || 0), 0);
    return {
      total: pagination.total ?? safeOrders.length,
      pending: pendingCount,
      completed: completedCount,
      revenue,
    };
  }, [safeOrders, pagination.total]);

  /* ─── Loading (initial) ──────────────────────────────── */
  if (loading && safeOrders.length === 0 && !error) {
    return <Loader />;
  }

  if (error && safeOrders.length === 0) {
    return <ErrorState error={error} onRetry={() => fetchOrders()} />;
  }

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative">
        <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block tracking-widest">
          {t('pages.seller.serviceOrders.kicker', 'Seller Workspace')}
        </span>
        <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mb-1">
          {t('pages.seller.serviceOrders.titlePrefix', 'Incoming Service')}{' '}
          <span className="font-serif italic text-emerald-600 dark:text-emerald-400">
            {t('pages.seller.serviceOrders.titleAccent', 'Orders')}
          </span>
        </h1>
        <p className="text-slate-600 dark:text-slate-300 font-medium">
          {t(
            'pages.seller.serviceOrders.subtitle',
            'Review every service order placed with you and keep delivery on track.'
          )}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label={t('pages.seller.serviceOrders.stats.total', 'Total Orders')}
          value={stats.total}
          icon={ShoppingBag}
          tone="indigo"
        />
        <StatTile
          label={t('pages.seller.serviceOrders.stats.pending', 'Pending')}
          value={stats.pending}
          sublabel={t('pages.seller.serviceOrders.stats.onThisPage', 'On this page')}
          icon={Clock}
          tone="amber"
        />
        <StatTile
          label={t('pages.seller.serviceOrders.stats.completed', 'Completed')}
          value={stats.completed}
          sublabel={t('pages.seller.serviceOrders.stats.onThisPage', 'On this page')}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatTile
          label={t('pages.seller.serviceOrders.stats.revenue', 'Revenue')}
          value={formatCurrency(stats.revenue || 0)}
          sublabel={t('pages.seller.serviceOrders.stats.currentPage', 'Current page')}
          icon={DollarSign}
          tone="sky"
        />
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
            placeholder={t(
              'pages.seller.serviceOrders.searchPlaceholder',
              'Search by service or buyer...'
            )}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none pl-9 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition cursor-pointer"
          >
            <option value="">{t('pages.seller.serviceOrders.allStatuses', 'All Statuses')}</option>
            <option value="pending">{t('status.pending', 'Pending')}</option>
            <option value="in_progress">{t('status.in_progress', 'In Progress')}</option>
            <option value="delivered">{t('status.delivered', 'Delivered')}</option>
            <option value="completed">{t('status.completed', 'Completed')}</option>
            <option value="cancelled">{t('status.cancelled', 'Cancelled')}</option>
          </select>
        </div>

        {/* Result counter */}
        <div className="hidden sm:flex items-center px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {t('pages.seller.serviceOrders.totalCount', '{{count}} total', {
            count: pagination.total ?? safeOrders.length,
          })}
        </div>
      </div>

      {/* Inline error banner */}
      {error && safeOrders.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => fetchOrders()}
            className="text-xs font-semibold uppercase tracking-widest text-rose-700 dark:text-rose-300 hover:underline"
          >
            {t('common.retry', 'Retry')}
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    {t('pages.seller.serviceOrders.columns.orderId', 'Order ID')}
                  </span>
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    {t('pages.seller.serviceOrders.columns.service', 'Service')}
                  </span>
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {t('pages.seller.serviceOrders.columns.buyer', 'Buyer')}
                  </span>
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" />
                    {t('pages.seller.serviceOrders.columns.amount', 'Amount')}
                  </span>
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    {t('pages.seller.serviceOrders.columns.status', 'Status')}
                  </span>
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {t('pages.seller.serviceOrders.columns.created', 'Created')}
                  </span>
                </th>
                <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  {t('pages.seller.serviceOrders.columns.actions', 'Actions')}
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
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                      #{order.id}
                    </span>
                  </td>

                  {/* Service */}
                  <td className="px-4 py-3.5">
                    <p
                      dir="auto"
                      className="font-semibold text-slate-900 dark:text-white truncate max-w-[260px]"
                    >
                      {order.service?.title ||
                        t('pages.seller.serviceOrders.untitledService', 'Untitled service')}
                    </p>
                  </td>

                  {/* Buyer */}
                  <td className="px-4 py-3.5">
                    <div className="min-w-0">
                      <p
                        dir="auto"
                        className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px]"
                      >
                        {order.buyer?.name ||
                          t('pages.seller.serviceOrders.unknownBuyer', 'Unknown buyer')}
                      </p>
                      {order.buyer?.email && (
                        <p
                          dir="auto"
                          className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]"
                        >
                          {order.buyer.email}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(order.price)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusBadgeClass(order.status)}`}
                    >
                      {statusLabel(order.status, t)}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                    {formatDate(order.created_at) || '—'}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/service-orders/${order.id}`)}
                        title={t('pages.seller.serviceOrders.actions.viewDetails', 'View Details')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-700/40 dark:hover:text-emerald-300 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">
                          {t('pages.seller.serviceOrders.actions.viewDetails', 'View Details')}
                        </span>
                      </button>
                      <button
                        onClick={() => navigate(`/service-orders/${order.id}`)}
                        title={t('pages.seller.serviceOrders.actions.messages', 'Messages')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:border-indigo-700/40 dark:hover:text-indigo-300 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">
                          {t('pages.seller.serviceOrders.actions.messages', 'Messages')}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Empty state */}
              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-0">
                    <div className="px-6 py-10">
                      <EmptyState
                        icon={ClipboardList}
                        title={
                          search || statusFilter
                            ? t(
                                'pages.seller.serviceOrders.emptyFilteredTitle',
                                'No matching orders'
                              )
                            : t(
                                'pages.seller.serviceOrders.empty.title',
                                'No service orders found'
                              )
                        }
                        description={
                          search || statusFilter
                            ? t(
                                'pages.seller.serviceOrders.emptyFilteredDesc',
                                'Try a different search term or change the status filter.'
                              )
                            : t(
                                'pages.seller.serviceOrders.empty.description',
                                'You have not received any service orders yet.'
                              )
                        }
                      />
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
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
              {t('pages.seller.serviceOrders.pageMeta', 'Page {{page}} of {{totalPages}}', {
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
    </div>
  );
};

export default SellerServiceOrders;
