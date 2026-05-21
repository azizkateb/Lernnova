import React from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Palette,
  Globe,
  Shield,
  Mail,
  BadgeCheck,
  CalendarDays,
  ArrowUpRight,
  Sparkles,
  Lock,
  KeyRound,
  Sun,
  Moon,
  Languages,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from '../components/layout/ThemeToggle';
import LanguageToggle from '../components/layout/LanguageToggle';
import Avatar from '../components/common/Avatar';
import { formatDate } from '../utils/formatDate';

const SectionKicker = ({ children }) => (
  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.25em] mb-1">
    {children}
  </p>
);

const SettingsCard = ({ children, className = '' }) => (
  <div
    className={
      'relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 ' +
      'shadow-[0_2px_10px_-4px_rgba(15,23,42,0.06)] dark:shadow-[0_2px_10px_-4px_rgba(0,0,0,0.4)] ' +
      'hover:shadow-[0_18px_50px_-18px_rgba(15,23,42,0.18)] dark:hover:shadow-[0_18px_50px_-18px_rgba(0,0,0,0.6)] ' +
      'transition-shadow duration-500 overflow-hidden ' +
      className
    }
  >
    {children}
  </div>
);

const CardHeader = ({ icon: Icon, kicker, title, description }) => (
  <div className="flex items-start gap-5 mb-8">
    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div className="min-w-0 flex-1">
      {kicker && (
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-1">
          {kicker}
        </p>
      )}
      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
          {description}
        </p>
      )}
    </div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 py-4 border-b border-slate-50 dark:border-slate-800/70 last:border-0">
    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/70 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
        {value || '—'}
      </p>
    </div>
  </div>
);

