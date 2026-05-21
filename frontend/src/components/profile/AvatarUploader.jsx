import React, { useRef, useState } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { API_URL } from '../../utils/constants';
import toast from 'react-hot-toast';

const AvatarUploader = ({ avatarUrl, name, onUpload, loading }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const maxAvatarBytes = 3 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path}`;
  };

  const currentAvatar = preview || getFileUrl(avatarUrl);

  const handleFileChange = (e) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    if (!allowedTypes.includes(file.type) || file.size > maxAvatarBytes) {
      toast.error(t('profile.messages.invalidFile'));
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    onUpload(file);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="w-32 h-32 rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/50 transition-all duration-500 group-hover:scale-[1.02]">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt={name}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.onerror = null;
                setPreview(null);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-serif italic text-emerald-600 dark:text-emerald-400">
              {getInitials(name)}
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
        
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={loading}
          className="absolute -right-2 -bottom-2 w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center transition-all active:scale-95 z-20"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      
      <p className="mt-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        {t('profile.uploadNote')}
      </p>
    </div>
  );
};

export default AvatarUploader;
