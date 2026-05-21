import React, { useEffect, useMemo, useState } from 'react';
import { Package, Plus, ArrowLeft, Edit2, Trash2, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import { getSellerProducts } from '../../api/dashboardApi';
import { deleteProduct } from '../../api/productsApi';
import { extractArray, extractPagination } from '../../utils/apiResponse';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatCurrency } from '../../utils/formatCurrency';
import { cn } from '../../utils/cn';

const SellerProducts = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async (nextPage = 1, nextStatus = statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: nextPage,
        limit: pagination.limit,
      };
      if (nextStatus && nextStatus !== 'all') params.status = nextStatus;

      const result = await getSellerProducts(params);

      const productsArray = extractArray(result, ['products', 'items']);

      setProducts(productsArray);
      setPagination(extractPagination(result, productsArray));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          t('pages.seller.products.error', 'Could not load your products.')
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return safeProducts;
    return safeProducts.filter((p) => {
      const title = p?.title?.toLowerCase() || '';
      const desc = (p?.short_description || p?.description || '').toLowerCase();
      const category = p?.category?.name?.toLowerCase() || '';
      return title.includes(q) || desc.includes(q) || category.includes(q);
    });
  }, [safeProducts, search]);

  const statusOptions = [
    { value: 'all', label: t('common.all', 'All') },
    { value: 'active', label: t('common.active', 'Active') },
    { value: 'inactive', label: t('common.inactive', 'Inactive') },
    { value: 'draft', label: t('common.draft', 'Draft') },
  ];

  const handleDeleteClick = (product) => {
    setDeleteTarget(product);
    setShowDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    if (deleting) return;
    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  const handleDeleteConfirm = async () => {
    const productId = deleteTarget?.id;
    if (!productId) {
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      return;
    }

    setDeleting(true);
    try {
      await deleteProduct(productId);
      toast.success(
        t('pages.seller.products.toastDeleted', 'Product deleted successfully')
      );
      setProducts((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.filter((p) => p?.id !== productId);
      });
      setPagination((p) => ({
        ...p,
        total: typeof p?.total === 'number' ? Math.max(0, p.total - 1) : p?.total,
      }));
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          t('pages.seller.products.toastDeleteError', 'Could not delete product.')
      );
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link to="/seller">
            <Button variant="ghost" size="sm" className="px-3">
              <span className="inline-flex items-center gap-2">
                <ArrowLeft className={cn('w-4 h-4', isRTL && 'rotate-180')} />
                {t('pages.seller.back', 'Back')}
              </span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('sidebar.myProducts', 'My Products')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
              {t('pages.seller.products.subtitle', 'Manage and track your digital products.')}
            </p>
          </div>
        </div>
        <Link to="/seller/products/new">
          <Button icon={Plus}>{t('pages.seller.products.add', 'Add Product')}</Button>
        </Link>
      </div>

      {error && (
        <Card className="bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-900 dark:text-rose-100">{String(error)}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchProducts(1, statusFilter)}
            >
              {t('common.retry', 'Retry')}
            </Button>
          </div>
        </Card>
      )}

      <Card className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <Input
              placeholder={t(
                'pages.seller.products.searchPlaceholder',
                'Search products...'
              )}
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map((opt) => (
              <Button
                key={opt.value}
                size="sm"
                variant={statusFilter === opt.value ? 'primary' : 'outline'}
                onClick={() => {
                  const next = opt.value;
                  setStatusFilter(next);
                  setPagination((p) => ({ ...p, page: 1 }));
                  fetchProducts(1, next);
                }}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <span>
            {t('pages.seller.products.count', '{{count}} products', {
              count: pagination.total || filteredProducts.length,
            })}
          </span>
          <span>
            {t('pages.seller.products.pageMeta', 'Page {{page}} of {{totalPages}}', {
              page: pagination.page,
              totalPages: pagination.totalPages,
            })}
          </span>
        </div>
      </Card>

      {filteredProducts.length === 0 ? (
        <Card className="text-center py-16">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Package className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {t('pages.seller.products.empty.title', 'No products yet')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            {t(
              'pages.seller.products.empty.desc',
              'Create your first digital product and upload a downloadable file.'
            )}
          </p>
          <Link to="/seller/products/new">
            <Button icon={Plus}>{t('pages.seller.products.add', 'Add Product')}</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {product.thumbnail_url ? (
                    <img
                      src={product.thumbnail_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Package className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {product.title || t('pages.seller.untitled', 'Untitled')}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {product.short_description || product.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        {t('pages.seller.category', 'Category')}:
                      </span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {product.category?.name || t('pages.seller.uncategorized', 'Uncategorized')}
                      </span>
                    </div>

                    <Badge variant={product.status === 'active' ? 'success' : 'warning'} className="text-xs">
                      {product.status === 'active'
                        ? t('pages.seller.active', 'Active')
                        : product.status === 'inactive'
                        ? t('common.inactive', 'Inactive')
                        : t('pages.seller.draft', 'Draft')}
                    </Badge>

                    {product._count?.files > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {t('pages.seller.files', '{{count}} file', { count: product._count.files })}
                      </Badge>
                    )}

                    {product._count?.orders > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {t('pages.seller.sales', '{{count}} sale', { count: product._count.orders })}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-col-reverse items-end gap-2">
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t('pages.seller.price', 'Price')}
                    </p>
                    <p className="text-lg font-black text-emerald-600">
                      {product.price === 0 ? t('common.free', 'Free') : formatCurrency(product.price)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 rounded-lg"
                      title={t('common.edit', 'Edit')}
                      aria-label={t('common.edit', 'Edit')}
                      onClick={() => navigate(`/seller/products/${product.id}/edit`)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 rounded-lg text-rose-600 hover:text-rose-700 dark:text-rose-400"
                      title={t('common.delete', 'Delete')}
                      aria-label={t('common.delete', 'Delete')}
                      onClick={() => handleDeleteClick(product)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={pagination.page <= 1}
          onClick={() => {
            const next = Math.max(1, pagination.page - 1);
            setPagination((p) => ({ ...p, page: next }));
            fetchProducts(next, statusFilter);
          }}
        >
          {t('common.prev', 'Previous')}
        </Button>
        <Button
          variant="outline"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => {
            const next = Math.min(pagination.totalPages, pagination.page + 1);
            setPagination((p) => ({ ...p, page: next }));
            fetchProducts(next, statusFilter);
          }}
        >
          {t('common.next', 'Next')}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={t('pages.seller.products.deleteTitle', 'Delete this product?')}
        description={t(
          'pages.seller.products.deleteDesc',
          'This will remove it from public listings. You can create a new product anytime.'
        )}
        confirmText={t('pages.seller.products.confirmDelete', 'Delete product')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={deleting}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default SellerProducts;
