import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellOff, CheckCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../api/notificationsApi';
import { cn } from '../../utils/cn';

const POLL_INTERVAL_MS = 30000;
const MAX_BACKOFF_MS = 5 * 60 * 1000;

const timeAgo = (date, t) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return t('notifications.justNow', 'Just now');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const dropdownRef = useRef(null);
  const pollTimerRef = useRef(null);
  const pollFailCountRef = useRef(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await getUnreadNotificationCount();
      setUnreadCount(typeof data?.count === 'number' ? data.count : 0);
      pollFailCountRef.current = 0;
    } catch (err) {
      setUnreadCount(0);
      pollFailCountRef.current += 1;
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setListError(null);
    try {
      const data = await getNotifications({ page: 1, limit: 10 });
      setNotifications(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setNotifications([]);
      setListError(t('notifications.loadError', 'Could not load notifications'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, t]);

  // Polling
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;

    const scheduleNext = (delayMs) => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      pollTimerRef.current = setTimeout(async () => {
        if (cancelled) return;
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          scheduleNext(60_000);
          return;
        }
        await fetchUnreadCount();
        const fails = pollFailCountRef.current;
        const backoff = Math.min(
          POLL_INTERVAL_MS * Math.pow(2, Math.min(fails, 5)),
          MAX_BACKOFF_MS
        );
        scheduleNext(backoff);
      }, delayMs);
    };

    scheduleNext(0);
    return () => {
      cancelled = true;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [isAuthenticated, fetchUnreadCount]);

  // Click outside
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (!isOpen || !isMobile) return undefined;
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previous;
    };
  }, [isOpen, isMobile]);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) fetchNotifications();
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      // Silent — still navigate
    }
    setIsOpen(false);
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      // Silent
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={t('notifications.title', 'Notifications')}
        className="notification-bell-button relative"
      >
        <svg
          viewBox="0 0 448 512"
          className="notification-bell-icon"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"
            fill="currentColor"
          />
        </svg>
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-1 -right-1 min-w-5 h-5 px-1',
              'bg-rose-500 text-white text-[10px] font-bold rounded-full',
              'flex items-center justify-center',
              'ring-2 ring-white dark:ring-slate-950',
              'animate-in zoom-in duration-200'
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
        {isMobile ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
            aria-label={t('common.close', 'Close')}
          />
        ) : null}
        <div
          className={cn(
            isMobile
              ? 'fixed inset-x-3 top-1/2 z-50 max-h-[min(80vh,38rem)] w-auto -translate-y-1/2 overflow-hidden'
              : 'absolute top-full mt-3 w-[22rem] max-h-[28rem] overflow-hidden',
            'bg-white dark:bg-slate-900',
            'border border-slate-200 dark:border-slate-700',
            'rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40',
            'z-50 flex flex-col',
            'animate-in fade-in slide-in-from-top-2 duration-200',
            !isMobile && (isRTL ? 'left-0' : 'right-0')
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                {t('notifications.title', 'Notifications')}
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {unreadCount} {t('notifications.unread', 'Unread')}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-semibold',
                  'text-primary hover:text-primary/80',
                  'transition-colors'
                )}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t('notifications.markAllRead', 'Mark all as read')}
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-slate-200 dark:border-slate-700 border-t-primary rounded-full animate-spin" />
              </div>
            ) : listError ? (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <X className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {listError}
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <BellOff className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('notifications.empty', 'No notifications yet')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[14rem]">
                  {t(
                    'notifications.emptyDesc',
                    'You will see updates about your orders and messages here.'
                  )}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        'w-full text-left px-5 py-3.5 transition-colors',
                        'hover:bg-slate-50 dark:hover:bg-slate-800/60',
                        'flex items-start gap-3',
                        !n.is_read
                          ? 'bg-indigo-50/60 dark:bg-indigo-900/20'
                          : 'bg-transparent',
                        isRTL && 'text-right'
                      )}
                    >
                      <div className="flex-shrink-0 pt-1.5">
                        <span
                          className={cn(
                            'block w-2 h-2 rounded-full transition-colors',
                            !n.is_read ? 'bg-primary' : 'bg-transparent'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p
                            className={cn(
                              'text-sm truncate',
                              !n.is_read
                                ? 'font-bold text-slate-900 dark:text-white'
                                : 'font-semibold text-slate-700 dark:text-slate-200'
                            )}
                          >
                            {n.title}
                          </p>
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex-shrink-0">
                            {timeAgo(n.created_at, t)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
