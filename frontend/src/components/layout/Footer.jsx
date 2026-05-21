import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Github, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Logo from '../common/Logo';

const Footer = () => {
  const { t, isRTL } = useLanguage();
  
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          <div className="md:col-span-1">
            <Link to="/" className="mb-6 block">
              <Logo size="md" showText={true} showSlogan={true} />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              {t('footer.desc')}
            </p>
            <div className="flex gap-4">
              {[Twitter, Github, Linkedin, Instagram].map((Icon, idx) => (
                <button key={idx} className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all">
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-6">{t('footer.marketplace')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-4">
                <li><Link to="/services" className="hover:text-white hover:underline underline-offset-4 transition-colors">{t('footer.services')}</Link></li>
                <li><Link to="/products?category=pdf-books" className="hover:text-white hover:underline underline-offset-4 transition-colors">{t('categories.pdf-books')}</Link></li>
                <li><Link to="/products?category=ebooks-plr" className="hover:text-white hover:underline underline-offset-4 transition-colors">{t('categories.ebooks-plr')}</Link></li>
                <li><Link to="/products?category=workbooks-planners" className="hover:text-white hover:underline underline-offset-4 transition-colors">{t('categories.workbooks-planners')}</Link></li>
              </ul>
              <ul className="space-y-4">
                <li><Link to="/products?category=templates" className="hover:text-white hover:underline underline-offset-4 transition-colors">{t('categories.templates')}</Link></li>
                <li><Link to="/products?category=digital-courses" className="hover:text-white hover:underline underline-offset-4 transition-colors">{t('categories.digital-courses')}</Link></li>
                <li><Link to="/products?category=digital-tools-software" className="hover:text-white hover:underline underline-offset-4 transition-colors">{t('categories.digital-tools-software')}</Link></li>
                <li><Link to="/products?category=freebies" className="hover:text-white hover:underline underline-offset-4 transition-colors">{t('categories.freebies')}</Link></li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-6">{t('footer.company')}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/about" className="hover:text-white hover:underline underline-offset-4 transition-colors">{t('footer.about')}</Link></li>
              <li><Link to="/contact" className="hover:text-white hover:underline underline-offset-4 transition-colors">{t('footer.contact')}</Link></li>
              <li><Link to="/privacy" className="hover:text-white hover:underline underline-offset-4 transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/terms" className="hover:text-white hover:underline underline-offset-4 transition-colors">{t('footer.terms')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-500 font-medium">
            © {new Date().getFullYear()} Lernnova Digital Solutions. {t('footer.rights')}
          </p>
          <div className="flex gap-8">
            <span className="text-xs text-slate-500 flex items-center gap-1.5"><Globe className="w-3 h-3" /> {isRTL ? 'العربية / الإنجليزية' : 'English / Arabic'}</span>
            <span className="text-xs text-slate-500">{t('footer.secure')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
