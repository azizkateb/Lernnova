import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  FileText, 
  Briefcase,
  Users, 
  Settings, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  User,
  MessageSquare
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../context/LanguageContext';

export const getSidebarMenus = (t) => ({
  buyer: [
    { name: t('sidebar.dashboard'), path: '/buyer', icon: LayoutDashboard },
    { name: t('profile.myProfile'), path: '/profile/me', icon: User },
    { name: t('sidebar.buyerServiceOrders'), path: '/buyer/service-orders', icon: Briefcase },
    { name: t('sidebar.buyerProductOrders'), path: '/buyer/product-orders', icon: ShoppingBag },
    { name: t('sidebar.serviceInquiries', 'Service Inquiries'), path: '/service-inquiries', icon: MessageSquare },
    { name: t('sidebar.settings'), path: '/settings', icon: Settings },
  ],
  seller: [
    { name: t('sidebar.dashboard'), path: '/seller', icon: LayoutDashboard },
    { name: t('profile.myProfile'), path: '/profile/me', icon: User },
    { name: t('sidebar.myServices'), path: '/seller/services', icon: FileText },
    { name: t('sidebar.myProducts'), path: '/seller/products', icon: Package },
    { name: t('sidebar.orders'), path: '/seller/service-orders', icon: TrendingUp },
    { name: t('sidebar.orders'), path: '/seller/product-orders', icon: ShoppingBag },
    { name: t('sidebar.serviceInquiries', 'Service Inquiries'), path: '/service-inquiries', icon: MessageSquare },
    { name: t('sidebar.wallet'), path: '/seller/earnings', icon: CreditCard },
  ],
  admin: [
    { name: t('sidebar.dashboard'), path: '/admin', icon: LayoutDashboard },
    { name: t('profile.myProfile'), path: '/profile/me', icon: User },
    { name: t('sidebar.userManagement'), path: '/admin/users', icon: Users },
    { name: t('sidebar.serviceReview'), path: '/admin/services', icon: FileText },
    { name: t('sidebar.productReview'), path: '/admin/products', icon: Package },
    { name: t('sidebar.allServiceOrders'), path: '/admin/service-orders', icon: TrendingUp },
    { name: t('sidebar.allProductOrders'), path: '/admin/product-orders', icon: ShoppingBag },
    { name: t('sidebar.serviceInquiries', 'Service Inquiries'), path: '/service-inquiries', icon: MessageSquare },
  ],
});

const Sidebar = ({ role }) => {
  const { isRTL, t } = useLanguage();
  const menus = getSidebarMenus(t);

  const activeMenu = menus[role] || [];

  return (
    <aside className={cn(
      'hidden h-[calc(100vh-80px)] w-72 shrink-0 flex-col overflow-hidden border-slate-100 bg-white transition-colors duration-500 dark:border-slate-800 dark:bg-slate-950 lg:sticky lg:top-20 lg:flex',
      isRTL ? 'border-l border-r-0' : 'border-r border-l-0'
    )}>
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mb-8 px-4">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('sidebar.mainMenu')}</p>
          <div className="h-px w-8 bg-primary" />
        </div>
        
        <nav className="space-y-1">
          {activeMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.split('/').length === 2}
              className={({ isActive }) => cn(
                'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group',
                isActive 
                  ? 'bg-primary/10 dark:bg-primary/5 text-primary' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon className={cn('w-5 h-5', isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400')} />
                    {item.name}
                  </div>
                  {isActive && <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-50 dark:border-slate-800">
        <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-4 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-white font-bold text-xs mb-1">{t('sidebar.proSupport')}</p>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] mb-3">{t('sidebar.needHelp')}</p>
            <button className="text-[10px] bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary transition-colors hover:text-white">
              {t('sidebar.contactUs')}
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary/20 rounded-full blur-2xl" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
