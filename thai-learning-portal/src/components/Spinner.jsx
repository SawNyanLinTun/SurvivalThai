export default function Spinner({ label }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink-muted" role="status">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
