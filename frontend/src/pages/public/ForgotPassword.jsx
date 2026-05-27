import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { forgotPassword as forgotPasswordApi } from '../../api/authApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Logo from '../../components/common/Logo';
import PhoneMockup from '../../components/auth/PhoneMockup';
import AuthHero from '../../components/auth/AuthHero';
import Alert from '../../components/common/Alert';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../context/LanguageContext';
import SEO from '../../components/common/SEO';

const ForgotPassword = () => {
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPasswordApi(email);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-900 overflow-x-hidden font-sans" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <SEO
        title={t('auth.forgotPassword.title', 'Forgot your password?')}
      />

      <div className="hidden lg:block lg:col-span-5 relative min-h-screen h-full">
        <AuthHero
          backgroundImage="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"
          title={t('auth.forgotPassword.title')}
          subtitle={t('auth.forgotPassword.subtitle')}
        />
      </div>

      <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-6 md:p-12 bg-slate-900 min-h-screen relative">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />
              {t('auth.forgotPassword.backToLogin', 'Back to login')}
            </Link>
            <div className="lg:hidden">
              <Logo size="sm" showText={false} />
            </div>
          </div>

          <PhoneMockup>
            <div className="flex-1 flex flex-col justify-center py-6">
              <div className="text-center mb-6">
                <Logo size="sm" showText={false} className="justify-center mb-3 scale-95" />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                  {t('auth.forgotPassword.title', 'Forgot your password?')}
                </h1>
                <p className="text-sm text-slate-400 mt-2 font-medium max-w-xs mx-auto">
                  {t('auth.forgotPassword.subtitle', "Enter your email and we'll send you a reset link.")}
                </p>
              </div>

              {sent ? (
                <div className="px-1">
                  <Alert type="success" animated={true} title={t('auth.forgotPassword.success', 'If an account exists with this email, a reset link has been sent.')} />
                  <div className="mt-6 text-center">
                    <Link
                      to="/login"
                      className="text-xs font-bold text-primary hover:text-accent transition-colors"
                    >
                      {t('auth.forgotPassword.backToLogin', 'Back to login')}
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label={t('auth.forgotPassword.emailPlaceholder', 'Enter your email')}
                    name="email"
                    type="email"
                    placeholder={t('auth.forgotPassword.emailPlaceholder', 'Enter your email')}
                    icon={Mail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder-slate-500 [&_input]:focus:ring-primary/40 [&_input]:focus:border-primary/80 [&_label]:text-slate-300 [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-widest"
                  />

                  <Button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-accent text-white font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:opacity-95 hover:shadow-xl transition-all"
                    size="md"
                    icon={Send}
                    isLoading={loading}
                  >
                    {t('auth.forgotPassword.submit', 'Send reset link')}
                  </Button>
                </form>
              )}
            </div>
          </PhoneMockup>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
