import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import SpeederLoader from './SpeederLoader';

const Loader = ({ fullPage }) => {
  const { t } = useLanguage();

  return (
    <SpeederLoader
      fullScreen={Boolean(fullPage)}
      className={fullPage ? 'fixed inset-0 z-50' : 'py-20'}
      label={t('common.loadingBrand', t('common.loading', 'Loading...'))}
    />
  );
};

export default Loader;
