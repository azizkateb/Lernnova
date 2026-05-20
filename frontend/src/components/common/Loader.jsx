import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Loader = ({ fullPage }) => {
  const { t } = useLanguage();

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-sm font-medium text-slate-500 animate-pulse">
        {t('common.loadingBrand')}
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return <div className="py-20">{content}</div>;
};

export default Loader;
