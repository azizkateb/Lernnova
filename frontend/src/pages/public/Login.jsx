import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../api/authApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Logo from '../../components/common/Logo';
import PhoneMockup from '../../components/auth/PhoneMockup';
import AuthHero from '../../components/auth/AuthHero';
import toast from 'react-hot-toast';
import Alert from '../../components/common/Alert';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../context/LanguageContext';
import SEO from '../../components/common/SEO';

const Login = () => {
  const { t, isRTL } = useLanguage();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginApi(credentials);
      loginUser(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.login.errorFallback'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-900 overflow-x-hidden font-sans" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <SEO 
        title={t('pages.login.seoTitle', 'Secure Account Login')}
        description={t(
          'pages.login.seoDesc',
          'Sign in to your Lernnova dashboard safely to manage purchased digital resources, downloadable assets, active freelance sessions, and payment preferences.'
        )}
      />
      
      {/* Cinematic Brand Hero (Left 5 Columns) */}
      <div className="hidden lg:block lg:col-span-5 relative min-h-screen h-full">
        <AuthHero 
          backgroundImage="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"
          title={t('auth.login.title')}
          subtitle={t('auth.login.subtitle')}
        />
      </div>

      {/* Interactive Smartphone Mockup Display (Right 7 Columns) */}
      <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-6 md:p-12 bg-slate-900 min-h-screen relative">
        {/* Dynamic decorative backdrop shapes */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10 flex flex-col">
          {/* Header navigation bar */}
          <div className="flex items-center justify-between mb-8">
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
            <div className="flex-1 flex flex-col justify-center py-6">
              {/* App Welcome Badge */}
              <div className="text-center mb-6">
                <Logo size="sm" showText={false} className="justify-center mb-3 scale-95" />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                  {t('auth.login.button')}
                </h1>
                <p className="text-xs text-slate-400 mt-2 font-medium max-w-xs mx-auto">
                  {t('pages.login.subtitle', 'Access your Lernnova workspace.')}
                </p>
              </div>

              {/* Premium Inline Sandbox Alert Banner */}
              <div className="mb-6 px-1">
                <Alert type="info" animated={true} title={t('auth.login.sandboxTitle')}>
                  {t('auth.login.sandboxDesc')}
                </Alert>
              </div>

              {/* Real form handler */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={t('auth.login.emailLabel')}
                  name="email"
                  type="email"
                  placeholder={t('auth.login.emailPlaceholder')}
                  icon={Mail}
                  value={credentials.email}
                  onChange={handleChange}
                  required
                  className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder-slate-500 [&_input]:focus:ring-primary/40 [&_input]:focus:border-primary/80 [&_label]:text-slate-300 [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-widest"
                />
                
                <Input
                  label={t('auth.login.passwordLabel')}
                  name="password"
                  type="password"
                  placeholder={t('auth.login.passwordPlaceholder')}
                  icon={Lock}
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder-slate-500 [&_input]:focus:ring-primary/40 [&_input]:focus:border-primary/80 [&_label]:text-slate-300 [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-widest"
                />
                
                <div className="flex items-center justify-between py-1.5 select-none">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-white/10 bg-white/5 text-primary focus:ring-offset-slate-900 focus:ring-primary transition-all w-3.5 h-3.5" 
                    />
                    <span className="text-[10px] font-bold text-slate-400">{t('auth.login.rememberMe')}</span>
                  </label>
                  
                  <Link 
                    to="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      toast.success(t('auth.login.resetToast'));
                    }} 
                    className="text-[10px] font-bold text-primary hover:text-accent transition-colors"
                  >
                    {t('auth.login.forgotPassword')}
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-accent text-white font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:opacity-95 hover:shadow-xl transition-all"
                  size="md"
                  icon={LogIn}
                  isLoading={loading}
                >
                  {t('auth.login.button')}
                </Button>
              </form>

              {/* Account conversion section */}
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-xs font-semibold text-slate-400">
                  {t('auth.login.noAccount')}{' '}
                  <Link 
                    to="/register" 
                    className="text-primary hover:text-accent font-bold hover:underline underline-offset-4 transition-colors"
                  >
                    {t('auth.login.registerLink')}
                  </Link>
                </p>
              </div>
            </div>
          </PhoneMockup>
        </div>
      </div>

    </div>
  );
};

export default Login;
