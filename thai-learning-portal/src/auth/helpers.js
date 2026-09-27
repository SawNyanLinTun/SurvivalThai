export const ROLES = ['student', 'teacher'];

const HOME = { student: '/dashboard', teacher: '/teacher' };

export function homeFor(role) {
  return HOME[role] || '/';
}

export function displayName(profile) {
  return profile?.full_name || profile?.email?.split('@')[0] || '';
}

// Stable id for this browser, used for the 2-device limit.
export function deviceId() {
  try {
    let id = localStorage.getItem('device_id');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('device_id', id);
    }
    return id;
  } catch {
    return `session-${Date.now()}`;
  }
}

export function deviceLabel() {
  const ua = navigator.userAgent;
  const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iPhone/iPad' : /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'Mac' : 'Other';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : 'Browser';
  return `${os} · ${browser}`;
}
