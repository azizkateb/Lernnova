import React, { useMemo, useState } from 'react';
import { Briefcase, Package, Image as ImageIcon } from 'lucide-react';
import { API_URL } from '../../utils/constants';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../context/LanguageContext';
import Badge from './Badge';

const resolveUrl = (value) => {
  if (!value || typeof value !== 'string') return null;
  if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('blob:')) return value;
  const base = String(API_URL || '').replace(/\/+$/, '');
  const path = value.startsWith('/') ? value : `/${value}`;
  return `${base}${path}`;
};

const MediaThumbnail = ({ src, alt, type = 'product', category, fit, className }) => {
  const { t } = useLanguage();
  const [errored, setErrored] = useState(false);

  const resolvedSrc = useMemo(() => resolveUrl(src), [src]);
  const showImage = Boolean(resolvedSrc && !errored);

  const Icon = type === 'service' ? Briefcase : Package;
  const label =
    type === 'service'
      ? t('common.digitalService', 'Digital Service')
      : t('common.digitalProduct', 'Digital Product');

  const safeCategory = typeof category === 'string' ? category : '';

  const gradient =
    type === 'service'
      ? 'bg-linear-to-br from-emerald-500/90 to-indigo-600/90 dark:from-emerald-500/40 dark:to-indigo-600/40'
      : 'bg-linear-to-br from-indigo-600/90 to-cyan-400/90 dark:from-indigo-600/40 dark:to-cyan-400/40';

  const resolvedFit = fit || (type === 'product' ? 'contain' : 'cover');
  const imageClassName =
    resolvedFit === 'cover'
      ? 'w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
      : 'w-full h-full object-contain p-10 md:p-12 transition-transform duration-700 group-hover:scale-105';

  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      {showImage ? (
        <img
          src={resolvedSrc}
          alt={alt || ''}
          className={cn(imageClassName, 'select-none')}
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className={cn('w-full h-full flex items-center justify-center', gradient)}>
          <div className="absolute inset-0 bg-linear-to-br from-white/15 to-transparent dark:from-white/10 pointer-events-none" />
          <div className="absolute inset-0 opacity-30 bg-pattern pointer-events-none" />
          <div className="relative flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 dark:bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-xs">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </div>
          </div>
        </div>
      )}

      {safeCategory ? (
        <div className="absolute top-3 right-3">
          <Badge variant="primary">{safeCategory}</Badge>
        </div>
      ) : null}
    </div>
  );
};

export default MediaThumbnail;
