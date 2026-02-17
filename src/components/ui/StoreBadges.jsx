import { APP_STORE_URL, GOOGLE_PLAY_URL } from '../../constants/links';

export default function StoreBadges({ className = '', variant = 'light' }) {
  const isDark = variant === 'dark';

  const linkClass = isDark
    ? 'bg-white/5 hover:bg-white/10 border-white/10'
    : 'bg-white/15 hover:bg-white/25 border-white/20';

  const subtitleClass = isDark ? 'text-gray-400' : 'text-white/70';
  const titleClass = isDark ? 'text-white' : 'text-white';

  return (
    <div className={`flex flex-wrap gap-3 sm:gap-4 ${className}`}>
      {/* App Store */}
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-3 border rounded-xl px-5 py-3 transition-all duration-200 hover:scale-105 hover:shadow-lg ${linkClass}`}
      >
        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        <div className="text-left">
          <div className={`text-[10px] leading-none ${subtitleClass}`}>Download on the</div>
          <div className={`text-lg font-semibold leading-tight ${titleClass}`}>App Store</div>
        </div>
      </a>

      {/* Google Play */}
      <a
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-3 border rounded-xl px-5 py-3 transition-all duration-200 hover:scale-105 hover:shadow-lg ${linkClass}`}
      >
        <svg className="w-7 h-7" viewBox="0 0 30 30">
          <path fill="#00C3FF" d="M2.2 2.43a2 2 0 00-.45 1.36v22.42a2 2 0 00.45 1.36L2.3 27.5l12.48-12.5V14.72L2.3 2.5z" />
          <path fill="#FFCE00" d="M19.14 19.36l-4.36-4.36v-.28L19.14 10.36l.1.06 5.17 2.93c1.47.84 1.47 2.2 0 3.04l-5.17 2.93z" />
          <path fill="#FF3A44" d="M19.24 19.3l-4.46-4.3L2.2 27.57a1.66 1.66 0 002.13.06L19.24 19.3" />
          <path fill="#00E66F" d="M19.24 10.42L4.33 2.1A1.66 1.66 0 002.2 2.16L14.78 15z" />
        </svg>
        <div className="text-left">
          <div className={`text-[10px] leading-none tracking-wider uppercase ${subtitleClass}`}>Get it on</div>
          <div className={`text-lg font-semibold leading-tight ${titleClass}`}>Google Play</div>
        </div>
      </a>
    </div>
  );
}
