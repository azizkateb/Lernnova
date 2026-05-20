import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, Clock, DollarSign, FileText, Sparkles, Tags, Upload, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getServiceCategories } from '../../api/categoriesApi';
import { createService, uploadServiceThumbnail } from '../../api/servicesApi';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/formatCurrency';

const AddService = () => {
  const { t, isRTL } = useLanguage();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdServiceId, setCreatedServiceId] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [values, setValues] = useState({
    category_id: '',
    title: '',
    short_description: '',
    description: '',
    price: '',
    delivery_time: '',
    status: 'draft',
    is_featured: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      setCategoriesLoading(true);
      try {
        const items = await getServiceCategories();
        setCategories(Array.isArray(items) ? items : []);
      } catch (e) {
        setCategories([]);
        toast.error(e?.response?.data?.message || t('pages.seller.addService.toastCategoriesError', 'Could not load categories.'));
      } finally {
        setCategoriesLoading(false);
      }
    };
    load();
  }, [t]);

  const categoryOptions = useMemo(() => {
    return categories
      .filter((c) => c && typeof c === 'object')
      .map((c) => ({ id: c.id, name: c.name }))
      .filter((c) => Number.isFinite(Number(c.id)) && typeof c.name === 'string');
  }, [categories]);

  const statusVariant = values.status === 'active' ? 'success' : 'warning';

  const preview = {
    title: values.title?.trim() || t('pages.seller.addService.previewUntitled', 'Untitled service'),
    desc:
      values.short_description?.trim() ||
      t('pages.seller.addService.previewDesc', 'Add a short, focused summary to help buyers scan your offer.'),
    price: values.price === '' ? null : Number(values.price),
    delivery: values.delivery_time === '' ? null : Number(values.delivery_time),
  };

  const validate = () => {
    const next = {};
    if (!values.category_id) next.category_id = t('pages.seller.addService.errors.category', 'Please choose a category.');
    if (!values.title?.trim() || values.title.trim().length < 3) {
      next.title = t('pages.seller.addService.errors.title', 'Title must be at least 3 characters.');
    }
    if (values.price === '' || Number.isNaN(Number(values.price)) || Number(values.price) < 0) {
      next.price = t('pages.seller.addService.errors.price', 'Price must be a number greater than or equal to 0.');
    }
    if (values.delivery_time !== '') {
      const n = Number(values.delivery_time);
      if (Number.isNaN(n) || n < 1) {
        next.delivery_time = t('pages.seller.addService.errors.delivery', 'Delivery time must be at least 1 day.');
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedThumbnail(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setThumbnailPreview(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const clearThumbnail = () => {
    setSelectedThumbnail(null);
    setThumbnailPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!categoryOptions.length) {
      toast.error(t('pages.seller.addService.toastNoCategories', 'No categories available yet.'));
      return;
    }

    const payload = {
      category_id: Number(values.category_id),
      title: values.title.trim(),
      short_description: values.short_description.trim() || undefined,
      description: values.description.trim() || undefined,
      price: Number(values.price),
      delivery_time: values.delivery_time === '' ? undefined : Number(values.delivery_time),
      status: values.status,
      is_featured: isAdmin ? Boolean(values.is_featured) : false,
    };

    setSubmitting(true);
    try {
      const response = await createService(payload);
      const serviceId = response.service?.id;

      // If a thumbnail is selected, upload it
      if (selectedThumbnail && serviceId) {
        setUploadingThumbnail(true);
        try {
          await uploadServiceThumbnail(serviceId, selectedThumbnail);
          toast.success(t('pages.seller.addService.thumbnailSuccess', 'Service and thumbnail created successfully'));
        } catch (thumbnailErr) {
          console.error('Thumbnail upload error:', thumbnailErr);
          toast.error(thumbnailErr?.response?.data?.message || t('pages.seller.addService.thumbnailError', 'Service created but thumbnail upload failed'));
        } finally {
          setUploadingThumbnail(false);
        }
      } else {
        toast.success(t('pages.seller.addService.toastSuccess', 'Service created successfully'));
      }

      navigate('/seller/services');
    } catch (err) {
      toast.error(err?.response?.data?.message || t('pages.seller.addService.toastError', 'Could not create service.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link to="/seller">
            <Button variant="ghost" size="sm" className="px-3">
              <span className="inline-flex items-center gap-2">
                <ArrowLeft className={cn('w-4 h-4', isRTL && 'rotate-180')} />
                {t('pages.seller.addService.back', 'Back')}
              </span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('pages.seller.addService.title', 'Create a new service')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-2xl">
              {t(
                'pages.seller.addService.subtitle',
                'Add a focused digital service that buyers can order from your marketplace profile.'
              )}
            </p>
          </div>
        </div>
        <Badge variant="primary" className="w-fit">
          {t('pages.seller.addService.badge', 'Seller Tools')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="xl:col-span-2 space-y-8">
          <Card>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t('pages.seller.addService.sectionBasicsBadge', 'Basics')}
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {t('pages.seller.addService.sectionBasics', 'Service information')}
                </h2>
              </div>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-0.5">
                  {t('pages.seller.fields.category', 'Category')}
                </label>
                <div className="relative">
                  <Tags className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <select
                    name="category_id"
                    value={values.category_id}
                    onChange={handleChange}
                    disabled={categoriesLoading}
                    className={cn(
                      'w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium pl-10',
                      errors.category_id && 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500'
                    )}
                  >
                    <option value="">
                      {categoriesLoading
                        ? t('pages.seller.addService.loadingCategories', 'Loading categories...')
                        : t('pages.seller.addService.selectCategory', 'Select a category')}
                    </option>
                    {categoryOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category_id && <p className="text-xs text-rose-500 mt-1 ml-0.5">{errors.category_id}</p>}
                {!categoriesLoading && categoryOptions.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-0.5">
                    {t('pages.seller.addService.noCategories', 'No categories available yet')}
                  </p>
                )}
              </div>

              <Input
                label={t('pages.seller.fields.title', 'Title')}
                name="title"
                value={values.title}
                onChange={handleChange}
                placeholder={t('pages.seller.addService.titlePlaceholder', 'e.g. Professional Website Development')}
                icon={FileText}
                error={errors.title}
              />
            </div>

            <div className="mt-6">
              <Input
                label={t('pages.seller.fields.shortDescription', 'Short description')}
                name="short_description"
                value={values.short_description}
                onChange={handleChange}
                placeholder={t('pages.seller.addService.shortPlaceholder', 'A crisp one-liner that explains the outcome')}
              />
            </div>

            <div className="mt-6 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-0.5">
                {t('pages.seller.fields.description', 'Description')}
              </label>
              <textarea
                name="description"
                value={values.description}
                onChange={handleChange}
                rows={7}
                placeholder={t(
                  'pages.seller.addService.descPlaceholder',
                  'Describe what you will deliver, what you need from the buyer, and what makes your approach premium.'
                )}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium resize-y"
              />
            </div>

            <div className="mt-6 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-0.5">
                {t('pages.seller.fields.thumbnail', 'Service thumbnail')}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleThumbnailSelect}
                  disabled={submitting || uploadingThumbnail}
                  className="sr-only"
                  id="thumbnail-input"
                />
                {!thumbnailPreview ? (
                  <label
                    htmlFor="thumbnail-input"
                    className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all"
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t('pages.seller.addService.dragThumbnail', 'Drag image or click to upload')}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t('pages.seller.addService.thumbnailFormats', 'JPG, PNG, WebP (max 5MB)')}
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-48 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={clearThumbnail}
                      disabled={submitting || uploadingThumbnail}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-0.5">
                {t('pages.seller.addService.thumbnailHint', 'Optional. You can add a thumbnail after creating the service.')}
              </p>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t('pages.seller.addService.sectionPricingBadge', 'Pricing')}
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {t('pages.seller.addService.sectionPricing', 'Pricing & delivery')}
                </h2>
              </div>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t('pages.seller.fields.price', 'Price')}
                name="price"
                value={values.price}
                onChange={handleChange}
                placeholder="0"
                inputMode="decimal"
                icon={DollarSign}
                error={errors.price}
              />
              <Input
                label={t('pages.seller.fields.deliveryTime', 'Delivery time (days)')}
                name="delivery_time"
                value={values.delivery_time}
                onChange={handleChange}
                placeholder="7"
                inputMode="numeric"
                icon={Clock}
                error={errors.delivery_time}
              />
            </div>
          </Card>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/seller/services')}
              disabled={submitting || uploadingThumbnail}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={submitting || uploadingThumbnail}
              disabled={submitting || uploadingThumbnail || (!categoriesLoading && categoryOptions.length === 0)}
              icon={BadgeCheck}
            >
              {submitting || uploadingThumbnail
                ? t('pages.seller.addService.creating', 'Creating service...')
                : t('pages.seller.addService.create', 'Create service')}
            </Button>
          </div>
        </form>

        <div className="space-y-8">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('pages.seller.addService.publishSettings', 'Publish settings')}
              </h3>
              <Badge variant={statusVariant}>
                {values.status === 'active'
                  ? t('pages.seller.status.active', 'Active')
                  : t('pages.seller.status.draft', 'Draft')}
              </Badge>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-0.5">
                  {t('pages.seller.fields.status', 'Status')}
                </label>
                <select
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
                >
                  <option value="draft">{t('pages.seller.status.draft', 'Draft')}</option>
                  <option value="active">{t('pages.seller.status.active', 'Active')}</option>
                </select>
              </div>

              {isAdmin && (
                <label className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('pages.seller.fields.featured', 'Featured')}
                    </p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {t('pages.seller.addService.featuredHint', 'Pin this service to featured discovery areas.')}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={values.is_featured}
                    onChange={handleChange}
                    className="w-5 h-5 accent-emerald-600"
                  />
                </label>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              {t('pages.seller.addService.preview', 'Live preview')}
            </h3>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">{preview.title}</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {preview.desc}
                  </p>
                </div>
                <Badge variant={statusVariant}>
                  {values.status === 'active'
                    ? t('pages.seller.status.active', 'Active')
                    : t('pages.seller.status.draft', 'Draft')}
                </Badge>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t('pages.seller.fields.price', 'Price')}
                  </p>
                  <p className="text-sm font-black text-emerald-600 mt-1">
                    {preview.price === null ? '—' : formatCurrency(preview.price)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t('pages.seller.fields.deliveryTime', 'Delivery time (days)')}
                  </p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                    {preview.delivery === null ? '—' : `${preview.delivery}`}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {t('pages.seller.addService.tipsTitle', 'Fast checklist')}
            </h3>
            <ul className="space-y-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-black">
                  1
                </span>
                {t('pages.seller.addService.tip1', 'Focus on one clear outcome and who it is for.')}
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-black">
                  2
                </span>
                {t('pages.seller.addService.tip2', 'Set pricing that matches your delivery scope and timeline.')}
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-black">
                  3
                </span>
                {t('pages.seller.addService.tip3', 'Use Draft while refining, then publish when ready.')}
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddService;

