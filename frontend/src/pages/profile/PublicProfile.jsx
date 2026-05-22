import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, UserX } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getPublicProfile } from '../../api/profileApi';
import ProfileHeader from '../../components/profile/ProfileHeader';
import PublicProfileStats from '../../components/profile/PublicProfileStats';
import Button from '../../components/common/Button';
import SpeederLoader from '../../components/common/SpeederLoader';

const PublicProfile = () => {
  const { id } = useParams();
  const { t, isRTL } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const result = await getPublicProfile(id);
        setData(result);
        setError(false);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <SpeederLoader label={t('common.loading', 'Loading...')} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-3xl flex items-center justify-center mb-8">
           <UserX className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Profile Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-12 font-medium">The profile you are looking for might have been moved or deleted.</p>
        <Link to="/">
          <Button variant="outline" icon={ArrowLeft}>Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className="mb-12 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary font-bold text-sm transition-colors group">
          <ArrowLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${isRTL ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
          {t('nav.home')}
        </Link>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('profile.publicProfile')}</p>
      </div>

      <div className="space-y-12">
        <ProfileHeader profile={data.profile} isPublic={true} />
        
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 tracking-tight px-4 border-l-4 border-primary inline-block uppercase tracking-widest text-sm">Talent Overview</h2>
          <PublicProfileStats stats={data.stats} />
        </div>
        
        {/* Placeholder for services or products if they want to see them in future */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
           <p className="text-slate-400 dark:text-slate-500 font-medium italic">Detailed catalog of services and products coming soon to this profile view.</p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
