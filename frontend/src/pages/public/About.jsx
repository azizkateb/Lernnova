import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Shield, Landmark, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';

const About = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="bg-transparent min-h-screen transition-colors duration-500 font-sans" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <SEO 
        title={t('pages.about.seoTitle')}
        description={t('pages.about.seoDesc')}
      />
      {/* Hero Header */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-slate-950/40 backdrop-blur-md border-b border-slate-100/30 dark:border-slate-800/20">
        <div className="absolute inset-0 bg-linear-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
             <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg mb-6">
               <Sparkles className="w-4.5 h-4.5 text-primary" />
               <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">{t('pages.about.badge', 'Our Vision')}</span>
             </span>
            <h1 className="text-4xl md:text-6xl font-light leading-tight mb-6 text-slate-900 dark:text-white">
              {t('pages.about.heroTitlePrefix', 'Empowering the')}{' '}
              <span className="font-serif italic text-accent">{t('pages.about.heroTitleAccent', 'global')}</span>{' '}
              {t('pages.about.heroTitleSuffix', 'digital economy')}
            </h1>
            <p className="text-slate-500 dark:text-slate-300 text-lg md:text-xl font-medium leading-relaxed mb-8">
              {t(
                'pages.about.heroSubtitle',
                'Lernnova is a modern, unified hybrid platform bridging world-class creators and freelancers with ambitious clients seeking exceptional virtual services and premium downloadable digital products.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Core Values / Concept */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">{t('pages.about.sectionBadge', 'The Hybrid Edge')}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-6 tracking-tight">
              {t('pages.about.sectionTitle', 'One ecosystem. Two ways to scale your digital presence.')}
            </h2>
            <div className="space-y-6">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {t(
                  'pages.about.sectionP1',
                  'We believe that the future of work is digital, instant, and frictionless. Whether you are seeking customized, bespoke digital agency services or high-quality downloadable templates, planners, PLR eBooks, and courses, Lernnova brings them all under one seamless dashboard.'
                )}
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {t(
                  'pages.about.sectionP2',
                  'By offering both dynamic freelance services and ready-made downloadable items, we enable modern entrepreneurs, businesses, and content developers to access necessary digital leverage without multiple logins.'
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="about-value-card p-8 flex flex-col justify-between min-h-[254px]">
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 animate-pulse">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('pages.about.values.globalTitle', 'Global Audience')}</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{t('pages.about.values.globalDesc', 'Connecting sellers and buyers across worldwide markets, with full support for dual LTR and RTL orientations.')}</p>
              </div>
            </div>

            <div className="about-value-card p-8 flex flex-col justify-between min-h-[254px]">
              <div>
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('pages.about.values.secureTitle', 'Secure Transactions')}</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{t('pages.about.values.secureDesc', 'Safe Escrow structure guarantees your funds. Sellers are rewarded immediately on successful delivery.')}</p>
              </div>
            </div>

            <div className="about-value-card p-8 flex flex-col justify-between min-h-[254px]">
              <div>
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-6">
                  <Landmark className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('pages.about.values.feesTitle', 'Low Platform Fees')}</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{t('pages.about.values.feesDesc', 'Maximize your digital earnings! No hidden setup fees, ensuring a fair split of value for creators.')}</p>
              </div>
            </div>

            <div className="about-value-card p-8 flex flex-col justify-between min-h-[254px]">
              <div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('pages.about.values.curatedTitle', 'Curated Experts')}</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{t('pages.about.values.curatedDesc', 'All registered sellers undergo strict background reviews before listing to ensure premium work output.')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-white/20 dark:bg-slate-950/20 py-20 backdrop-blur-md border-t border-slate-100/20 dark:border-slate-800/20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-light text-slate-900 dark:text-white mb-4">{t('pages.about.ctaTitle', 'Ready to start your journey?')}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto mb-8">
            {t('pages.about.ctaDesc', 'Create an account today to browse customized services or list your very first digital asset on the global market.')}
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg" icon={ArrowRight}>{t('pages.about.ctaButton', 'Join Lernnova Today')}</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
