import { useId } from 'react';
import Icon from './Icon';

export default function Input({
  label,
  error,
  required = false,
  type = 'text',
  icon,
  ...props
}) {
  const id = useId();

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
          {label}
          {required && <span className="ml-0.5 text-coral-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-faint">
            <Icon name={icon} />
          </span>
        )}
        <input
          id={id}
          type={type}
          aria-invalid={!!error}
          className={`
            w-full rounded-xl border-2 bg-white py-3 pr-4 text-ink placeholder:text-ink-faint
            transition-all duration-200 focus:outline-none focus:ring-4
            ${icon ? 'pl-11' : 'pl-4'}
            ${error
              ? 'border-coral-400 focus:border-coral-500 focus:ring-coral-100'
              : 'border-orchid-100 hover:border-orchid-200 focus:border-orchid-500 focus:ring-orchid-100'}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm font-medium text-coral-600">{error}</p>}
    </div>
  );
}
