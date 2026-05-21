import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';

const PaymentSuccess = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-transparent min-h-screen pb-20 mt-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-black text-slate-900 dark:text-white">
              {t('pages.paymentSuccess.title', 'Payment Confirmed')}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
              {t("pages.paymentSuccess.subtitle", "Your payment is being confirmed. You'll receive a confirmation email shortly.")}
            </p>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/60 p-8 rounded-[2rem] border border-slate-100/40 dark:border-slate-800/50 backdrop-blur-md shadow-subtle space-y-6">
            <div className="text-left space-y-3">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {t("pages.paymentSuccess.whatNext", "What's next?")}
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  {t('pages.paymentSuccess.step1', 'Check your email for the product download link')}
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  {t('pages.paymentSuccess.step2', 'Access your purchases in My Purchases dashboard')}
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  {t('pages.paymentSuccess.step3', 'Get lifetime access to your digital product')}
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/buyer/product-orders" className="w-full sm:w-auto">
              <Button className="w-full">
                {t('pages.paymentSuccess.button', 'Go to My Purchases')}
              </Button>
            </Link>
            <Link to="/products" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                {t('pages.paymentSuccess.browse', 'Browse More Products')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
