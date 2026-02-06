export default function Section({
  id,
  children,
  className = '',
  dark = false,
  gradient = false,
  fullWidth = false,
}) {
  const bgClasses = dark
    ? 'bg-dark text-white'
    : gradient
      ? 'bg-gradient-to-b from-surface/60 to-white'
      : '';

  return (
    <section
      id={id}
      className={`py-16 sm:py-20 md:py-28 ${bgClasses} ${className}`.trim()}
    >
      {fullWidth ? children : (
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-10">
          {children}
        </div>
      )}
    </section>
  );
}
