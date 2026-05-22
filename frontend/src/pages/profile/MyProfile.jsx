import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Award, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile, updateMyProfile, uploadAvatar } from '../../api/profileApi';
import AvatarUploader from '../../components/profile/AvatarUploader';
import ProfileHeader from '../../components/profile/ProfileHeader';
import Input from '../../components/common/Input';
import SpeederLoader from '../../components/common/SpeederLoader';
import toast from 'react-hot-toast';

const MyProfile = () => {
  const { t, isRTL } = useLanguage();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    bio: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data.profile);
      setFormData({
        name: data.profile.name || '',
        headline: data.profile.headline || '',
        bio: data.profile.bio || ''
      });
    } catch (error) {
      console.error(error);
      toast.error(t('profile.messages.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'headline' && value.length > 150) return;
    if (name === 'bio' && value.length > 2000) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.name.length < 2) {
      toast.error(t('profile.messages.invalidName', 'Invalid profile name. Please provide your full name (minimum of 2 characters).'));
      return;
    }

    try {
      setSaving(true);
      const response = await updateMyProfile(formData);
      setProfile(response.profile);
      if (updateUser) updateUser(response.profile);
      toast.success(t('profile.messages.updated'));
    } catch (error) {
      console.error(error);
      toast.error(t('profile.messages.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      setUploading(true);
      const response = await uploadAvatar(file);
      setProfile(response.user);
      if (updateUser) updateUser(response.user);
      toast.success(t('profile.messages.avatarUpdated'));
    } catch (error) {
      console.error(error);
      const serverMessage = error?.response?.data?.message;
      toast.error(serverMessage || t('profile.messages.avatarError'));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <SpeederLoader label={t('common.loading', 'Loading...')} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className="mb-12">
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{t('profile.myProfile')}</p>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('profile.editProfile')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center">
            <AvatarUploader 
              avatarUrl={profile?.avatar_url} 
              name={profile?.name || profile?.username} 
              onUpload={handleAvatarUpload}
              loading={uploading}
            />
            
            <div className="mt-8 text-center w-full">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{profile?.name}</h2>
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                  {t(`profile.roles.${(profile?.role || '').toLowerCase()}`, profile?.role)}
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-slate-700/50">
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="truncate">{profile?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>{profile?.is_active ? t('profile.accountActive', 'Account Active') : t('profile.accountInactive', 'Account Inactive')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-black/60 border border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSubmit} className="space-y-8">
              <Input
                label={t('profile.nameLabel')}
                name="name"
                placeholder={t('profile.placeholders.name', 'Full Name')}
                icon={User}
                value={formData.name}
                onChange={handleChange}
                required
              />

              <div className="space-y-2">
                <Input
                  label={t('profile.headlineLabel')}
                  name="headline"
                  placeholder={t('profile.placeholders.headline')}
                  icon={Award}
                  value={formData.headline}
                  onChange={handleChange}
                />
                <div className="flex justify-end">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     {formData.headline.length} / 150
                   </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
                  {t('profile.bioLabel')}
                </label>
                <div className="relative group">
                  <textarea
                    name="bio"
                    rows="6"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-3xl p-6 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-primary/50 transition-all resize-none font-medium"
                    placeholder={t('profile.placeholders.bio')}
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex justify-end">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     {formData.bio.length} / 2000
                   </span>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`profile-save-button flex-1 ${saving ? 'profile-save-button-loading' : ''}`}
                >
                  <div className="profile-save-svg-wrapper-1">
                    <div className="profile-save-svg-wrapper">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="30"
                        height="30"
                        className="profile-save-button-icon"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M22,15.04C22,17.23 20.24,19 18.07,19H5.93C3.76,19 2,17.23 2,15.04C2,13.07 3.43,11.44 5.31,11.14C5.28,11 5.27,10.86 5.27,10.71C5.27,9.33 6.38,8.2 7.76,8.2C8.37,8.2 8.94,8.43 9.37,8.8C10.14,7.05 11.13,5.44 13.91,5.44C17.28,5.44 18.87,8.06 18.87,10.83C18.87,10.94 18.87,11.06 18.86,11.17C20.65,11.54 22,13.13 22,15.04Z" />
                      </svg>
                    </div>
                  </div>
                  <span className="profile-save-button-text">
                    {saving ? t('profile.saving', 'Saving...') : t('profile.saveChanges', 'Save Changes')}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => fetchProfile()}
                  disabled={saving}
                  className="profile-cancel-button flex-1"
                >
                  <span className="profile-cancel-overlay" aria-hidden="true" />
                  <span className="profile-cancel-highlight" aria-hidden="true" />
                  <span className="profile-cancel-content">
                    <svg
                      className="profile-cancel-icon"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    {t('profile.cancel', 'Cancel')}
                  </span>
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-12">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8 px-4">{t('profile.previewPresentation', 'Preview Profile Presentation')}</h3>
            <ProfileHeader profile={{ ...profile, ...formData }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
