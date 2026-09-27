import { useState } from 'react';

export default function Input({
  label,
  error,
  required = false,
  type = 'text',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-dark-text font-medium mb-2">
          {label}
          {required && <span className="text-thai-red">*</span>}
        </label>
      )}
      <input
        type={type}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full px-4 py-2 rounded-lg border-2 transition-all duration-200
          ${isFocused ? 'border-thai-blue shadow-md' : 'border-gray-300'}
          ${error ? 'border-thai-red' : ''}
          focus:outline-none
        `}
        {...props}
      />
      {error && (
        <p className="text-thai-red text-sm mt-1">{error}</p>
      )}
    </div>
  );
}
