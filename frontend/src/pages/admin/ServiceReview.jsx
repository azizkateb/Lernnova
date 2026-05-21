import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, ExternalLink, Briefcase, AlertCircle, Clock, ShoppingBag } from 'lucide-react';
import { getAdminServices } from '../../api/dashboardApi';
import { extractArray, extractPagination } from '../../utils/apiResponse';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Link } from 'react-router-dom';

/* ─── Helpers ─────────────────────────────────────────────── */
const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-sky-500', 'bg-violet-500',
  'bg-rose-500', 'bg-amber-500', 'bg-teal-500',
];
const avatarColor = (name = '') => {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

/* ─── Sub-components ──────────────────────────────────────── */
const AvatarInitials = ({ name }) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${avatarColor(name)}`}>
    {getInitials(name)}
  </div>
);

const StatusBadge = ({ status, t }) => {
  const map = {
    active:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    inactive: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    draft:    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  };
  const cls = map[status?.toLowerCase()] ?? map.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${cls}`}>
      {status || 'draft'}
    </span>
  );
};

/* ─── Skeleton row ────────────────────────────────────────── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-3/4" />
      </td>
    ))}
  </tr>
);

/* ─── Main Component ──────────────────────────────────────── */
const ServiceReview = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1, limit: 10, total: 0, totalPages: 1,
  });

  const debounceRef = useRef(null);

  /* ─── Fetch ───────────────────────────────────────────── */
  const fetchServices = useCallback(async (overridePage) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page:  overridePage ?? pagination.page,
        limit: pagination.limit,
      };
      if (search)       params.search = search;
      if (statusFilter) params.status = statusFilter;

      const result = await getAdminServices(params);

      const arr = extractArray(result, ['services']);

      setServices(arr);
      setPagination(extractPagination(result, arr));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter]); // eslint-disable-line

  /* ─── Effects ─────────────────────────────────────────── */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchServices(1);
    }, search ? 400 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [search, statusFilter]); // eslint-disable-line

  useEffect(() => {
    fetchServices();
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

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <span className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block tracking-widest">
          Admin
        </span>
        <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mb-1">
          {t('dashboard.admin.serviceReview', 'Service')}{' '}
          <span className="font-serif italic text-emerald-600">
            {t('dashboard.admin.serviceReviewAccent', 'Review')}
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {t('dashboard.admin.serviceReviewSubtitle', 'Review and manage services submitted by sellers.')}
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
            placeholder={t('dashboard.admin.searchServices', 'Search services by title or seller...')}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition cursor-pointer"
        >
          <option value="">{t('dashboard.admin.allStatuses', 'All Statuses')}</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              {t('dashboard.admin.errorLoadingUsers', 'Could not load data. Please try again.')}
            </p>
            <button
              onClick={() => fetchServices()}
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
                    {t('dashboard.admin.serviceColumn', 'Service')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.seller', 'Seller')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden md:table-cell">
                    {t('dashboard.admin.price', 'Price')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                    {t('dashboard.admin.deliveryTime', 'Delivery')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                    {t('dashboard.admin.ordersCount', 'Orders')}
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden sm:table-cell">
                    Created
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.actionsColumn', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {/* Loading skeletons */}
                {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                {/* Data rows */}
                {!loading && services.map(service => (
                  <tr
                    key={service.id}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    {/* Service */}
                    <td className="px-6 py-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {service.title || '—'}
                        </p>
                        {service.category?.name && (
                          <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                            {service.category.name}
                          </span>
                        )}
                        {service.short_description && (
                          <p className="text-[12px] text-slate-400 truncate mt-0.5 max-w-[240px]">
                            {service.short_description.length > 60
                              ? service.short_description.slice(0, 60) + '…'
                              : service.short_description}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Seller */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <AvatarInitials name={service.user?.name || 'S'} />
                        <span className="text-slate-700 dark:text-slate-300 truncate text-sm">
                          {service.user?.name || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(service.price)}
                      </span>
                    </td>

                    {/* Delivery */}
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{service.delivery_time ?? '—'} {t('dashboard.admin.daysUnit', 'days')}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={service.status} t={t} />
                    </td>

                    {/* Orders */}
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        {service._count?.orders ?? 0}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {service.created_at ? formatDate(service.created_at) : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/services/${service.slug || service.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                      >
                        {t('dashboard.admin.viewDetails', 'View Details')}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}

                {/* Empty state */}
                {!loading && !error && services.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <Briefcase className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-600 dark:text-slate-400 font-semibold">
                        {t('dashboard.admin.noServicesFound', 'No services found')}
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                        {t('dashboard.admin.noServicesSubtitle', 'Try adjusting your search or filters.')}
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

export default ServiceReview;
