export default function Logo({ light = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 font-thai text-xl font-bold text-accent-400 shadow-sm">
        ส
      </span>
      <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
        Survival<span className={light ? 'text-accent-400' : 'text-primary-600'}>Thai</span>
      </span>
    </div>
  );
}
