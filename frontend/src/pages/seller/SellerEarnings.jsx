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
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { getSellerOverview } from '../../api/dashboardApi';
import {
  createStripeConnectAccount,
  getStripeConnectStatus,
  refreshStripeConnectLink,
} from '../../api/stripeConnectApi';
import StatsCard from '../../components/marketplace/StatsCard';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { useLanguage } from '../../context/LanguageContext';
import { cn } from '../../utils/cn';

/**
 * Money formatter — delegates directly to formatCurrency which now always
 * shows a currency value (e.g. $0.00) even for zero.
 */
const formatMoney = (amount, currency = 'USD') => formatCurrency(Number(amount) || 0, currency);

const SellerEarnings = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stripeStatus, setStripeStatus] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState(null);
  const [stripeSetupError, setStripeSetupError] = useState(false);
  const [connectNotEnabled, setConnectNotEnabled] = useState(false);

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

  const fetchStripeStatus = async () => {
    setStripeLoading(true);
    setStripeError(null);
    setStripeSetupError(false);
    setConnectNotEnabled(false);
    try {
      const status = await getStripeConnectStatus();
      setStripeStatus(status);
    } catch (err) {
      if (err.response?.data?.connectNotEnabled) {
        setConnectNotEnabled(true);
      } else if (err.response?.status === 503) {
        setStripeSetupError(true);
        setStripeStatus(null);
        setStripeError(
          err.response?.data?.message ||
            t('pages.seller.earnings.stripe.setupError')
        );
      } else {
        setStripeError(t('pages.seller.earnings.stripe.error'));
      }
    } finally {
      setStripeLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setStripeLoading(true);
    setStripeError(null);
    setStripeSetupError(false);
    setConnectNotEnabled(false);
    try {
      const result = await createStripeConnectAccount();
      if (result.onboarding_url) {
        window.location.href = result.onboarding_url;
      }
    } catch (err) {
      if (err.response?.data?.connectNotEnabled) {
        setConnectNotEnabled(true);
      } else if (err.response?.status === 503) {
        setStripeSetupError(true);
        setStripeError(
          err.response?.data?.message ||
            t('pages.seller.earnings.stripe.setupError')
        );
      } else {
        setStripeError(err.response?.data?.message || t('pages.seller.earnings.stripe.error'));
      }
    } finally {
      setStripeLoading(false);
    }
  };

  const handleRefreshLink = async () => {
    setStripeLoading(true);
    setStripeError(null);
    setStripeSetupError(false);
    setConnectNotEnabled(false);
    try {
      const result = await refreshStripeConnectLink();
      if (result.onboarding_url) {
        window.location.href = result.onboarding_url;
      }
    } catch (err) {
      if (err.response?.data?.connectNotEnabled) {
        setConnectNotEnabled(true);
      } else if (err.response?.status === 503) {
        setStripeSetupError(true);
        setStripeError(
          err.response?.data?.message ||
            t('pages.seller.earnings.stripe.setupError')
        );
      } else {
        setStripeError(err.response?.data?.message || t('pages.seller.earnings.stripe.error'));
      }
    } finally {
      setStripeLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchStripeStatus();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={fetchOverview} />;

  const overview = data?.overview || {};
  const revenue = overview?.revenue || {};
  const serviceOrders = overview?.service_orders || {};
  const productOrders = overview?.product_orders || {};
  const needsReconnect = Boolean(stripeStatus?.needsReconnect);
  const onboardingComplete = Boolean(
    stripeStatus?.onboardingComplete ?? stripeStatus?.onboarding_complete
  );
  const chargesEnabled = Boolean(
    stripeStatus?.chargesEnabled ?? stripeStatus?.charges_enabled
  );
  const payoutsEnabled = Boolean(
    stripeStatus?.payoutsEnabled ?? stripeStatus?.payouts_enabled
  );
  const detailsSubmitted = Boolean(
    stripeStatus?.detailsSubmitted ?? stripeStatus?.details_submitted
  );
  const reconnectMessage =
    stripeStatus?.message ||
    t('pages.seller.earnings.stripe.reconnectMessage');

  const totalRevenue = Number(revenue?.total || 0);
  const serviceRevenue = Number(revenue?.services || 0);
  const productRevenue = Number(revenue?.products || 0);

  const totalServiceOrders = serviceOrders?.total || 0;
  const paidServiceOrders = overview?.paid_service_orders || serviceOrders?.paid || 0;
  const totalProductOrders = productOrders?.total || 0;
  const paidProductOrders = productOrders?.paid || 0;

  const servicePercent =
    totalRevenue > 0 ? Math.round((serviceRevenue / totalRevenue) * 100) : 0;
  const productPercent =
    totalRevenue > 0 ? Math.round((productRevenue / totalRevenue) * 100) : 0;

  const servicePaidRate =
    totalServiceOrders > 0
      ? Math.round((paidServiceOrders / totalServiceOrders) * 100)
      : 0;
  const productPaidRate =
    totalProductOrders > 0
      ? Math.round((paidProductOrders / totalProductOrders) * 100)
      : 0;

  const revenueStats = [
    {
      title: t('pages.seller.earnings.totalRevenue'),
      value: formatMoney(totalRevenue),
      icon: DollarSign,
      color: 'emerald',
    },
    {
      title: t('pages.seller.earnings.serviceRevenue'),
      value: formatMoney(serviceRevenue),
      icon: TrendingUp,
      color: 'indigo',
    },
    {
      title: t('pages.seller.earnings.productRevenue'),
      value: formatMoney(productRevenue),
      icon: Wallet,
      color: 'amber',
    },
  ];

  const orderStats = [
    {
      title: t('pages.seller.earnings.totalServiceOrders'),
      value: totalServiceOrders,
      icon: FileText,
      color: 'sky',
    },
    {
      title: t('pages.seller.earnings.paidServiceOrders'),
      value: paidServiceOrders,
      icon: CheckCircle2,
      color: 'emerald',
    },
    {
      title: t('pages.seller.earnings.totalProductOrders'),
      value: totalProductOrders,
      icon: ShoppingBag,
      color: 'indigo',
    },
    {
      title: t('pages.seller.earnings.paidProductOrders'),
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
              {t('pages.seller.earnings.kicker')}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3 leading-[1.05]">
              {t('pages.seller.earnings.title')}{' '}
              <span className="font-serif italic font-light text-amber-200">
                {t('pages.seller.earnings.titleAccent')}
              </span>
            </h1>
            <p className="text-indigo-100/90 font-medium text-base md:text-lg leading-relaxed">
              {t('pages.seller.earnings.heroSubtitle')}
            </p>
          </div>

          <div className="lg:text-right">
            <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.25em] mb-3">
              {t('pages.seller.earnings.lifetimeRevenue')}
            </p>
            <div className="flex items-baseline gap-3 lg:justify-end">
              <span className="text-5xl md:text-6xl font-black text-white tracking-tight tabular-nums">
                {formatMoney(totalRevenue)}
              </span>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-50 text-xs font-bold backdrop-blur-sm">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {t('pages.seller.earnings.allTime')}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────── Revenue Cards ─────────── */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('pages.seller.earnings.revenueBreakdown')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
              {t('pages.seller.earnings.revenueBreakdownSubtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {revenueStats.map((stat) => (
            <StatsCard key={`revenue-${stat.title}`} {...stat} />
          ))}
        </div>

        {/* Revenue split bar */}
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
              {t('pages.seller.earnings.revenueSplit')}
            </h3>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {formatMoney(totalRevenue)} {t('pages.seller.earnings.totalLabel')}
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
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {t('pages.seller.earnings.servicesLabel')}
                    </p>
                    <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {formatMoney(serviceRevenue)}
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2">
                        {servicePercent}%
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {t('pages.seller.earnings.productsLabel')}
                    </p>
                    <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {formatMoney(productRevenue)}
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2">
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
                <DollarSign className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {t('pages.seller.earnings.noRevenue')}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('pages.seller.earnings.firstSale')}
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
              {t('pages.seller.earnings.orderMetrics')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
              {t('pages.seller.earnings.orderMetricsSubtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {orderStats.map((stat) => (
            <StatsCard key={`orders-${stat.title}`} {...stat} />
          ))}
        </div>

        {/* Conversion mini-cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <ConversionCard
            label={t('pages.seller.earnings.servicePaidRate')}
            valueLabel={`${paidServiceOrders} / ${totalServiceOrders}`}
            percent={servicePaidRate}
            accent="indigo"
            icon={CheckCircle2}
          />
          <ConversionCard
            label={t('pages.seller.earnings.productPaidRate')}
            valueLabel={`${paidProductOrders} / ${totalProductOrders}`}
            percent={productPaidRate}
            accent="amber"
            icon={CreditCard}
          />
        </div>
      </section>

      {/* ─────────── Stripe Connect Card ─────────── */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('pages.seller.earnings.stripe.connectTitle')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
              {t('pages.seller.earnings.stripe.connectDesc')}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/70 bg-white dark:bg-slate-900/60">
          <div className="relative p-6 md:p-7">
            {connectNotEnabled && (
              <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  {t('pages.seller.earnings.stripe.connectNotEnabled')}
                </p>
              </div>
            )}
            {stripeLoading && !stripeStatus ? (
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">{t('pages.seller.earnings.stripe.loading')}</span>
              </div>
            ) : stripeError && !stripeStatus ? (
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <div className="space-y-1">
                  <span className="block text-sm font-medium">{stripeError}</span>
                  {stripeSetupError ? (
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {t('pages.seller.earnings.stripe.setupErrorHint')}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : stripeStatus?.connected ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-center">
                    {onboardingComplete ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {onboardingComplete
                        ? t('pages.seller.earnings.stripe.statusReady')
                        : t('pages.seller.earnings.stripe.statusIncomplete')}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={cn(
                        'inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full',
                        chargesEnabled
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50'
                          : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-900/50'
                      )}>
                        {chargesEnabled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {t('pages.seller.earnings.stripe.chargesEnabled')}
                      </span>
                      <span className={cn(
                        'inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full',
                        payoutsEnabled
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50'
                          : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-900/50'
                      )}>
                        {payoutsEnabled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {t('pages.seller.earnings.stripe.payoutsEnabled')}
                      </span>
                      <span className={cn(
                        'inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full',
                        detailsSubmitted
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50'
                          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50'
                      )}>
                        {detailsSubmitted ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {t('pages.seller.earnings.stripe.detailsSubmitted')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 shrink-0">
                  {!onboardingComplete && (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={ExternalLink}
                      onClick={handleRefreshLink}
                      disabled={stripeLoading}
                    >
                      {t('pages.seller.earnings.stripe.continueButton')}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    icon={RefreshCw}
                    onClick={fetchStripeStatus}
                    disabled={stripeLoading}
                  >
                    {t('common.refresh', 'Refresh')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/70 flex items-center justify-center">
                    <Info className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {needsReconnect
                        ? t('pages.seller.earnings.stripe.reconnectTitle')
                        : t('pages.seller.earnings.stripe.notConnected')}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                      {needsReconnect
                        ? reconnectMessage
                        : t('pages.seller.earnings.stripe.connectDesc')}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  icon={ExternalLink}
                  onClick={handleConnectStripe}
                  disabled={stripeLoading}
                >
                  {stripeLoading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('common.loading', 'Loading...')}
                    </span>
                  ) : (
                    needsReconnect
                      ? t('pages.seller.earnings.stripe.reconnectButton')
                      : t('pages.seller.earnings.stripe.connectButton')
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
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
          <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {label}
          </p>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
              {percent}%
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">{valueLabel}</span>
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
