import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-800 p-1 flex items-center transition-colors duration-500 focus:outline-none shadow-inner ltr"
      style={{ direction: 'ltr' }}
      aria-label={t('theme.toggle')}
    >
      <motion.div
        className="absolute w-5 h-5 rounded-full bg-white dark:bg-emerald-500 shadow-md flex items-center justify-center overflow-hidden"
        initial={false}
        animate={{
          x: isDarkMode ? 28 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDarkMode ? (
            <motion.div
              key="moon"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-3 h-3 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-3 h-3 text-amber-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <div className="flex justify-between w-full px-1 z-0 opacity-40">
        <Sun className="w-3 h-3 text-slate-400" />
        <Moon className="w-3 h-3 text-slate-600" />
      </div>
    </button>
  );
};

export default ThemeToggle;
