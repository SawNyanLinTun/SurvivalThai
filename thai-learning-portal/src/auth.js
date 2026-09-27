// Demo authentication stored in localStorage. Replace with a real backend
// (JWT/session) before production — this does not check passwords.

export const ROLES = ['student', 'teacher'];

const HOME = { student: '/dashboard', teacher: '/teacher' };

export function getUser() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user?.email) return null;
    // Sessions saved before roles existed are treated as students
    return { email: user.email, role: ROLES.includes(user.role) ? user.role : 'student' };
  } catch {
    return null;
  }
}

export function login({ email, role }) {
  // Never persist the password
  localStorage.setItem('user', JSON.stringify({ email, role }));
}

export function logout() {
  localStorage.removeItem('user');
}

export function homeFor(role) {
  return HOME[role] || '/';
}

export function displayName(user) {
  return user?.email?.split('@')[0] || '';
}
