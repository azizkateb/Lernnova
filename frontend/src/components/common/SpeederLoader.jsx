import React from 'react';

export default function SpeederLoader({ label, fullScreen = false, className = '' }) {
  return (
    <div
      className={
        fullScreen
          ? `speeder-loader-screen ${className}`.trim()
          : `speeder-loader-wrap ${className}`.trim()
      }
      role="status"
      aria-live="polite"
      aria-label={label || 'Loading'}
    >
      <div className="lern-speeder-loader" aria-hidden="true">
        <span>
          <span />
          <span />
          <span />
          <span />
        </span>
        <div className="lern-speeder-base">
          <span />
          <div className="lern-speeder-face" />
        </div>
      </div>

      <div className="lern-speeder-longfazers" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      {label ? (
        <p className="mt-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </p>
      ) : (
        <span className="sr-only">Loading...</span>
      )}
    </div>
  );
}
