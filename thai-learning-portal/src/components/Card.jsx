export default function Card({ children, className = '', hoverable = false }) {
  return (
    <div
      className={`
        rounded-3xl border border-primary-100/70 bg-surface p-6 shadow-soft
        ${hoverable ? 'transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lift' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
