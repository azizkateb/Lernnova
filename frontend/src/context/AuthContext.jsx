import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/authApi';
import toast from 'react-hot-toast';
import { translations } from '../i18n/translations';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const data = await getMe();
          setUser(data.user || data);
        } catch (error) {
          console.error('Auth check failed', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const t = (path, fallback, vars) => {
    const language = localStorage.getItem('language') || 'en';
    const keys = path.split('.');
    let value = translations[language];
    for (const key of keys) {
      value = value?.[key];
    }
    let out = value ?? fallback ?? path;
    if (vars && typeof out === 'string') {
      for (const [k, v] of Object.entries(vars)) {
        out = out.replaceAll(`{{${k}}}`, String(v));
      }
    }
    return out;
  };

  const loginUser = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    const greeting = userData?.name
      ? t(
          'auth.toasts.loginWithName',
          'Welcome back, {{name}}! It is wonderful to have you with us again.',
          { name: userData.name }
        )
      : t(
          'auth.toasts.loginGeneric',
          'Authentication authorized! Welcome back to your workspace.'
        );
    toast.success(greeting);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success(
      t(
        'auth.toasts.logout',
        'You have been securely signed out. Have a productive and wonderful day!'
      )
    );
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const value = {
    user,
    token,
    loading,
    loginUser,
    logoutUser,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller',
    isBuyer: user?.role === 'buyer',
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
