const baseStyles =
  'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 cursor-pointer';

const variants = {
  primary:
    'text-white bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.03] shadow-lg shadow-primary/25',
  secondary:
    'border-2 border-primary text-primary hover:bg-primary hover:text-white hover:scale-[1.03]',
  ghost:
    'text-primary hover:bg-primary/10 hover:scale-[1.02]',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  href,
  onClick,
  className = '',
  disabled = false,
  ...rest
}) {
  const classes = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${disabled ? disabledStyles : ''} ${className}`.trim();

  // Handle smooth scrolling for anchor links
  const handleClick = (e) => {
    if (href?.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    if (onClick) onClick(e);
  };

  if (href && !disabled) {
    const isExternal = href.startsWith('http') || href.startsWith('mailto:');
    return (
      <a
        href={href}
        className={classes}
        onClick={href.startsWith('#') ? handleClick : undefined}
        {...(isExternal && !href.startsWith('mailto:') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
