import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, CheckCheck, X } from 'lucide-react';
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

  const dropdownRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await getUnreadNotificationCount();
      setUnreadCount(typeof data?.count === 'number' ? data.count : 0);
    } catch (err) {
      // Silent fail — notifications must never break the navbar
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await getNotifications({ page: 1, limit: 10 });
      setNotifications(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Polling
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchUnreadCount]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

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
        className={cn(
          'relative inline-flex items-center justify-center w-10 h-10 rounded-xl',
          'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
          'hover:bg-slate-100 dark:hover:bg-slate-800',
          'transition-all duration-200',
          isOpen && 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1',
              'bg-red-500 text-white text-[10px] font-bold rounded-full',
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
        <div
          className={cn(
            'absolute top-full mt-3 w-[22rem] max-h-[28rem] overflow-hidden',
            'bg-white dark:bg-slate-900',
            'border border-slate-200 dark:border-slate-700',
            'rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40',
            'z-50 flex flex-col',
            'animate-in fade-in slide-in-from-top-2 duration-200',
            isRTL ? 'left-0' : 'right-0'
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
      )}
    </div>
  );
};

export default NotificationBell;
