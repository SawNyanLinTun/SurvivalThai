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
    primary: 'bg-primary-600 text-on-primary shadow-sm hover:bg-primary-700 hover:shadow-lift focus-visible:ring-primary-200',
    accent: 'bg-accent-400 text-on-accent shadow-sm hover:bg-accent-500 focus-visible:ring-accent-200',
    secondary: 'bg-primary-50 text-primary-700 hover:bg-primary-100 focus-visible:ring-primary-200',
    tertiary: 'border-2 border-primary-200 bg-surface text-primary-700 hover:border-primary-400 hover:bg-primary-50 focus-visible:ring-primary-100',
    ghost: 'text-ink-muted hover:bg-primary-50 hover:text-primary-700 focus-visible:ring-primary-100',
    danger: 'bg-highlight-500 text-on-highlight hover:bg-highlight-600 focus-visible:ring-highlight-100',
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
