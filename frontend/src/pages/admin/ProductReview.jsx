import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertCircle,
  FileText,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAdminProducts } from '../../api/dashboardApi';
import { updateProduct, deleteProduct } from '../../api/productsApi';
import { getProductCategories } from '../../api/categoriesApi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { extractArray, extractPagination } from '../../utils/apiResponse';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

/* ─── Constants ───────────────────────────────────────────── */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

const resolveThumbnailUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) return `${API_URL}${url}`;
  return url;
};

/* ─── Sub-components ──────────────────────────────────────── */
const AvatarInitials = ({ name }) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${avatarColor(name)}`}>
    {getInitials(name)}
  </div>
);

const StatusBadge = ({ status }) => {
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

const ProductThumbnail = ({ product }) => {
  const url = resolveThumbnailUrl(product.thumbnail_url);
  if (url) {
    return (
      <img
        src={url}
        alt={product.title || 'Product'}
        className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
      <Package className="w-5 h-5 text-white" />
    </div>
  );
};

/* ─── Skeleton row ────────────────────────────────────────── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-3/4" />
      </td>
    ))}
  </tr>
);

/* ─── Stat Card ───────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, accent = 'slate', sublabel }) => {
  const accentMap = {
    slate:   'text-slate-500 dark:text-slate-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber:   'text-amber-600 dark:text-amber-400',
    indigo:  'text-indigo-600 dark:text-indigo-400',
    rose:    'text-rose-600 dark:text-rose-400',
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className={`flex items-center gap-2 text-xs font-semibold mb-1.5 ${accentMap[accent]}`}>
        <Icon className="w-4 h-4" />
        <span className="uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{value}</div>
      {sublabel && (
        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{sublabel}</div>
      )}
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────── */
const ProductReview = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, product: null, action: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1, limit: 10, total: 0, totalPages: 1,
  });

  const debounceRef = useRef(null);

  /* ─── Fetch categories ────────────────────────────────── */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getProductCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load product categories:', err);
      }
    };
    fetchCategories();
  }, []);

  /* ─── Fetch products ──────────────────────────────────── */
  const fetchProducts = useCallback(async (overridePage) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page:  overridePage ?? pagination.page,
        limit: pagination.limit,
      };
      if (search.trim())                                params.search      = search.trim();
      if (statusFilter)                                 params.status      = statusFilter;
      if (categoryFilter && categoryFilter !== 'all')   params.category_id = categoryFilter;

      const result = await getAdminProducts(params);

      const arr = extractArray(result, ['products']);

      setProducts(arr);
      setPagination(extractPagination(result, arr));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, categoryFilter]); // eslint-disable-line

  /* ─── Effects ─────────────────────────────────────────── */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts(1);
    }, search ? 400 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [search, statusFilter, categoryFilter]); // eslint-disable-line

  useEffect(() => {
    fetchProducts();
  }, [pagination.page]); // eslint-disable-line

  /* ─── Action handlers ─────────────────────────────────── */
  const handleStatusToggle = async (product, newStatus) => {
    try {
      await updateProduct(product.id, { status: newStatus });
      setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, status: newStatus } : p)));
      toast.success(
        newStatus === 'active'
          ? t('dashboard.admin.productActivated', 'Product activated')
          : t('dashboard.admin.productDeactivated', 'Product deactivated')
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          t('dashboard.admin.updateProductFailed', 'Failed to update product status')
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDialog.product) return;
    setActionLoading(true);
    try {
      await deleteProduct(confirmDialog.product.id);
      setProducts(prev => prev.filter(p => p.id !== confirmDialog.product.id));
      toast.success(t('dashboard.admin.productDeleted', 'Product deleted successfully'));
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          t('dashboard.admin.deleteProductFailed', 'Failed to delete product')
      );
    } finally {
      setActionLoading(false);
      setConfirmDialog({ isOpen: false, product: null, action: null });
    }
  };

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

  /* Stats (current page) */
  const stats = {
    total:       pagination.total || products.length,
    active:      products.filter(p => p.status === 'active').length,
    inactive:    products.filter(p => p.status === 'inactive').length,
    draft:       products.filter(p => p.status === 'draft').length,
    totalOrders: products.reduce((sum, p) => sum + (p._count?.orders || 0), 0),
    totalFiles:  products.reduce((sum, p) => sum + (p._count?.files || 0), 0),
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
          {t('dashboard.admin.productReview', 'Product')}{' '}
          <span className="font-serif italic text-emerald-600">
            {t('dashboard.admin.productReviewAccent', 'Review')}
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {t('dashboard.admin.productReviewSubtitle', 'Review and manage digital products listed in the marketplace.')}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          icon={Package}
          label={t('dashboard.admin.totalProducts', 'Total Products')}
          value={stats.total}
        />
        <StatCard
          icon={CheckCircle}
          label={t('dashboard.admin.active', 'Active')}
          value={stats.active}
          accent="emerald"
          sublabel={t('dashboard.admin.onThisPage', 'On this page')}
        />
        <StatCard
          icon={XCircle}
          label={t('dashboard.admin.inactive', 'Inactive')}
          value={stats.inactive}
          accent="amber"
          sublabel={t('dashboard.admin.onThisPage', 'On this page')}
        />
        <StatCard
          icon={FileText}
          label={t('dashboard.admin.draft', 'Draft')}
          value={stats.draft}
          sublabel={t('dashboard.admin.onThisPage', 'On this page')}
        />
        <StatCard
          icon={ShoppingBag}
          label={t('dashboard.admin.totalOrders', 'Orders')}
          value={stats.totalOrders}
          accent="indigo"
          sublabel={t('dashboard.admin.onThisPage', 'On this page')}
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
            placeholder={t('dashboard.admin.searchProducts', 'Search products by title or seller...')}
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

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={e => {
            setCategoryFilter(e.target.value);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition cursor-pointer"
        >
          <option value="all">{t('common.allCategories', 'All Categories')}</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              {t('dashboard.admin.errorLoadingUsers', 'Could not load data. Please try again.')}
            </p>
            <button
              onClick={() => fetchProducts()}
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
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.productColumn', 'Product')}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.seller', 'Seller')}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden md:table-cell">
                    {t('dashboard.admin.price', 'Price')}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                    {t('dashboard.admin.filesCount', 'Files')}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                    {t('dashboard.admin.ordersCount', 'Orders')}
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden sm:table-cell">
                    Created
                  </th>
                  <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {t('dashboard.admin.actionsColumn', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {/* Loading skeletons */}
                {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                {/* Data rows */}
                {!loading && products.map(product => (
                  <tr
                    key={product.id}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    {/* Product */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <ProductThumbnail product={product} />
                        <div className="min-w-0 max-w-[240px]">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {product.title || '—'}
                          </p>
                          {product.category?.name && (
                            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                              {product.category.name}
                            </span>
                          )}
                          {product.short_description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                              {product.short_description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Seller */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AvatarInitials name={product.user?.name || 'S'} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                            {product.user?.name || '—'}
                          </p>
                          {product.user?.email && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                              {product.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(product.price)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={product.status} />
                    </td>

                    {/* Files */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="tabular-nums">{product._count?.files ?? 0}</span>
                      </div>
                    </td>

                    {/* Orders */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-slate-600 dark:text-slate-300 font-medium tabular-nums">
                        {product._count?.orders ?? 0}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {product.created_at ? formatDate(product.created_at) : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View */}
                        <button
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                          title={t('common.view', 'View')}
                          aria-label={t('common.view', 'View')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => navigate(`/seller/products/${product.id}/edit`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 transition-colors"
                          title={t('common.edit', 'Edit')}
                          aria-label={t('common.edit', 'Edit')}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Activate / Deactivate */}
                        {product.status === 'active' ? (
                          <button
                            onClick={() => handleStatusToggle(product, 'inactive')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-900/20 transition-colors"
                            title={t('dashboard.admin.deactivate', 'Deactivate')}
                            aria-label={t('dashboard.admin.deactivate', 'Deactivate')}
                          >
                            <ToggleRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusToggle(product, 'active')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors"
                            title={t('dashboard.admin.activate', 'Activate')}
                            aria-label={t('dashboard.admin.activate', 'Activate')}
                          >
                            <ToggleLeft className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => setConfirmDialog({ isOpen: true, product, action: 'delete' })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                          title={t('common.delete', 'Delete')}
                          aria-label={t('common.delete', 'Delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty state */}
                {!loading && !error && products.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <Package className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-600 dark:text-slate-400 font-semibold">
                        {t('dashboard.admin.noProductsFound', 'No products found')}
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                        {t('dashboard.admin.noProductsSubtitle', 'Try adjusting your search or filters.')}
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
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

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={t('dashboard.admin.deleteProductTitle', 'Delete this product?')}
        description={t(
          'dashboard.admin.deleteProductDescription',
          'This will remove it from public listings. This action cannot be undone.',
        )}
        confirmText={t('common.delete', 'Delete')}
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, product: null, action: null })}
        loading={actionLoading}
      />
    </div>
  );
};

export default ProductReview;
