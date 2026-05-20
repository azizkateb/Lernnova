import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, LayoutDashboard, LogOut, User, Globe as GlobeIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { API_URL } from '../../utils/constants';
import Button from '../common/Button';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import Logo from '../common/Logo';
import { cn } from '../../utils/cn';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutUser, isAuthenticated } = useAuth();
  const { t, isRTL } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.products'), path: '/products' },
    { name: t('footer.about'), path: '/about' },
    { name: t('sidebar.contactUs'), path: '/contact' },
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
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-10">
            <Link to="/">
              <Logo size="sm" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'text-sm font-medium transition-colors border-b-2 pb-0.5',
                    location.pathname === link.path 
                      ? 'text-primary border-primary' 
                      : 'text-slate-500 border-transparent hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-200" />
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to={getDashboardPath()}>
                  <Button variant="ghost" size="sm" icon={LayoutDashboard}>
                    {t('nav.dashboard')}
                  </Button>
                </Link>
                <div className="h-6 w-px bg-slate-200" />
                <Link to="/profile/me">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-sm overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                    {user.avatar_url ? (
                      <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `${API_URL}/${user.avatar_url}`} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <div className={cn("text-right", isRTL && "text-left")}>
                    <Link to="/profile/me">
                      <p className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">{user.name || user.username}</p>
                    </Link>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{user.role === 'buyer' ? t('profile.buyerRole') : user.role === 'seller' ? t('profile.sellerRole') : user.role}</p>
                  </div>
                  <button onClick={logoutUser} className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-colors">
                    <LogOut className={cn("w-5 h-5", isRTL && "rotate-180")} />
                  </button>
                </div>
              </div>
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

          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
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