const Settings = () => {
  const { user } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const { isDarkMode } = useTheme();

  const themeLabel = isDarkMode
    ? t('settings.appearance.dark', 'Dark')
    : t('settings.appearance.light', 'Light');

  const languageLabel =
    language === 'ar'
      ? t('settings.language.arabic', 'العربية')
      : t('settings.language.english', 'English');

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : t('settings.account.guest', 'Guest');

  return (
    <div
      className="max-w-6xl mx-auto px-4 py-12"
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Page Header */}
      <div className="mb-14">
        <SectionKicker>{t('settings.kicker', 'Personal Control Room')}</SectionKicker>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05]">
          {t('settings.title', 'Settings')}
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 font-medium mt-4 max-w-2xl">
          {t(
            'settings.subtitle',
            'Shape how Lernnova looks, speaks, and remembers you. Quiet controls for a focused workspace.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Settings — spans wide */}
        <SettingsCard className="lg:col-span-12 p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-center gap-6 min-w-0">
              <div className="relative shrink-0">
                <Avatar
                  src={user?.avatar_url}
                  name={user?.name || user?.username || user?.email}
                  size={88}
                  className="rounded-3xl border-2 border-white dark:border-slate-800 shadow-lg"
                  imgClassName="rounded-3xl"
                />
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900">
                  <User className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-1">
                  {t('settings.profile.kicker', 'Signed in as')}
                </p>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {user?.name || user?.username || t('settings.profile.fallbackName', 'Unnamed Member')}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <BadgeCheck className="w-3 h-3 text-primary" />
                    {roleLabel}
                  </span>
                  {user?.email && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{user.email}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Link
              to="/profile/me"
              className="group inline-flex items-center gap-3 self-start md:self-auto px-6 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-colors shadow-md"
            >
              <span>{t('settings.profile.editProfile', 'Edit profile')}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </SettingsCard>

        {/* Appearance */}
        <SettingsCard className="lg:col-span-6 p-8 md:p-10">
          <CardHeader
            icon={Palette}
            kicker={t('settings.appearance.kicker', 'Visual Mood')}
            title={t('settings.appearance.title', 'Appearance')}
            description={t(
              'settings.appearance.description',
              'Choose how the interface feels — luminous daylight or deep focus.'
            )}
          />

          <div className="rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    {t('settings.appearance.currentTheme', 'Current Theme')}
                  </p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    {themeLabel}
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div
                className={`rounded-2xl p-4 border-2 transition-all ${
                  !isDarkMode
                    ? 'border-primary bg-white shadow-sm'
                    : 'border-transparent bg-white/40 dark:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">
                    {t('settings.appearance.light', 'Light')}
                  </span>
                </div>
                <div className="h-8 rounded-lg bg-gradient-to-br from-amber-100 via-white to-slate-100" />
              </div>
              <div
                className={`rounded-2xl p-4 border-2 transition-all ${
                  isDarkMode
                    ? 'border-primary bg-slate-900 shadow-sm'
                    : 'border-transparent bg-white/40 dark:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                    {t('settings.appearance.dark', 'Dark')}
                  </span>
                </div>
                <div className="h-8 rounded-lg bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950" />
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* Language */}
        <SettingsCard className="lg:col-span-6 p-8 md:p-10">
          <CardHeader
            icon={Globe}
            kicker={t('settings.language.kicker', 'Voice & Direction')}
            title={t('settings.language.title', 'Language')}
            description={t(
              'settings.language.description',
              'Switch interface language. Layout direction adjusts automatically.'
            )}
          />

          <div className="rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                  <Languages className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    {t('settings.language.current', 'Current Language')}
                  </p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    {languageLabel}
                  </p>
                </div>
              </div>
              <LanguageToggle />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div
                className={`rounded-2xl p-4 border-2 transition-all ${
                  language === 'en'
                    ? 'border-primary bg-white dark:bg-slate-900 shadow-sm'
                    : 'border-transparent bg-white/40 dark:bg-slate-900/40'
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-1">
                  EN
                </p>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  English
                </p>
              </div>
              <div
                className={`rounded-2xl p-4 border-2 transition-all ${
                  language === 'ar'
                    ? 'border-primary bg-white dark:bg-slate-900 shadow-sm'
                    : 'border-transparent bg-white/40 dark:bg-slate-900/40'
                }`}
                style={{ direction: 'rtl' }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-1">
                  AR
                </p>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  العربية
                </p>
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* Account Info */}
        <SettingsCard className="lg:col-span-7 p-8 md:p-10">
          <CardHeader
            icon={Shield}
            kicker={t('settings.account.kicker', 'Identity Ledger')}
            title={t('settings.account.title', 'Account Information')}
            description={t(
              'settings.account.description',
              'Read-only details from your registered account.'
            )}
          />

          <div className="divide-y divide-slate-50 dark:divide-slate-800/70">
            <InfoRow
              icon={Mail}
              label={t('settings.account.email', 'Email')}
              value={user?.email}
            />
            <InfoRow
              icon={BadgeCheck}
              label={t('settings.account.role', 'Role')}
              value={roleLabel}
            />
            <InfoRow
              icon={CalendarDays}
              label={t('settings.account.memberSince', 'Member Since')}
              value={user?.created_at ? formatDate(user.created_at) : null}
            />
          </div>
        </SettingsCard>

        {/* Security Note */}
        <SettingsCard className="lg:col-span-5 p-8 md:p-10 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/40">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-[0.25em] mb-1">
                {t('settings.security.kicker', 'Coming Soon')}
              </p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('settings.security.title', 'Security')}
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {t(
              'settings.security.note',
              'Password change and two-factor authentication will be available in a future update.'
            )}
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 opacity-60">
              <KeyRound className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex-1">
                {t('settings.security.changePassword', 'Change password')}
              </span>
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                {t('settings.security.soon', 'Soon')}
              </span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 opacity-60">
              <Sparkles className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex-1">
                {t('settings.security.twoFactor', 'Two-factor authentication')}
              </span>
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                {t('settings.security.soon', 'Soon')}
              </span>
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
};

export default Settings;
