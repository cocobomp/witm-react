import { useTheme } from '../../contexts/ThemeContext';

// Sticker logotype of the 3.5 brand (spec 3.5 §3.1): letters as outlined
// paths, a light and a dark cut. The slogan stays real text next to it.
const LOGO_VARIANTS = {
  compact: { file: 'witm-logo-compact', width: 90.457, height: 29.698 },
  large: { file: 'witm-logo', width: 192.825, height: 62.031 },
};

const LIGHT_THEME = 'minimal';

/**
 * @param {'compact'|'large'} size  compact for bars, large for hero spots
 * @param {'auto'|'light'|'dark'} tone  auto follows the site theme
 */
export default function BrandLogo({ size = 'compact', tone = 'auto', className = '', loading }) {
  const { theme } = useTheme();
  const variant = LOGO_VARIANTS[size];
  const isDark = tone === 'auto' ? theme !== LIGHT_THEME : tone === 'dark';

  return (
    <img
      src={`/img/brand/${variant.file}-${isDark ? 'dark' : 'light'}.svg`}
      alt="WITM"
      width={variant.width}
      height={variant.height}
      loading={loading}
      className={`w-auto select-none ${className}`}
      draggable="false"
    />
  );
}
