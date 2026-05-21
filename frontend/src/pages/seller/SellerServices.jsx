import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Plus, Search, Calendar, Clock, Tag, ShoppingBag, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSellerServices } from '../../api/dashboardApi';
import { deleteService } from '../../api/servicesApi';
import { extractArray, extractPagination } from '../../utils/apiResponse';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const SellerServices = () => {
  const { t } = useLanguage();
  const { isSeller, isAdmin } = useAuth();

  const [services, setServices] = useState([]);
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchServices = async (nextPage = pagination.page, nextStatus = statusFilter) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: nextPage,
        limit: pagination.limit,
      };
      if (nextStatus && nextStatus !== 'all') params.status = nextStatus;

      const result = await getSellerServices(params);

      const servicesArray = extractArray(result, ['services', 'items']);

      setServices(servicesArray);
      setPagination(extractPagination(result, servicesArray));
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) {
        setError(t('pages.seller.services.noAccess', 'You need a seller account to manage services.'));
      } else {
        setError(t('pages.seller.services.loadError', 'Could not load your services. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(1, statusFilter);
  }, []);

  const safeServices = Array.isArray(services) ? services : [];

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return safeServices;
    return safeServices.filter((s) => {
      const title = s?.title?.toLowerCase() || '';
      const shortDesc = s?.short_description?.toLowerCase() || '';
      const category = s?.category?.name?.toLowerCase() || '';
      return title.includes(q) || shortDesc.includes(q) || category.includes(q);
    });
  }, [safeServices, search]);

  const statusVariant = (status) => {
    if (status === 'active') return 'success';
    if (status === 'draft') return 'warning';
    if (status === 'inactive') return 'danger';
    return 'neutral';
  };

  const statusOptions = [
    { value: 'all', label: t('common.all', 'All') },
    { value: 'active', label: t('common.active', 'Active') },
    { value: 'draft', label: t('common.draft', 'Draft') },
    { value: 'inactive', label: t('common.inactive', 'Inactive') },
  ];

  const canManageServices = isSeller || isAdmin;

  if (!canManageServices) {
    return (
      <EmptyState
        title={t('pages.seller.services.noAccessTitle', 'Seller access required')}
        description={t('pages.seller.services.noAccess', 'You need a seller account to manage services.')}
        icon={FileText}
      />
    );
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('pages.seller.services.loading', 'Loading your services...')}
        </p>
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => fetchServices(pagination.page, statusFilter)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('sidebar.myServices', 'My Services')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {t('pages.seller.services.subtitle', 'Manage your service listings and track orders.')}
          </p>
        </div>
        <Link to="/seller/services/new">
          <Button icon={Plus}>{t('dashboard.seller.addService', 'Add Service')}</Button>
        </Link>
      </div>

      <Card className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <Input
              placeholder={t('pages.seller.services.searchPlaceholder', 'Search services...')}
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
                  fetchServices(1, next);
                }}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <span>
            {t('pages.seller.services.count', '{{count}} services', { count: pagination.total || filteredServices.length })}
          </span>
          <span>
            {t('pages.seller.services.pageMeta', 'Page {{page}} of {{totalPages}}', {
              page: pagination.page,
              totalPages: pagination.totalPages,
            })}
          </span>
        </div>
      </Card>

      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredServices.map((service) => (
            <Card key={service?.id} noPadding className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant={statusVariant(service?.status)}>{service?.status || 'unknown'}</Badge>
                    {service?.is_featured ? (
                      <Badge variant="primary">{t('pages.seller.services.featured', 'Featured')}</Badge>
                    ) : null}
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                    {service?.title || t('pages.seller.services.untitled', 'Untitled service')}
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                    {service?.short_description || service?.description || ''}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-indigo-400" />
                      {service?.category?.name || t('pages.seller.services.uncategorized', 'Uncategorized')}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      {t('pages.seller.services.delivery', '{{days}} days delivery', {
                        days: service?.delivery_time ?? '-',
                      })}
                    </span>
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-indigo-400" />
                      {t('pages.seller.services.ordersCount', '{{count}} orders', {
                        count: service?._count?.orders ?? 0,
                      })}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      {formatDate(service?.created_at)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(Number(service?.price) || 0)}
                  </p>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {t('pages.seller.services.serviceId', 'ID #{{id}}', { id: service?.id })}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link to={`/seller/services/${service?.id}/edit`}>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Pencil}
                        className="px-3"
                        aria-label={t('pages.seller.services.edit', 'Edit service')}
                        title={t('pages.seller.services.edit', 'Edit')}
                      >
                        <span className="hidden sm:inline">{t('common.edit', 'Edit')}</span>
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Trash2}
                      className="px-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      aria-label={t('pages.seller.services.delete', 'Delete service')}
                      title={t('pages.seller.services.delete', 'Delete')}
                      onClick={() => {
                        setDeleteTarget(service);
                        setDeleteOpen(true);
                      }}
                    >
                      <span className="hidden sm:inline">{t('common.delete', 'Delete')}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <EmptyState
            title={t('pages.seller.services.emptyTitle', 'No services yet')}
            description={t(
              'pages.seller.services.emptyDesc',
              'Create your first service and start receiving orders.'
            )}
            icon={FileText}
          />
          <div className="flex justify-center">
            <Link to="/seller/services/new">
              <Button icon={Plus}>{t('dashboard.seller.addService', 'Add Service')}</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={pagination.page <= 1}
          onClick={() => {
            const next = Math.max(1, pagination.page - 1);
            setPagination((p) => ({ ...p, page: next }));
            fetchServices(next, statusFilter);
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
            fetchServices(next, statusFilter);
          }}
        >
          {t('common.next', 'Next')}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        title={t('pages.seller.services.deleteTitle', 'Delete this service?')}
        description={t(
          'pages.seller.services.deleteDesc',
          'This will remove it from public listings. You can create a new service anytime.'
        )}
        confirmText={t('pages.seller.services.confirmDelete', 'Delete service')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={deleting}
        onCancel={() => {
          if (deleting) return;
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={async () => {
          const serviceId = deleteTarget?.id;
          if (!serviceId) {
            setDeleteOpen(false);
            setDeleteTarget(null);
            return;
          }

          setDeleting(true);
          try {
            await deleteService(serviceId);
            toast.success(t('pages.seller.services.toastDeleted', 'Service deleted successfully'));
            setServices((prev) => {
              const arr = Array.isArray(prev) ? prev : [];
              return arr.filter((s) => s?.id !== serviceId);
            });
            setPagination((p) => ({
              ...p,
              total: typeof p?.total === 'number' ? Math.max(0, p.total - 1) : p?.total,
            }));
          } catch (err) {
            toast.error(
              err?.response?.data?.message || t('pages.seller.services.toastDeleteError', 'Could not delete service.')
            );
          } finally {
            setDeleting(false);
            setDeleteOpen(false);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
};

export default SellerServices;
