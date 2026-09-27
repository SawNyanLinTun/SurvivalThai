import { Navigate } from 'react-router-dom';
import { getUser, homeFor } from '../auth';

export default function ProtectedRoute({ role, children }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Logged in with the other role: send them to their own dashboard
  if (role && user.role !== role) {
    return <Navigate to={homeFor(user.role)} replace />;
  }

  return children;
}
