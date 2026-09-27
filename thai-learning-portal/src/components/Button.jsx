export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-thai-blue text-white hover:bg-blue-700 focus:ring-thai-blue',
    secondary: 'bg-gray-200 text-dark-text hover:bg-gray-300 focus:ring-gray-400',
    tertiary: 'bg-transparent text-thai-blue border-2 border-thai-blue hover:bg-blue-50 focus:ring-thai-blue',
    danger: 'bg-thai-red text-white hover:bg-red-600 focus:ring-thai-red',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
