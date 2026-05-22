import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { cn } from '../../utils/cn';

const LanguageToggle = () => {
  const { language, setLanguage, t, isRTL } = useLanguage();

  return (
    <div className="relative">
      <Globe
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600 dark:text-indigo-300',
          isRTL ? 'right-3' : 'left-3'
        )}
      />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label={t('settings.language.title', t('language.toggle', 'Language'))}
        className={cn(
          'appearance-none h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 backdrop-blur-md text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/25',
          isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'
        )}
      >
        <option value="en">English</option>
        <option value="ar">العربية</option>
        <option value="de">Deutsch</option>
      </select>
      <ChevronDown
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500',
          isRTL ? 'left-3' : 'right-3'
        )}
      />
    </div>
  );
};

export default LanguageToggle;
