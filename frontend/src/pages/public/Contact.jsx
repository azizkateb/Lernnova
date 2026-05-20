import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Mail, MessageSquare, Phone, MapPin, Send, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import SEO from '../../components/common/SEO';

const Contact = () => {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [chatActive, setChatActive] = useState(false);
  const sendLabel = t('pages.contact.sendMessage', 'Send Message');
  const sentLabel = t('pages.contact.sent', 'Sent!');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success(t('pages.contact.successToast'));
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 1200);
  };

  return (
    <div className="bg-transparent min-h-screen transition-colors duration-500 font-sans" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <SEO 
        title={t('pages.contact.seoTitle')}
        description={t('pages.contact.seoDesc')}
      />
      <section className="relative pt-24 pb-20 bg-slate-950/40 backdrop-blur-md border-b border-slate-100/30 dark:border-slate-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary/10 border border-primary/20 rounded-lg mb-6">
            <Sparkles className="w-4.5 h-4.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">{t('pages.contact.badge', 'Support Center')}</span>
          </span>
          <h1 className="text-4xl md:text-6xl font-light mb-4 text-slate-900 dark:text-white">
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
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">{t('pages.contact.corporateTitle', 'Connect with us')}</h2>
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

          {/* Form */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800 p-8 sm:p-12 rounded-3xl shadow-subtle hover:shadow-md transition-all duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('pages.contact.formTitle', 'Send us a direct message')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">{t('pages.contact.formDesc', 'Fill out the quick form below and your query will immediately be routed to the respective localized support department.')}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">{t('auth.register.fullNameLabel')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('pages.contact.namePlaceholder')}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">{t('auth.login.emailLabel')}</label>
                  <input
                    type="email"
                    required
                    placeholder={t('pages.contact.emailPlaceholder')}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">{t('pages.contact.subjectLabel', 'Subject')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('pages.contact.subjectPlaceholder')}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">{t('pages.contact.messageLabel', 'Message')}</label>
                <textarea
                  rows="6"
                  required
                  placeholder={t('pages.contact.messagePlaceholder')}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <div className="flex justify-center md:justify-start pt-4">
                <button 
                  type="submit" 
                  disabled={sending} 
                  className={`uiverse-send-btn outline-none select-none ${sending ? 'is-active' : ''}`}
                >
                  <div className="outline"></div>
                  <div className="state state--default">
                    <div className="icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        height="1.2em"
                        width="1.2em"
                      >
                        <g style={{ filter: 'url(#shadow)' }}>
                          <path
                            fill="currentColor"
                            d="M14.2199 21.63C13.0399 21.63 11.3699 20.8 10.0499 16.83L9.32988 14.67L7.16988 13.95C3.20988 12.63 2.37988 10.96 2.37988 9.78001C2.37988 8.61001 3.20988 6.93001 7.16988 5.60001L15.6599 2.77001C17.7799 2.06001 19.5499 2.27001 20.6399 3.35001C21.7299 4.43001 21.9399 6.21001 21.2299 8.33001L18.3999 16.82C17.0699 20.8 15.3999 21.63 14.2199 21.63ZM7.63988 7.03001C4.85988 7.96001 3.86988 9.06001 3.86988 9.78001C3.86988 10.5 4.85988 11.6 7.63988 12.52L10.1599 13.36C10.3799 13.43 10.5599 13.61 10.6299 13.83L11.4699 16.35C12.3899 19.13 13.4999 20.12 14.2199 20.12C14.9399 20.12 16.0399 19.13 16.9699 16.35L19.7999 7.86001C20.3099 6.32001 20.2199 5.06001 19.5699 4.41001C18.9199 3.76001 17.6599 3.68001 16.1299 4.19001L7.63988 7.03001Z"
                          ></path>
                          <path
                            fill="currentColor"
                            d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z"
                          ></path>
                        </g>
                        <defs>
                          <filter id="shadow">
                            <feDropShadow
                              floodOpacity="0.6"
                              stdDeviation="0.8"
                              dy="1"
                              dx="0"
                            ></feDropShadow>
                          </filter>
                        </defs>
                      </svg>
                    </div>
                    <p>
                      {isRTL ? (
                        <span>{sendLabel}</span>
                      ) : (
                        <>
                          {sendLabel.split('').map((ch, i) => (
                            <span key={i} style={{ '--i': i }}>
                              {ch === ' ' ? <>&nbsp;</> : ch}
                            </span>
                          ))}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="state state--sent">
                    <div className="icon">
                      <svg
                        stroke="black"
                        strokeWidth="0.5px"
                        width="1.2em"
                        height="1.2em"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g style={{ filter: 'url(#shadow)' }}>
                          <path
                            d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z"
                            fill="currentColor"
                          ></path>
                          <path
                            d="M10.5795 15.5801C10.3795 15.5801 10.1895 15.5001 10.0495 15.3601L7.21945 12.5301C6.92945 12.2401 6.92945 11.7601 7.21945 11.4701C7.50945 11.1801 7.98945 11.1801 8.27945 11.4701L10.5795 13.7701L15.7195 8.6301C16.0095 8.3401 16.4895 8.3401 16.7795 8.6301C17.0695 8.9201 17.0695 9.4001 16.7795 9.6901L11.1095 15.3601C10.9695 15.5001 10.7795 15.5801 10.5795 15.5801Z"
                            fill="currentColor"
                          ></path>
                        </g>
                      </svg>
                    </div>
                    <p>
                      {isRTL ? (
                        <span>{sentLabel}</span>
                      ) : (
                        <>
                          {sentLabel.split('').map((ch, i) => (
                            <span key={i} style={{ '--i': i + 5 }}>
                              {ch}
                            </span>
                          ))}
                        </>
                      )}
                    </p>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
