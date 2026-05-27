import { API_URL } from './constants';

export const getFileUrl = (path) => {
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith('blob:')) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const base = String(API_URL || '').replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
};
