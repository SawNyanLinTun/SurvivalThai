import Icon from '../Icon';

export default function IconButton({ icon, label, onClick, disabled, tone = 'default' }) {
  const tones = {
    default: 'text-ink-muted hover:bg-primary-50 hover:text-primary-700',
    danger: 'text-ink-muted hover:bg-highlight-100 hover:text-highlight-700',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${tones[tone]}`}
    >
      <Icon name={icon} className="h-4 w-4" />
    </button>
  );
}
