import React from 'react';
import { BadgeCheck, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { API_URL } from '../../utils/constants';

const ProfileHeader = ({ profile, isPublic = false }) => {
  const { t, isRTL } = useLanguage();

  const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path}`;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-lg flex-shrink-0">
          {profile?.avatar_url ? (
            <img 
              src={getFileUrl(profile.avatar_url)} 
              alt={profile.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-serif italic text-emerald-600 dark:text-emerald-400">
              {getInitials(profile?.name || profile?.username)}
            </div>
          )}
        </div>

        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {profile?.name || profile?.username}
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
              <BadgeCheck className="w-3 h-3" />
              {profile?.role}
            </div>
          </div>

          <p className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-4 max-w-2xl">
            {profile?.headline || (isPublic ? '' : t('profile.placeholders.headline'))}
          </p>

          <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {t('profile.stats.memberSince')} {formatDate(profile?.created_at)}
            </div>
          </div>
        </div>
      </div>

      {profile?.bio && (
        <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-700/50">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl italic font-serif text-lg">
            "{profile.bio}"
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
