import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { verifyEmail as verifyEmailApi, resendVerification } from '../../api/authApi';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import Input from '../../components/common/Input';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../context/LanguageContext';
import SEO from '../../components/common/SEO';

const VerifyEmail = () => {
  const { t, isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [resendEmail, setResendEmail] = useState('');
  const [resendSent, setResendSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('missing');
      return;
    }

    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    const verify = async () => {
      try {
        await verifyEmailApi(token);
        setStatus('success');
      } catch {
        setStatus((current) => (current === 'success' ? 'success' : 'error'));
      }
    };

    verify();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendLoading(true);
    try {
      await resendVerification(resendEmail);
      setResendSent(true);
    } catch {
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6 relative overflow-hidden" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <SEO
        title={t('auth.emailVerification.title', 'Verify your email')}
      />

      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="md" showText className="justify-center" />
        </div>

        <div className="bg-slate-950/70 border border-white/10 rounded-[2rem] p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-slate-800">
          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-slate-300 font-medium">{t('common.loading', 'Loading...')}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-white mb-2">
                {t('auth.emailVerification.success', 'Your email has been verified. You can now log in.')}
              </h1>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-accent text-white font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:opacity-95 hover:shadow-xl transition-all px-8 py-3"
              >
                {t('auth.emailVerification.backToLogin', 'Back to login')}
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-4">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-white mb-2">
                {t('auth.emailVerification.invalid', 'This verification link is invalid or has expired.')}
              </h1>
              <p className="text-sm text-slate-400 mb-6">
                {t('auth.emailVerification.resend', 'Resend verification email')}
              </p>
              {!resendSent ? (
                <form onSubmit={handleResend} className="space-y-4">
                  <Input
                    label=""
                    name="email"
                    type="email"
                    placeholder={t('auth.register.emailPlaceholder', 'Enter your email')}
                    icon={Mail}
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                    className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder-slate-500 [&_input]:focus:ring-primary/40 [&_input]:focus:border-primary/80"
                  />
                  <Button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-accent text-white font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:opacity-95 hover:shadow-xl transition-all"
                    size="md"
                    isLoading={resendLoading}
                  >
                    {t('auth.emailVerification.resend', 'Resend verification email')}
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-slate-400">
                  {t('auth.emailVerification.sent', 'If your account exists and is not verified, a new verification email has been sent.')}
                </p>
              )}
              <div className="mt-6">
                <Link
                  to="/login"
                  className="text-xs font-bold text-primary hover:text-accent transition-colors"
                >
                  {t('auth.emailVerification.backToLogin', 'Back to login')}
                </Link>
              </div>
            </div>
          )}

          {status === 'missing' && (
            <div className="text-center py-4">
              <XCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-white mb-4">
                {t('auth.emailVerification.invalid', 'This verification link is invalid or has expired.')}
              </h1>
              <Link
                to="/login"
                className="text-xs font-bold text-primary hover:text-accent transition-colors"
              >
                {t('auth.emailVerification.backToLogin', 'Back to login')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
