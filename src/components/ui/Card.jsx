export default function Card({ children, className = '', hover = false, gradientBorder = false }) {
  if (gradientBorder) {
    return (
      <div
        className={`relative rounded-2xl p-[1px] bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 hover:from-primary/50 hover:via-accent/50 hover:to-primary/50 transition-all duration-300 ${
          hover ? 'hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1' : ''
        } ${className}`.trim()}
      >
        <div className="bg-white rounded-2xl p-6 h-full">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-all duration-300 ${
        hover
          ? 'hover:shadow-lg hover:shadow-indigo-100 hover:-translate-y-1'
          : 'hover:-translate-y-0.5 hover:shadow-md'
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}
