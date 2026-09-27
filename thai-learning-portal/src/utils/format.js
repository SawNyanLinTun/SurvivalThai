export function localeFor(lang) {
  return lang === 'my' ? 'my-MM' : 'en-US';
}

export function formatDate(iso, lang, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!iso) return '';
  const date = iso.length === 10 ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return date.toLocaleDateString(localeFor(lang), opts);
}

export function formatTime(iso, lang) {
  return new Date(iso).toLocaleString(localeFor(lang), {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function joinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function initials(name = '') {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

export function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysUntil(iso) {
  const today = new Date(new Date().toISOString().slice(0, 10));
  return Math.round((new Date(iso) - today) / 86400000);
}
