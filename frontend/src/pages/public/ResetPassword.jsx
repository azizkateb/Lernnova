import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { resetPassword as resetPasswordApi } from '../../api/authApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Logo from '../../components/common/Logo';
import PhoneMockup from '../../components/auth/PhoneMockup';
import AuthHero from '../../components/auth/AuthHero';
import Alert from '../../components/common/Alert';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../context/LanguageContext';
import SEO from '../../components/common/SEO';

const ResetPassword = () => {
  const { t, isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.resetPassword.passwordMismatch', 'Passwords do not match.'));
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || t('auth.resetPassword.invalidToken', 'This reset link is invalid or has expired.'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-900 overflow-x-hidden font-sans" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        <div className="col-span-12 flex flex-col items-center justify-center p-6 md:p-12 bg-slate-900 min-h-screen relative">
          <div className="w-full max-w-md text-center">
            <h1 className="text-2xl font-bold text-white mb-4">{t('auth.resetPassword.invalidToken', 'This reset link is invalid or has expired.')}</h1>
            <p className="text-slate-400 mb-6">{t('auth.resetPassword.subtitle', 'Enter a new password for your account.')}</p>
            <Link to="/forgot-password" className="text-primary hover:text-accent font-bold text-sm">
              {t('auth.forgotPassword.title', 'Forgot your password?')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-900 overflow-x-hidden font-sans" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <SEO
        title={t('auth.resetPassword.title', 'Reset your password')}
      />

      <div className="hidden lg:block lg:col-span-5 relative min-h-screen h-full">
        <AuthHero
          backgroundImage="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"
          title={t('auth.resetPassword.title')}
          subtitle={t('auth.resetPassword.subtitle')}
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
              {t('common.back', 'Back')}
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
                  {t('auth.resetPassword.title', 'Reset your password')}
                </h1>
                <p className="text-sm text-slate-400 mt-2 font-medium max-w-xs mx-auto">
                  {t('auth.resetPassword.subtitle', 'Enter a new password for your account.')}
                </p>
              </div>

              {success ? (
                <div className="px-1">
                  <Alert type="success" animated={true} title={t('auth.resetPassword.success', 'Your password has been reset. You can now log in.')} />
                  <div className="mt-6 text-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-accent text-white font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:opacity-95 hover:shadow-xl transition-all px-8 py-3"
                    >
                      {t('auth.login.button', 'Sign In')}
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert type="error" animated={true} title={error} />
                  )}

                  <Input
                    label={t('auth.resetPassword.newPassword', 'New password')}
                    name="password"
                    type="password"
                    placeholder={t('auth.resetPassword.newPassword', 'New password')}
                    icon={Lock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder-slate-500 [&_input]:focus:ring-primary/40 [&_input]:focus:border-primary/80 [&_label]:text-slate-300 [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-widest"
                  />

                  <Input
                    label={t('auth.resetPassword.confirmPassword', 'Confirm password')}
                    name="confirmPassword"
                    type="password"
                    placeholder={t('auth.resetPassword.confirmPassword', 'Confirm password')}
                    icon={Lock}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder-slate-500 [&_input]:focus:ring-primary/40 [&_input]:focus:border-primary/80 [&_label]:text-slate-300 [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-widest"
                  />

                  <Button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-accent text-white font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:opacity-95 hover:shadow-xl transition-all"
                    size="md"
                    icon={KeyRound}
                    isLoading={loading}
                  >
                    {t('auth.resetPassword.submit', 'Reset password')}
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

export default ResetPassword;
