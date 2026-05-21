import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Mail, Headphones, Briefcase, Clock, ArrowUpRight } from 'lucide-react';
import SEO from '../../components/common/SEO';

const Contact = () => {
  const { t, isRTL } = useLanguage();
  const [chatActive, setChatActive] = useState(false);

  const contactChannels = [
    {
      key: 'general',
      index: '01',
      icon: Mail,
      title: t('pages.contact.cards.generalTitle', 'General Inquiries'),
      email: 'info@lernnova.com',
      description: t(
        'pages.contact.cards.generalDesc',
        'Questions about the platform, partnerships, or anything you cannot place into a box. Write to us and we will route it well.'
      ),
      accent: t('pages.contact.cards.generalAccent', 'anything')
    },
    {
      key: 'support',
      index: '02',
      icon: Headphones,
      title: t('pages.contact.cards.supportTitle', 'Customer Support'),
      email: 'support@lernnova.com',
      description: t(
        'pages.contact.cards.supportDesc',
        'Order issues, account access, refunds, or anything that needs a human. Our support team picks up where automation falls short.'
      ),
      accent: t('pages.contact.cards.supportAccent', 'humans')
    },
    {
      key: 'business',
      index: '03',
      icon: Briefcase,
      title: t('pages.contact.cards.businessTitle', 'Business & Press'),
      email: 'business@lernnova.com',
      description: t(
        'pages.contact.cards.businessDesc',
        'Press, partnerships, enterprise procurement, and strategic introductions. Direct line to our business desk.'
      ),
      accent: t('pages.contact.cards.businessAccent', 'direct')
    }
  ];

  return (
    <div className="bg-transparent min-h-screen transition-colors duration-500 font-sans" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <SEO 
        title={t('pages.contact.seoTitle')}
        description={t('pages.contact.seoDesc')}
      />
      <section className="relative pt-24 pb-20 bg-slate-950/40 backdrop-blur-md border-b border-slate-100/30 dark:border-slate-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary/10 border border-primary/20 rounded-lg mb-6">
            <span className="text-xl leading-none">☎️</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">{t('pages.contact.badge', 'Support Center')}</span>
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
            {t('pages.contact.heroTitlePrefix', 'We are here to')}{' '}
            <span className="font-serif italic text-accent">{t('pages.contact.heroTitleAccent', 'help.')}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            {t(
              'pages.contact.heroSubtitle',
              'Have questions about your purchase, account, or how to register as a seller? Reach out to our dedicated support representatives immediately.'
            )}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Quick info channels */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{t('pages.contact.corporateBadge', 'Corporate Details')}</p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">{t('pages.contact.corporateTitle', 'Connect with us')}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{t('pages.contact.corporateDesc', 'Lernnova operates as a global remote-first digital marketplace.')}</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-[60px] h-[60px] flex items-center justify-center shrink-0 relative">
                  <div className="envelope-loader scale-[0.38] origin-center shrink-0"></div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">{t('pages.contact.emailLabel', 'Email Address')}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">support@lernnova.com</p>
                  <p className="text-xs text-slate-400 font-medium">{t('pages.contact.emailHint', 'Responses within 24 hours')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div 
                  className={`chat-uiverse ${chatActive ? 'active' : ''}`}
                  onClick={() => setChatActive(!chatActive)}
                >
                  <div className="background"></div>
                  <svg viewBox="0 0 100 100" className="chat-bubble">
                    <g className="bubble">
                      <path 
                        d="M 30.7873,85.113394 30.7873,46.556405 C 30.7873,41.101961 36.826342,35.342 40.898074,35.342 H 59.113981 C 63.73287,35.342 69.29995,40.103201 69.29995,46.784744" 
                        className="line line1"
                      />
                      <path 
                        d="M 13.461999,65.039335 H 58.028684 C 63.483128,65.039335 69.243089,59.000293 69.243089,54.928561 V 45.605853 C 69.243089,40.986964 65.02087,35.419884 58.339327,35.419884" 
                        className="line line2"
                      />
                    </g>
                    <circle cx="42.5" cy="50.7" r="1.9" className="circle circle1"></circle>
                    <circle r="1.9" cy="50.7" cx="49.9" className="circle circle2"></circle>
                    <circle cx="57.3" cy="50.7" r="1.9" className="circle circle3"></circle>
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">{t('pages.contact.chatTitle', 'Live Chat Support')}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('pages.contact.chatHint', 'Available in Dashboard')}</p>
                  <p className="text-xs text-slate-400 font-medium">{t('pages.contact.chatHours', 'Mon - Fri: 9:00 AM - 6:00 PM UTC')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="flex items-center justify-center w-[60px] h-[60px] rounded-full bg-[#30C04F] hover:bg-[#2bac47] transition-all duration-300 border-none shrink-0 outline-none shadow-md shadow-[#30C04F]/20 hover:shadow-lg hover:shadow-[#30C04F]/30 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" className="w-8 h-8 text-white">
                    <path strokeWidth="2" strokeLinecap="round" stroke="#fff" fillRule="evenodd" d="m24.8868 19.1288c-1.0274-.1308-2.036-.3815-3.0052-.7467-.7878-.29-1.6724-.1034-2.276.48-.797.8075-2.0493.9936-2.9664.3258-1.4484-1.055-2.7233-2.3295-3.7783-3.7776-.6681-.9168-.4819-2.1691.3255-2.9659.5728-.6019.7584-1.4748.4802-2.2577-.3987-.98875-.6792-2.02109-.8358-3.07557-.2043-1.03534-1.1138-1.7807-2.1694-1.77778h-3.18289c-.60654-.00074-1.18614.25037-1.60035.69334-.40152.44503-.59539 1.03943-.53345 1.63555.344 3.31056 1.47164 6.49166 3.28961 9.27986 1.64878 2.5904 3.84608 4.7872 6.43688 6.4356 2.7927 1.797 5.9636 2.9227 9.2644 3.289h.1778c.5409.0036 1.0626-.2 1.4581-.569.444-.406.6957-.9806.6935-1.5822v-3.1821c.0429-1.0763-.7171-2.0185-1.7782-2.2046z" clipRule="evenodd"></path>
                  </svg>
                </button>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">{t('pages.contact.phoneTitle', 'Corporate Hotlines')}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">+1 (800) LERN-NOW (537-6669)</p>
                  <p className="text-xs text-slate-400 font-medium">{t('pages.contact.phoneHint', 'High volume queues apply during holidays')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-[60px] h-[60px] flex items-center justify-center shrink-0 relative pb-1">
                  <div className="map-marker-loader"></div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">{t('pages.contact.hqTitle', 'Headquarters')}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Lernnova Technologies LLC</p>
                  <p className="text-xs text-slate-400 font-medium">160 Greentree Dr, Dover, DE 19904</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact channels — direct mail to the right desk */}
          <div className="lg:col-span-2">
            <div className="mb-10 flex items-end justify-between gap-6 flex-wrap">
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
                  {t('pages.contact.channelsBadge', 'Direct Channels')}
                </p>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {t('pages.contact.channelsTitlePrefix', 'Write to the right')}{' '}
                  <span className="font-serif italic text-accent">{t('pages.contact.channelsTitleAccent', 'desk.')}</span>
                </h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-sm">
                {t(
                  'pages.contact.channelsDesc',
                  'No web form. No black box. Send an email and a real teammate will reply from the address below.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {contactChannels.map(({ key, index, icon: Icon, title, email, description, accent }) => (
                <a
                  key={key}
                  href={`mailto:${email}`}
                  className="group relative flex flex-col justify-between gap-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800 p-7 rounded-3xl shadow-subtle hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute top-5 right-5 text-[10px] font-mono font-bold text-slate-300 dark:text-slate-700 tracking-widest">
                    {index}
                  </span>
                  <div className="flex items-start gap-4">
                    <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-primary/10 text-primary border border-primary/15 group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {title}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest mt-0.5">
                        <span className="font-serif italic normal-case tracking-normal text-accent text-sm">{accent}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {description}
                  </p>
                  <div className="flex items-center justify-between pt-5 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {email}
                    </span>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300 shrink-0">
                      <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                    </span>
                  </div>
                </a>
              ))}

              {/* Response time note — fourth tile, distinct treatment */}
              <div className="relative flex flex-col justify-between gap-6 p-7 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50/60 via-transparent to-transparent dark:from-slate-900/40 overflow-hidden">
                <span className="absolute top-5 right-5 text-[10px] font-mono font-bold text-slate-300 dark:text-slate-700 tracking-widest">
                  04
                </span>
                <div className="flex items-start gap-4">
                  <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-accent/10 text-accent border border-accent/20 shrink-0">
                    <Clock className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">
                      {t('pages.contact.responseBadge', 'Response Window')}
                    </p>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {t('pages.contact.responseTitlePrefix', 'A reply within')}{' '}
                      <span className="font-serif italic text-accent">{t('pages.contact.responseTitleAccent', '24–48 hours.')}</span>
                    </h4>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {t(
                    'pages.contact.responseDesc',
                    'We typically respond within 24–48 business hours, Monday through Friday. Urgent order matters are prioritized via the Support channel.'
                  )}
                </p>
                <div className="flex items-center gap-2 pt-5 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                    {t('pages.contact.responseStatus', 'Inboxes monitored daily')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
