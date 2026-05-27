import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  User,
  Home,
  Briefcase,
  Package,
  Gift,
  Info,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { API_URL } from '../../utils/constants';
import Button from '../common/Button';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import Logo from '../common/Logo';
import NotificationBell from '../common/NotificationBell';
import { getSidebarMenus } from './Sidebar';
import { cn } from '../../utils/cn';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logoutUser, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const { t, isRTL } = useLanguage();
  const location = useLocation();

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'seller') return '/seller';
    return '/buyer';
  };

  const navLinks = useMemo(() => ([
    { name: t('nav.services'), path: '/services', icon: Briefcase },
    { name: t('nav.products'), path: '/products', icon: Package },
    { name: t('nav.freebies'), path: '/freebies', icon: Gift },
    { name: t('nav.about'), path: '/about', icon: Info },
    { name: t('nav.contact'), path: '/contact', icon: Phone },
  ]), [t]);

  const mobilePrimaryLinks = useMemo(() => ([
    { name: t('nav.home'), path: '/', icon: Home, exact: true },
    ...navLinks,
    { name: t('nav.cart', 'Cart'), path: '/cart', icon: ShoppingCart },
  ]), [navLinks, t]);

  const dashboardLinks = useMemo(() => {
    const menus = getSidebarMenus(t);
    return isAuthenticated ? menus[user?.role] || [] : [];
  }, [isAuthenticated, t, user?.role]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previous;
    };
  }, [isMobileMenuOpen]);

  const isActivePath = (path, exact = false) => {
    if (exact || path === '/' || path.split('/').length === 2) {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className={cn(
      "sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-500",
      "bg-white/80 border-slate-100",
      "dark:bg-slate-950/80 dark:border-slate-800"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-6">
          <div className="flex items-center gap-8 xl:gap-10">
            <Link to="/">
              <Logo size="sm" />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'whitespace-nowrap rounded-full px-3 py-2 text-sm font-extrabold tracking-wide transition-colors',
                    location.pathname === link.path 
                      ? 'text-slate-950 dark:text-white bg-slate-900/10 dark:bg-white/10'
                      : 'text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-cyan-300 hover:bg-slate-900/5 dark:hover:bg-white/5'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden lg:flex items-center gap-4 xl:gap-5">
            <div className="flex items-center gap-3 xl:gap-4">
              <LanguageToggle />
              <ThemeToggle />
              {isAuthenticated && <NotificationBell />}
            </div>

            <div className="h-6 w-px bg-slate-200/70 dark:bg-slate-700/70" />

            <div className="flex items-center gap-3 xl:gap-4">
              <Link
                to="/cart"
                className="navbar-cart-button"
                aria-label={t('nav.cart', 'Cart')}
              >
                <svg
                  viewBox="0 0 16 16"
                  className="navbar-cart-button-icon"
                  height="20"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M11.354 6.354a.5.5 0 0 0-.708-.708L8 8.293 6.854 7.146a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3z" />
                  <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                </svg>

                <span className="navbar-cart-button-text">
                  {t('nav.cart', 'Cart')}
                </span>
                {cartCount > 0 && (
                  <span className="navbar-cart-count">
                    {cartCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to={getDashboardPath()}>
                    <Button variant="ghost" size="sm" icon={LayoutDashboard} className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      <span className="hidden xl:inline">{t('nav.dashboard')}</span>
                    </Button>
                  </Link>

                  <div className="flex items-center gap-3 xl:gap-4">
                    <Link to="/profile/me" className="shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 shadow-sm overflow-hidden flex items-center justify-center transition-transform hover:scale-105">
                        {user.avatar_url ? (
                          <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `${API_URL}/${user.avatar_url}`} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </Link>

                    <div className={cn("hidden xl:flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <div className={cn("text-right", isRTL && "text-left")}>
                        <Link to="/profile/me">
                          <p className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary transition-colors whitespace-nowrap">{user.name || user.username}</p>
                        </Link>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">{user.role === 'buyer' ? t('profile.buyerRole') : user.role === 'seller' ? t('profile.sellerRole') : user.role}</p>
                      </div>
                      <button onClick={logoutUser} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl text-slate-400 hover:text-rose-600 transition-colors">
                        <LogOut className={cn("w-5 h-5", isRTL && "rotate-180")} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{t('nav.login')}</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="text-sm font-extrabold px-4">{t('nav.register')}</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageToggle />
            <ThemeToggle />
            {isAuthenticated && <NotificationBell />}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? t('nav.closeMenu', 'Close menu') : t('nav.openMenu', 'Open menu')}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:hover:bg-slate-800 lg:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[9997] bg-slate-950/40 backdrop-blur-sm lg:hidden"
            aria-label={t('nav.closeMenu', 'Close menu')}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu', 'Menu')}
            className="mobile-menu-pop fixed inset-x-4 top-[5.25rem] z-[9998] rounded-[1.5rem] border border-slate-200/80 bg-white/95 p-3 shadow-2xl shadow-slate-900/20 backdrop-blur-xl transition-all duration-200 ease-out dark:border-white/10 dark:bg-slate-950/95 dark:shadow-black/40 lg:hidden"
          >
            <div className="flex items-center justify-between gap-3 px-2 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  {t('nav.menu', 'Menu')}
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {isAuthenticated ? user?.name || user?.username : 'Lernnova'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:hover:bg-slate-800"
                aria-label={t('nav.closeMenu', 'Close menu')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(100vh-7.5rem)] overflow-y-auto">
              <div className="space-y-2">
                {mobilePrimaryLinks.map((item) => {
                  const active = isActivePath(item.path, item.exact);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition',
                        active
                          ? 'bg-blue-600 text-white hover:bg-blue-600'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/10'
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.name}</span>
                        {item.path === '/cart' && cartCount > 0 ? (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-black text-current">
                            {cartCount}
                          </span>
                        ) : null}
                      </span>
                      <ChevronRight className={cn('h-4 w-4 shrink-0 opacity-70', isRTL && 'rotate-180')} />
                    </Link>
                  );
                })}
              </div>

              {isAuthenticated && dashboardLinks.length > 0 ? (
                <div className="mt-4 border-t border-slate-200/80 pt-4 dark:border-white/10">
                  <div className="mb-2 px-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      {t('nav.dashboard', 'Dashboard')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {dashboardLinks.map((item) => {
                      const active = isActivePath(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition',
                            active
                              ? 'bg-blue-600 text-white hover:bg-blue-600'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/10'
                          )}
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </span>
                          <ChevronRight className={cn('h-4 w-4 shrink-0 opacity-70', isRTL && 'rotate-180')} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 border-t border-slate-200/80 pt-4 dark:border-white/10">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        logoutUser();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/20"
                    >
                      <span className="flex items-center gap-3">
                        <LogOut className={cn('h-4 w-4 shrink-0', isRTL && 'rotate-180')} />
                        {t('nav.logout')}
                      </span>
                      <ChevronRight className={cn('h-4 w-4 shrink-0 opacity-70', isRTL && 'rotate-180')} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block">
                      <Button variant="outline" className="w-full">{t('nav.login')}</Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block">
                      <Button className="w-full text-center">{t('nav.register')}</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </nav>
  );
};

export default Navbar;
