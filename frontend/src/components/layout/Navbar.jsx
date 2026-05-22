import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, LayoutDashboard, LogOut, User, Globe as GlobeIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { API_URL } from '../../utils/constants';
import Button from '../common/Button';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import Logo from '../common/Logo';
import NotificationBell from '../common/NotificationBell';
import { cn } from '../../utils/cn';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutUser, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const { t, isRTL } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.products'), path: '/products' },
    { name: t('nav.freebies'), path: '/freebies' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'seller') return '/seller';
    return '/buyer';
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
                    'whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium tracking-normal transition-colors',
                    location.pathname === link.path 
                      ? 'text-slate-950 dark:text-white bg-slate-900/5 dark:bg-white/5'
                      : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5'
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
                    <Button variant="ghost" size="sm" icon={LayoutDashboard}>
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
                    <Button variant="ghost" size="sm">{t('nav.login')}</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">{t('nav.register')}</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            {isAuthenticated && <NotificationBell />}
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-base font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <Link
                to="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {t('nav.cart', 'Cart')}
                {cartCount > 0 && (
                  <span className="ml-auto px-2.5 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile/me"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-slate-600 hover:bg-slate-50 rounded-xl"
                  >
                    <User className="w-5 h-5" />
                    {t('profile.myProfile')}
                  </Link>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-slate-600 hover:bg-slate-50 rounded-xl"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    {t('nav.dashboard')}
                  </Link>
                  <button
                    onClick={() => {
                      logoutUser();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-base font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl"
                  >
                    <LogOut className={cn("w-5 h-5", isRTL && "rotate-180")} />
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block">
                    <Button variant="outline" className="w-full">{t('nav.login')}</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block">
                    <Button className="w-full text-center">{t('nav.register')}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
