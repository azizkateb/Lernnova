import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });
  const missingKeys = React.useRef(new Set());

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    // RTL / font switching
    document.documentElement.classList.toggle('rtl', language === 'ar');
    if (language === 'ar') {
      document.documentElement.classList.add('font-arabic');
    } else {
      document.documentElement.classList.remove('font-arabic');
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => {
      // Cycle through: en -> ar -> de -> en
      if (prev === 'en') return 'ar';
      if (prev === 'ar') return 'de';
      return 'en';
    });
  };

  const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;
    if (Object.prototype.hasOwnProperty.call(obj, path)) return obj[path];
    return String(path)
      .split('.')
      .reduce((acc, part) => {
        if (acc && Object.prototype.hasOwnProperty.call(acc, part)) return acc[part];
        return undefined;
      }, obj);
  };

  const resolveKey = (lang, key) => {
    const langDict = translations?.[lang];
    if (!langDict) return undefined;
    return getNestedValue(langDict, key);
  };

  const warnMissing = (key, hasEnglishFallback) => {
    const isProd = Boolean(import.meta?.env?.PROD);
    if (isProd) return;
    if (missingKeys.current.has(key)) return;
    missingKeys.current.add(key);
    if (hasEnglishFallback) {
      console.warn(`[i18n] Missing ${language} translation: ${key}`);
    } else {
      console.warn(`[i18n] Missing translation key: ${key}`);
    }
  };

  const t = (key, fallback, vars) => {
    const value = resolveKey(language, key);
    const enValue = resolveKey('en', key);

    if (value === undefined || value === null) {
      warnMissing(key, enValue !== undefined && enValue !== null);
    }

    let out = value ?? enValue ?? fallback ?? key;
    if (vars && typeof out === 'string') {
      for (const [k, v] of Object.entries(vars)) {
        out = out.replaceAll(`{{${k}}}`, String(v));
      }
    }
    return out;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        dir: language === 'ar' ? 'rtl' : 'ltr',
        isRTL: language === 'ar',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
