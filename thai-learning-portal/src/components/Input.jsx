import { useId } from 'react';
import Icon from './Icon';

export default function Input({
  label,
  error,
  required = false,
  type = 'text',
  icon,
  className = '',
  ...props
}) {
  const id = useId();

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
          {label}
          {required && <span className="ml-0.5 text-highlight-500">*</span>}
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
            w-full rounded-xl border-2 bg-surface py-3 pr-4 text-ink placeholder:text-ink-faint
            transition-all duration-200 focus:outline-none focus:ring-4
            ${icon ? 'pl-11' : 'pl-4'} ${className}
            ${error
              ? 'border-highlight-400 focus:border-highlight-500 focus:ring-highlight-100'
              : 'border-primary-100 hover:border-primary-200 focus:border-primary-500 focus:ring-primary-100'}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm font-medium text-highlight-600">{error}</p>}
    </div>
  );
}
