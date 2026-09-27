export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]';

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5',
    lg: 'px-6 py-3.5 text-lg',
  };

  const variants = {
    primary: 'bg-orchid-600 text-white shadow-sm hover:bg-orchid-700 hover:shadow-lift focus-visible:ring-orchid-200',
    accent: 'bg-marigold-400 text-ink shadow-sm hover:bg-marigold-500 focus-visible:ring-marigold-200',
    secondary: 'bg-orchid-50 text-orchid-700 hover:bg-orchid-100 focus-visible:ring-orchid-200',
    tertiary: 'border-2 border-orchid-200 bg-white text-orchid-700 hover:border-orchid-400 hover:bg-orchid-50 focus-visible:ring-orchid-100',
    ghost: 'text-ink-muted hover:bg-orchid-50 hover:text-orchid-700 focus-visible:ring-orchid-100',
    danger: 'bg-coral-500 text-white hover:bg-coral-600 focus-visible:ring-coral-100',
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
