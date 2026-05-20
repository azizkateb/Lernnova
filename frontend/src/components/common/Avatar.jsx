import React, { useMemo, useState } from 'react';
import { API_URL } from '../../utils/constants';
import { cn } from '../../utils/cn';

const getFileUrl = (path) => {
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
  const base = String(API_URL || '').replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
};

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part?.[0])
    .join('')
    .toUpperCase();
};

const Avatar = ({ src, name, size = 32, className, imgClassName }) => {
  const [errored, setErrored] = useState(false);

  const resolved = useMemo(() => getFileUrl(src), [src]);
  const showImage = Boolean(resolved && !errored);
  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden border border-white/20 dark:border-slate-700 shrink-0',
        className
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={resolved}
          alt={name || ''}
          className={cn('w-full h-full object-cover', imgClassName)}
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-600/70 to-emerald-500/70 dark:from-indigo-600/40 dark:to-emerald-500/40 text-white font-black text-xs">
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar;

