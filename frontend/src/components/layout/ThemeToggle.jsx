import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <label
      className="theme-switch"
      aria-label={isDarkMode ? t('theme.switchToLight', 'Switch to light mode') : t('theme.switchToDark', 'Switch to dark mode')}
    >
      <input
        type="checkbox"
        className="theme-switch-input"
        checked={isDarkMode}
        onChange={toggleTheme}
      />
      <svg
        className="theme-switch-svg"
        viewBox="0 0 69.667 44"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <g transform="translate(3.5 3.5)">
          <rect
            className="theme-switch-container"
            x="0"
            y="0"
            rx="17.5"
            height="35"
            width="60.667"
            fill="#83cbd8"
          />

          <g className="theme-switch-button" transform="translate(2.333 2.333)">
            <g className="theme-switch-sun">
              <circle
                className="theme-switch-sun-outer"
                r="15.167"
                cy="15.167"
                cx="15.167"
                fill="#f8e664"
              />
              <circle
                className="theme-switch-sun-middle"
                r="11.667"
                cy="15.167"
                cx="15.167"
                fill="rgba(246,254,247,0.29)"
              />
              <circle
                className="theme-switch-sun-inner"
                r="7"
                cy="15.167"
                cx="15.167"
                fill="#fcf4b9"
              />
            </g>

            <g className="theme-switch-moon">
              <circle
                className="theme-switch-moon-body"
                r="15.167"
                cy="15.167"
                cx="15.167"
                fill="#cce6ee"
              />

              <g className="theme-switch-patches" fill="#a6cad0">
                <circle cx="19" cy="7" r="2" />
                <circle cx="15" cy="20" r="2" />
                <circle cx="9" cy="11" r="1" />
                <circle cx="26" cy="22" r="1" />
                <circle cx="9" cy="25" r="1" />
                <circle cx="25" cy="13" r="1.5" />
              </g>
            </g>
          </g>

          <path
            className="theme-switch-cloud"
            fill="#fff"
            d="M46.34,12.875a4.463,4.463,0,0,1,2.243.62.95.95,0,0,1,.72-1.281,4.852,4.852,0,0,1,2.623.519c.034.02-.5-1.968.281-2.716a2.117,2.117,0,0,1,2.829-.274,1.821,1.821,0,0,1,.854,1.858c.063.037,2.594-.049,3.285,1.273s-.865,2.544-.807,2.626a12.192,12.192,0,0,1,2.278.892c.553.448,1.106,1.992-1.62,2.927a7.742,7.742,0,0,1-3.762-.3c-1.28-.49-1.181-2.65-1.137-2.624s-1.417,2.2-2.623,2.2a4.172,4.172,0,0,1-2.394-1.206,3.825,3.825,0,0,1-2.771.774c-3.429-.46-2.333-3.267-2.2-3.55A3.721,3.721,0,0,1,46.34,12.875Z"
          />

          <g className="theme-switch-stars" fill="#def8ff">
            <path d="M6 7l.5 1.1 1.2.1-.9.8.3 1.2-1.1-.6-1 .6.2-1.2-.9-.8 1.2-.1z" />
            <path d="M16 4l.4.9 1 .1-.8.7.3 1-1-.5-.9.5.2-1-.7-.7 1-.1z" />
            <path d="M12 20l.5 1.2 1.3.1-1 .8.3 1.3-1.1-.7-1.1.7.3-1.3-1-.8 1.3-.1z" />
            <path d="M25 27l.4.9 1 .1-.7.7.2 1-.9-.5-.9.5.2-1-.7-.7 1-.1z" />
            <path d="M7 28l.5 1.2 1.2.1-.9.8.3 1.2-1.1-.6-1 .6.2-1.2-.9-.8 1.2-.1z" />
            <path d="M23 14l.5 1.1 1.2.1-.9.8.3 1.2-1.1-.6-1 .6.2-1.2-.9-.8 1.2-.1z" />
          </g>
        </g>
      </svg>
    </label>
  );
};

export default ThemeToggle;
