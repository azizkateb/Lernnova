import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';
import { useLanguage } from '../../context/LanguageContext';

const ErrorState = ({ error, onRetry }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-rose-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        {t('components.errorState.title')}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mb-8">
        {error ||
          t(
            'components.errorState.fallback',
            "We couldn't load the information. Please try again later or check your connection."
          )}
      </p>
      {onRetry && (
        <Button variant="outline" icon={RefreshCw} onClick={onRetry}>
          {t('components.errorState.retry')}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
