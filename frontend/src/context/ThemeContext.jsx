import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const isThemeTransitioningRef = useRef(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback((event) => {
    const nextIsDark = !isDarkMode;
    const nextTheme = nextIsDark ? 'dark' : 'light';
    const root = window.document.documentElement;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isThemeTransitioningRef.current) return;

    const apply = () => {
      if (nextIsDark) root.classList.add('dark');
      else root.classList.remove('dark');
      localStorage.setItem('theme', nextTheme);
      setIsDarkMode(nextIsDark);
    };

    if (
      prefersReducedMotion ||
      typeof document.startViewTransition !== 'function' ||
      !event?.currentTarget
    ) {
      isThemeTransitioningRef.current = true;
      apply();
      window.setTimeout(() => {
        isThemeTransitioningRef.current = false;
      }, 350);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    root.style.setProperty('--theme-vt-x', `${x}px`);
    root.style.setProperty('--theme-vt-y', `${y}px`);

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    root.style.setProperty('--theme-vt-radius', `${endRadius}px`);
    root.dataset.themeTransition = nextTheme;

    isThemeTransitioningRef.current = true;
    const transition = document.startViewTransition(() => apply());

    window.setTimeout(() => {
      isThemeTransitioningRef.current = false;
    }, 800);

    transition.finished.finally(() => {
      root.removeAttribute('data-theme-transition');
      root.style.removeProperty('--theme-vt-x');
      root.style.removeProperty('--theme-vt-y');
      root.style.removeProperty('--theme-vt-radius');
      isThemeTransitioningRef.current = false;
    });
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
