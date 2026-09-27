const tones = {
  orchid: 'bg-orchid-50 text-orchid-700 ring-orchid-200',
  marigold: 'bg-marigold-100 text-marigold-700 ring-marigold-200',
  coral: 'bg-coral-100 text-coral-700 ring-coral-400/30',
  mint: 'bg-mint-100 text-mint-700 ring-mint-500/30',
  neutral: 'bg-gray-100 text-ink-muted ring-gray-200',
};

export default function Badge({ children, tone = 'orchid', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
