import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  ShoppingBag,
  Package,
  FileText,
  CheckCircle2,
  CreditCard,
  Info,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { getSellerOverview } from '../../api/dashboardApi';
import StatsCard from '../../components/marketplace/StatsCard';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { formatCurrency } from '../../utils/formatCurrency';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const SellerEarnings = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getSellerOverview();
      setData(resp);
    } catch (err) {
      setError(err?.message || t('errors.generic', 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={fetchOverview} />;

  const overview = data?.overview || {};
  const revenue = overview?.revenue || {};
  const serviceOrders = overview?.service_orders || {};
  const productOrders = overview?.product_orders || {};

  const totalRevenue = Number(revenue?.total || 0);
  const serviceRevenue = Number(revenue?.services || 0);
  const productRevenue = Number(revenue?.products || 0);

  const totalServiceOrders = serviceOrders?.total || 0;
  const completedServiceOrders = serviceOrders?.completed || 0;
  const totalProductOrders = productOrders?.total || 0;
  const paidProductOrders = productOrders?.paid || 0;

  // Calculate revenue split percentages safely
  const servicePercent =
    totalRevenue > 0 ? Math.round((serviceRevenue / totalRevenue) * 100) : 0;
  const productPercent =
    totalRevenue > 0 ? Math.round((productRevenue / totalRevenue) * 100) : 0;

  // Conversion rates
  const serviceCompletionRate =
    totalServiceOrders > 0
      ? Math.round((completedServiceOrders / totalServiceOrders) * 100)
      : 0;
  const productPaidRate =
    totalProductOrders > 0
      ? Math.round((paidProductOrders / totalProductOrders) * 100)
      : 0;

  const revenueStats = [
    {
      title: t('earnings.totalRevenue', 'Total Revenue'),
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'emerald',
    },
    {
      title: t('earnings.serviceRevenue', 'Service Revenue'),
      value: formatCurrency(serviceRevenue),
      icon: TrendingUp,
      color: 'indigo',
    },
    {
      title: t('earnings.productRevenue', 'Product Revenue'),
      value: formatCurrency(productRevenue),
      icon: Wallet,
      color: 'amber',
    },
  ];

  const orderStats = [
    {
      title: t('earnings.totalServiceOrders', 'Total Service Orders'),
      value: totalServiceOrders,
      icon: FileText,
      color: 'sky',
    },
    {
      title: t('earnings.completedServiceOrders', 'Completed Services'),
      value: completedServiceOrders,
      icon: CheckCircle2,
      color: 'emerald',
    },
    {
      title: t('earnings.totalProductOrders', 'Total Product Orders'),
      value: totalProductOrders,
      icon: ShoppingBag,
      color: 'indigo',
    },
    {
      title: t('earnings.paidProductOrders', 'Paid Product Orders'),
      value: paidProductOrders,
      icon: Package,
      color: 'amber',
    },
  ];

  return (
    <div className="space-y-10">
      {/* ─────────── Hero / Wallet Header ─────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/80 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 dark:from-indigo-700 dark:via-indigo-800 dark:to-violet-900 shadow-[0_20px_60px_-20px_rgba(79,70,229,0.5)]">
        {/* decorative orbs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-amber-300/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative p-8 md:p-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              {t('earnings.heroTag', 'Earnings · Wallet')}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3 leading-[1.05]">
              {user?.name
                ? t('earnings.heroTitleNamed', 'Hey {{name}}, here is your money.', {
                    name: user.name.split(' ')[0],
                  })
                : t('earnings.heroTitle', 'Here is your money.')}
            </h1>
            <p className="text-indigo-100/80 font-medium text-base md:text-lg leading-relaxed">
              {t(
                'earnings.heroSubtitle',
                'A live snapshot of every dollar you have earned on Lernnova — services, products, and orders, all in one place.'
              )}
            </p>
          </div>

          <div className="lg:text-right">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.25em] mb-3">
              {t('earnings.lifetimeRevenue', 'Lifetime Revenue')}
            </p>
            <div className="flex items-baseline gap-3 lg:justify-end">
              <span className="text-5xl md:text-6xl font-black text-white tracking-tight tabular-nums">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-100 text-xs font-bold backdrop-blur-sm">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {t('earnings.allTime', 'All-time gross earnings')}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────── Revenue Cards ─────────── */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('earnings.revenueBreakdown', 'Revenue breakdown')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              {t(
                'earnings.revenueBreakdownSubtitle',
                'How your services and products contribute to the total.'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {revenueStats.map((stat, idx) => (
            <StatsCard key={idx} {...stat} />
          ))}
        </div>

        {/* Revenue split bar */}
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
              {t('earnings.revenueSplit', 'Revenue split')}
            </h3>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
              {formatCurrency(totalRevenue)} {t('earnings.total', 'total')}
            </span>
          </div>

          {totalRevenue > 0 ? (
            <>
              <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-700 ease-out"
                  style={{ width: `${servicePercent}%` }}
                />
                <div
                  className="bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700 ease-out"
                  style={{ width: `${productPercent}%` }}
                />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {t('earnings.services', 'Services')}
                    </p>
                    <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {formatCurrency(serviceRevenue)}
                      <span className="text-xs font-bold text-slate-400 ml-2">
                        {servicePercent}%
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {t('earnings.products', 'Products')}
                    </p>
                    <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {formatCurrency(productRevenue)}
                      <span className="text-xs font-bold text-slate-400 ml-2">
                        {productPercent}%
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-bold text-slate-400 italic">
                {t(
                  'earnings.noRevenueYet',
                  'No revenue yet — your first sale will appear here.'
                )}
              </p>
            </div>
          )}
        </Card>
      </section>

      {/* ─────────── Order Metrics ─────────── */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('earnings.orderMetrics', 'Order metrics')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              {t(
                'earnings.orderMetricsSubtitle',
                'Volume and conversion across services and products.'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {orderStats.map((stat, idx) => (
            <StatsCard key={idx} {...stat} />
          ))}
        </div>

        {/* Conversion mini-cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <ConversionCard
            label={t('earnings.serviceCompletionRate', 'Service completion rate')}
            valueLabel={`${completedServiceOrders} / ${totalServiceOrders}`}
            percent={serviceCompletionRate}
            accent="indigo"
            icon={CheckCircle2}
          />
          <ConversionCard
            label={t('earnings.productPaidRate', 'Product paid rate')}
            valueLabel={`${paidProductOrders} / ${totalProductOrders}`}
            percent={productPaidRate}
            accent="amber"
            icon={CreditCard}
          />
        </div>
      </section>

      {/* ─────────── Future Payouts Info Banner ─────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200/60 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50 via-indigo-50/60 to-sky-50 dark:from-indigo-950/40 dark:via-indigo-950/20 dark:to-sky-950/30">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-indigo-200/40 dark:bg-indigo-700/20 blur-3xl" />
        <div className="relative p-6 md:p-7 flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-white dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shadow-sm">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-1.5">
              {t('earnings.comingSoonTag', 'Coming soon')}
            </p>
            <h4 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1">
              {t('earnings.payoutsTitle', 'Payouts &amp; withdrawals')}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {t(
                'earnings.payoutsNote',
                'Withdrawals and payout tracking will be available in a future update.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Local helper component: ConversionCard ────────────────────────────
const ConversionCard = ({ label, valueLabel, percent, accent = 'indigo', icon: Icon }) => {
  const accents = {
    indigo: {
      bar: 'from-indigo-500 to-indigo-600',
      iconBg:
        'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    },
    amber: {
      bar: 'from-amber-400 to-amber-500',
      iconBg:
        'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    },
    emerald: {
      bar: 'from-emerald-500 to-emerald-600',
      iconBg:
        'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    },
  };
  const a = accents[accent] || accents.indigo;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {label}
          </p>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
              {percent}%
            </span>
            <span className="text-xs font-bold text-slate-400">{valueLabel}</span>
          </div>
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-2xl', a.iconBg)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={cn('h-full bg-gradient-to-r transition-all duration-700 ease-out', a.bar)}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </Card>
  );
};

export default SellerEarnings;
