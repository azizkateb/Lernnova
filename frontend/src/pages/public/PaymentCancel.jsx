import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';

const PaymentCancel = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-transparent min-h-screen pb-20 mt-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-black text-slate-900 dark:text-white">
              {t('pages.paymentCancel.title', 'Payment Cancelled')}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
              {t('pages.paymentCancel.subtitle', 'Your payment has been cancelled. No charges were made to your account.')}
            </p>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/60 p-8 rounded-[2rem] border border-slate-100/40 dark:border-slate-800/50 backdrop-blur-md shadow-subtle space-y-6">
            <div className="text-left space-y-3">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {t('pages.paymentCancel.whyCancel', 'What happened?')}
              </p>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                {t('pages.paymentCancel.description', 'You can return to your cart and try again, or browse more products from our marketplace.')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cart" className="w-full sm:w-auto">
              <Button className="w-full">
                {t('pages.paymentCancel.returnCart', 'Return to Cart')}
              </Button>
            </Link>
            <Link to="/products" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                {t('pages.paymentCancel.browseProducts', 'Browse Products')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
