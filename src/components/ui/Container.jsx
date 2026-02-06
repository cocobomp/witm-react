export default function Container({
  children,
  className = '',
  as: Tag = 'div',
  narrow = false,
}) {
  const maxWidth = narrow ? 'max-w-[840px]' : 'max-w-[1200px]';

  return (
    <Tag className={`${maxWidth} mx-auto px-5 sm:px-8 lg:px-10 ${className}`.trim()}>
      {children}
    </Tag>
  );
}
