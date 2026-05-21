import React, { useEffect, useMemo, useState, useRef } from 'react';
import { ArrowLeft, BadgeCheck, DollarSign, Image as ImageIcon, Link as LinkIcon, Package, Sparkles, Tags, UploadCloud, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getProductCategories } from '../../api/categoriesApi';
import { createProduct, uploadProductFile } from '../../api/productsApi';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/formatCurrency';

const AddProduct = () => {
  const { t, isRTL } = useLanguage();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [values, setValues] = useState({
    category_id: '',
    title: '',
    short_description: '',
    description: '',
    price: '',
    thumbnail_url: '',
    status: 'draft',
    is_featured: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      setCategoriesLoading(true);
      try {
        const items = await getProductCategories();
        setCategories(Array.isArray(items) ? items : []);
      } catch (e) {
        setCategories([]);
        toast.error(e?.response?.data?.message || t('pages.seller.addProduct.toastCategoriesError', 'Could not load categories.'));
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
    title: values.title?.trim() || t('pages.seller.addProduct.previewUntitled', 'Untitled product'),
    desc:
      values.short_description?.trim() ||
      t('pages.seller.addProduct.previewDesc', 'Add a short summary to make your digital asset instantly clear.'),
    price: values.price === '' ? null : Number(values.price),
    thumbnail: values.thumbnail_url?.trim() || null,
  };

  const isValidUrl = (value) => {
    try {
      const u = new URL(value);
      return Boolean(u.protocol === 'http:' || u.protocol === 'https:');
    } catch {
      return false;
    }
  };

  const validate = () => {
    const next = {};
    if (!values.category_id) next.category_id = t('pages.seller.addProduct.errors.category', 'Please choose a category.');
    if (!values.title?.trim() || values.title.trim().length < 3) {
      next.title = t('pages.seller.addProduct.errors.title', 'Title must be at least 3 characters.');
    }
    if (values.price === '' || Number.isNaN(Number(values.price)) || Number(values.price) < 0) {
      next.price = t('pages.seller.addProduct.errors.price', 'Price must be a number greater than or equal to 0.');
    }
    if (values.thumbnail_url.trim() && !isValidUrl(values.thumbnail_url.trim())) {
      next.thumbnail_url = t('pages.seller.addProduct.errors.thumbnail', 'Thumbnail URL must be a valid URL.');
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

  const handleSelectFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!categoryOptions.length) {
      toast.error(t('pages.seller.addProduct.toastNoCategories', 'No categories available yet.'));
      return;
    }

    const payload = {
      category_id: Number(values.category_id),
      title: values.title.trim(),
      short_description: values.short_description.trim() || undefined,
      description: values.description.trim() || undefined,
      price: Number(values.price),
      thumbnail_url: values.thumbnail_url.trim() || undefined,
      status: values.status,
      is_featured: isAdmin ? Boolean(values.is_featured) : false,
    };

    setSubmitting(true);
    try {
      const result = await createProduct(payload);

      const createdProduct = result?.product || result?.data?.product || result?.data || result;
      const productId = createdProduct?.id;

      if (!productId) {
        throw new Error('Product created but no ID returned');
      }

      toast.success(t('pages.seller.addProduct.toastSuccess', 'Product created successfully'));

      if (file && productId) {
        setUploadingFile(true);
        try {
          await uploadProductFile(productId, file);
          toast.success(t('pages.seller.addProduct.toastFileSuccess', 'Product file uploaded successfully'));
        } catch (err) {
          toast.warning(
            err?.response?.data?.message ||
            t('pages.seller.addProduct.toastFilePartialWarning', 'Product was created, but file upload failed. You can upload it later.')
          );
        } finally {
          setUploadingFile(false);
        }
      }

      navigate('/seller/products');
    } catch (err) {
      toast.error(err?.response?.data?.message || t('pages.seller.addProduct.toastError', 'Could not create product.'));
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
                {t('pages.seller.addProduct.back', 'Back')}
              </span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('pages.seller.addProduct.title', 'Create a new product')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-2xl">
              {t(
                'pages.seller.addProduct.subtitle',
                'Upload a digital product, template, course file, or downloadable asset for buyers.'
              )}
            </p>
          </div>
        </div>
        <Badge variant="accent" className="w-fit">
          {t('pages.seller.addProduct.badge', 'Digital Goods')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="xl:col-span-2 space-y-8">
          <Card>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t('pages.seller.addProduct.sectionBasicsBadge', 'Basics')}
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {t('pages.seller.addProduct.sectionBasics', 'Product information')}
                </h2>
              </div>
              <Sparkles className="w-5 h-5 text-accent" />
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
                      'w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium pl-10',
                      errors.category_id && 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500'
                    )}
                  >
                    <option value="">
                      {categoriesLoading
                        ? t('pages.seller.addProduct.loadingCategories', 'Loading categories...')
                        : t('pages.seller.addProduct.selectCategory', 'Select a category')}
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
                    {t('pages.seller.addProduct.noCategories', 'No categories available yet')}
                  </p>
                )}
              </div>

              <Input
                label={t('pages.seller.fields.title', 'Title')}
                name="title"
                value={values.title}
                onChange={handleChange}
                placeholder={t('pages.seller.addProduct.titlePlaceholder', 'e.g. Complete React Starter Template')}
                icon={Package}
                error={errors.title}
              />
            </div>

            <div className="mt-6">
              <Input
                label={t('pages.seller.fields.shortDescription', 'Short description')}
                name="short_description"
                value={values.short_description}
                onChange={handleChange}
                placeholder={t('pages.seller.addProduct.shortPlaceholder', 'A quick line explaining what buyers receive')}
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
                  'pages.seller.addProduct.descPlaceholder',
                  'Describe what is included, how to use it, and what makes it premium.'
                )}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium resize-y"
              />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t('pages.seller.addProduct.sectionDetailsBadge', 'Details')}
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {t('pages.seller.addProduct.sectionDetails', 'Pricing & media')}
                </h2>
              </div>
              <ImageIcon className="w-5 h-5 text-amber-600" />
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
              <div className="flex flex-col">
                <Input
                  label={t('pages.seller.fields.thumbnailUrl', 'Thumbnail URL')}
                  name="thumbnail_url"
                  value={values.thumbnail_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  icon={LinkIcon}
                  error={errors.thumbnail_url}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 ml-0.5">
                  {t(
                    'pages.seller.addProduct.thumbnailHelp',
                    'Optional image URL used as the product cover.'
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-0.5">
                {t('pages.seller.addProduct.fileLabel', 'Upload product file')}
              </label>
              <div className="mt-2 p-5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
                      <UploadCloud className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {file ? file.name : t('pages.seller.addProduct.fileHintTitle', 'Optional')}
                      </p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {file
                          ? t('pages.seller.addProduct.fileHintSelected', 'File will be uploaded after product creation.')
                          : t(
                              'pages.seller.addProduct.fileHint',
                              'Select a ZIP, PDF, DOCX, images, or text file.'
                            )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {file && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="px-3"
                        onClick={() => setFile(null)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <X className="w-4 h-4" />
                          {t('pages.seller.addProduct.removeFile', 'Remove')}
                        </span>
                      </Button>
                    )}
                    <span className="inline-flex">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleSelectFile}
                        accept=".zip,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt"
                        className="sr-only"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="px-4"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {t('pages.seller.addProduct.chooseFile', 'Choose file')}
                      </Button>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/seller/products')}
              disabled={submitting || uploadingFile}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={submitting || uploadingFile}
              disabled={(submitting || uploadingFile) || (!categoriesLoading && categoryOptions.length === 0)}
              icon={BadgeCheck}
            >
              {uploadingFile
                ? t('pages.seller.addProduct.uploading', 'Uploading file...')
                : submitting
                  ? t('pages.seller.addProduct.creating', 'Creating product...')
                  : t('pages.seller.addProduct.create', 'Create product')}
            </Button>
          </div>
        </form>

        <div className="space-y-8">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('pages.seller.addProduct.publishSettings', 'Publish settings')}
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
                      {t('pages.seller.addProduct.featuredHint', 'Mark this product as featured across the marketplace.')}
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
              {t('pages.seller.addProduct.preview', 'Live preview')}
            </h3>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                  {preview.thumbnail ? (
                    <img
                      src={preview.thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">{preview.title}</p>
                    <Badge variant={statusVariant}>
                      {values.status === 'active'
                        ? t('pages.seller.status.active', 'Active')
                        : t('pages.seller.status.draft', 'Draft')}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {preview.desc}
                  </p>
                  <p className="text-sm font-black text-emerald-600 mt-4">
                    {preview.price === null
                      ? '—'
                      : preview.price === 0
                        ? t('common.free', 'Free')
                        : formatCurrency(preview.price)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {t('pages.seller.addProduct.tipsTitle', 'Fast checklist')}
            </h3>
            <ul className="space-y-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-black">
                  1
                </span>
                {t('pages.seller.addProduct.tip1', 'Title the product by outcome, not by file type.')}
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-black">
                  2
                </span>
                {t('pages.seller.addProduct.tip2', 'Use a clean thumbnail link for better listing performance.')}
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-black">
                  3
                </span>
                {t('pages.seller.addProduct.tip3', 'Keep it Draft while you upload the final deliverables.')}
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
