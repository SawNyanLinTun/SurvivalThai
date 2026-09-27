import Icon from './Icon';

export default function EmptyState({ icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-primary-100 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
        <Icon name={icon} className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-ink-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
