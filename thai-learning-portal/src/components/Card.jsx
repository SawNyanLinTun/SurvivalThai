export default function Card({ children, className = '', hoverable = false }) {
  return (
    <div
      className={`
        bg-white rounded-lg p-6 shadow-md
        ${hoverable ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
