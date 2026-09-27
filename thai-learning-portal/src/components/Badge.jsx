const tones = {
  primary: 'bg-primary-50 text-primary-700 ring-primary-200',
  accent: 'bg-accent-100 text-accent-700 ring-accent-200',
  highlight: 'bg-highlight-100 text-highlight-700 ring-highlight-400/30',
  success: 'bg-success-100 text-success-700 ring-success-500/30',
  neutral: 'bg-page text-ink-muted ring-ink-faint/30',
};

export default function Badge({ children, tone = 'primary', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
