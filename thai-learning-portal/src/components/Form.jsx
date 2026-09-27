import { useId } from 'react';

const control =
  'w-full rounded-xl border-2 border-primary-100 bg-surface px-4 py-2.5 text-ink placeholder:text-ink-faint transition-all hover:border-primary-200 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100';

export function Field({ label, hint, error, required, children, id }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
          {label}
          {required && <span className="ml-0.5 text-highlight-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-sm font-medium text-highlight-600">{error}</p>}
    </div>
  );
}

export function TextField({ label, hint, error, required, className = '', ...props }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id}>
      <input id={id} aria-invalid={!!error} className={`${control} ${error ? '!border-highlight-400' : ''} ${className}`} {...props} />
    </Field>
  );
}

export function TextArea({ label, hint, error, required, rows = 3, ...props }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id}>
      <textarea id={id} rows={rows} className={`${control} resize-y`} {...props} />
    </Field>
  );
}

export function SelectField({ label, hint, options, ...props }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} id={id}>
      <select id={id} className={control} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({ label, description, checked, onChange }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block font-semibold text-ink">{label}</span>
        {description && <span className="block text-sm text-ink-muted">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 ${
          checked ? 'bg-primary-600' : 'bg-ink-faint/40'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`}
        />
      </button>
    </div>
  );
}
