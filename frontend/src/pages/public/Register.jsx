import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ArrowLeft, ShieldCheck, Briefcase, Users, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { register as registerApi, resendVerification } from '../../api/authApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Logo from '../../components/common/Logo';
import PhoneMockup from '../../components/auth/PhoneMockup';
import AuthHero from '../../components/auth/AuthHero';
import Alert from '../../components/common/Alert';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../context/LanguageContext';
import SEO from '../../components/common/SEO';

const Register = () => {
  const { t, isRTL } = useLanguage();
  const [userData, setUserData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'buyer' 
  });
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    const roleParam = searchParams.get('role');
    if (roleParam === 'seller' || roleParam === 'buyer') {
      setUserData((prev) => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setUserData({ ...userData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerApi(userData);
      setRegistered(true);
      setRegisteredEmail(userData.email);
    } catch (err) {
      const msg = err.response?.data?.message || t('auth.register.errorFallback');
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resendVerification(registeredEmail);
      setResendSent(true);
    } catch {
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-900 overflow-x-hidden font-sans" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <SEO 
        title={t('pages.register.seoTitle', 'Create Your Free Account')}
        description={t(
          'pages.register.seoDesc',
          'Register as a client or digital creator on Lernnova to download design resources, hire software engineers, list templates, and start earning global income.'
        )}
      />
      
      {/* Cinematic Brand Hero (Left 5 Columns) */}
      <div className="hidden lg:block lg:col-span-5 relative min-h-screen h-full">
        <AuthHero 
          backgroundImage="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80"
          title={t('auth.register.title')}
          subtitle={t('auth.register.subtitle')}
        />
      </div>

      {/* Interactive Smartphone Mockup Display (Right 7 Columns) */}
      <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-start px-4 pb-10 pt-16 sm:px-6 sm:pt-20 md:px-8 lg:justify-center lg:p-12 bg-slate-900 min-h-screen relative">
        {/* Dynamic decorative backdrop shapes */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div id="register-form" className="w-full max-w-md relative z-10 flex flex-col">
          {/* Header navigation bar */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />
              {t('nav.home')}
            </Link>
            
            {/* Small subtle branding shown on top of the mockup wrapper on mobile */}
            <div className="lg:hidden">
              <Logo size="sm" showText={false} />
            </div>
          </div>

          <PhoneMockup>
            <div className="flex-1 flex flex-col justify-center py-4">
              {registered ? (
                <div className="text-center px-1">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <h1 className="text-xl font-bold text-white mb-2">
                    {t('auth.emailVerification.title', 'Verify your email')}
                  </h1>
                  <p className="text-sm text-slate-400 mb-4">
                    {t('auth.emailVerification.checkInbox', 'Check your inbox to activate your account.')}
                  </p>
                  <Alert type="success" animated={true} title={t('auth.emailVerification.sent', 'If your account exists and is not verified, a new verification email has been sent.')} />
                  <div className="mt-6 space-y-4">
                    {!resendSent ? (
                      <Button
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-accent text-white font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:opacity-95 hover:shadow-xl transition-all"
                        size="md"
                        isLoading={resendLoading}
                        onClick={handleResend}
                      >
                        {t('auth.emailVerification.resend', 'Resend verification email')}
                      </Button>
                    ) : (
                      <p className="text-xs text-slate-400">{t('auth.emailVerification.sent', 'If your account exists and is not verified, a new verification email has been sent.')}</p>
                    )}
                    <Link
                      to="/login"
                      className="inline-block text-xs font-bold text-primary hover:text-accent transition-colors"
                    >
                      {t('auth.emailVerification.backToLogin', 'Back to login')}
                    </Link>
                  </div>
                </div>
              ) : (
              <>
              {/* App Welcome Badge */}
              <div className="text-center mb-5">
                <Logo size="sm" showText={false} className="justify-center mb-2.5 scale-90" />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                  {t('auth.register.button')}
                </h1>
                <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto font-medium">
                  {t('pages.register.subtitle', 'Start buying or selling digital excellence.')}
                </p>
              </div>

              {/* Premium Inline Sandbox Alert Banner */}
              <div className="mb-4 px-1">
                <Alert type="info" animated={true} title={t('auth.register.infoTitle')}>
                  {t('auth.register.infoDesc')}
                </Alert>
              </div>

              {/* Role Toggle Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4 select-none">
                <button 
                  type="button"
                  onClick={() => handleRoleSelect('buyer')}
                  className={cn(
                    "p-2.5 rounded-xl border transition-all flex flex-col items-center gap-1.5 text-center cursor-pointer",
                    userData.role === 'buyer' 
                      ? "border-primary bg-primary/10 text-primary shadow-xs" 
                      : "border-white/5 bg-white/5 text-slate-400 hover:border-white/10"
                  )}
                >
                  <Users className="w-4 h-4" />
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-white tracking-wider">{t('auth.register.buyer')}</p>
                    <p className="text-[8px] text-slate-500 font-medium">{t('auth.register.roleBuyerHint')}</p>
                  </div>
                </button>
                
                <button 
                  type="button"
                  onClick={() => handleRoleSelect('seller')}
                  className={cn(
                    "p-2.5 rounded-xl border transition-all flex flex-col items-center gap-1.5 text-center cursor-pointer",
                    userData.role === 'seller' 
                      ? "border-accent bg-accent/10 text-accent shadow-xs" 
                      : "border-white/5 bg-white/5 text-slate-400 hover:border-white/10"
                  )}
                >
                  <Briefcase className="w-4 h-4" />
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-white tracking-wider">{t('auth.register.seller')}</p>
                    <p className="text-[8px] text-slate-500 font-medium">{t('auth.register.roleSellerHint')}</p>
                  </div>
                </button>
              </div>

              {/* Real form handler */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <Input
                  label={t('auth.register.fullNameLabel')}
                  name="name"
                  placeholder={t('auth.register.fullNamePlaceholder')}
                  icon={User}
                  value={userData.name}
                  onChange={handleChange}
                  required
                  className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder-slate-500 [&_input]:focus:ring-primary/40 [&_input]:focus:border-primary/80 [&_label]:text-slate-300 [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-widest"
                />
                
                <Input
                  label={t('auth.register.emailLabel')}
                  name="email"
                  type="email"
                  placeholder={t('auth.register.emailPlaceholder')}
                  icon={Mail}
                  value={userData.email}
                  onChange={handleChange}
                  required
                  className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder-slate-500 [&_input]:focus:ring-primary/40 [&_input]:focus:border-primary/80 [&_label]:text-slate-300 [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-widest"
                />
                
                <div className="flex flex-col gap-1.5 w-full [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-widest [&_label]:text-slate-300">
                  <label className="ml-0.5">
                    {t('auth.register.passwordLabel')}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.register.passwordPlaceholder')}
                      value={userData.password}
                      onChange={handleChange}
                      minLength={8}
                      autoComplete="new-password"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 ps-12 pe-12 text-sm font-medium text-white placeholder-slate-500 transition focus:border-primary/80 focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                      className="absolute end-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/5 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <p className="text-[9px] text-slate-500 font-medium leading-relaxed italic text-center">
                  {t('auth.register.termsLinePrefix')}{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    {t('auth.register.terms')}
                  </Link>{' '}
                  {t('auth.register.and')}{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    {t('auth.register.privacy')}
                  </Link>
                  .
                </p>

                <Button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-accent text-white font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:opacity-95 hover:shadow-xl transition-all"
                  size="md"
                  icon={UserPlus}
                  isLoading={loading}
                >
                  {t('auth.register.button')}
                </Button>
              </form>

              {/* Account conversion section */}
              <div className="mt-6 pt-5 border-t border-white/5 text-center">
                <p className="text-sm font-semibold text-slate-400">
                  {t('auth.register.hasAccount')}{' '}
                  <Link 
                    to="/login" 
                    className="text-primary hover:text-accent font-bold hover:underline underline-offset-4 transition-colors"
                  >
                    {t('auth.register.loginLink')}
                  </Link>
                </p>
              </div>
            </>
            )}
            </div>
          </PhoneMockup>
        </div>
      </div>

    </div>
  );
};

export default Register;
