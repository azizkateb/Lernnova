import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ArrowLeft, ShieldCheck, Briefcase, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { register as registerApi } from '../../api/authApi';
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

const Register = () => {
  const { t, isRTL } = useLanguage();
  const [userData, setUserData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'buyer' 
  });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

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
      const data = await registerApi(userData);
      loginUser(data.token, data.user);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.register.errorFallback'));
    } finally {
      setLoading(false);
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
      <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-6 md:p-12 bg-slate-900 min-h-screen relative">
        {/* Dynamic decorative backdrop shapes */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
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
            <div className="flex-1 flex flex-col justify-center py-4">
              {/* App Welcome Badge */}
              <div className="text-center mb-5">
                <Logo size="sm" showText={false} className="justify-center mb-2.5 scale-90" />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                  {t('auth.register.button')}
                </h1>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto font-medium">
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
                
                <Input
                  label={t('auth.register.passwordLabel')}
                  name="password"
                  type="password"
                  placeholder={t('auth.register.passwordPlaceholder')}
                  icon={Lock}
                  value={userData.password}
                  onChange={handleChange}
                  required
                  className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder-slate-500 [&_input]:focus:ring-primary/40 [&_input]:focus:border-primary/80 [&_label]:text-slate-300 [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-widest"
                />
                
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
                <p className="text-xs font-semibold text-slate-400">
                  {t('auth.register.hasAccount')}{' '}
                  <Link 
                    to="/login" 
                    className="text-primary hover:text-accent font-bold hover:underline underline-offset-4 transition-colors"
                  >
                    {t('auth.register.loginLink')}
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

export default Register;
