import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { homeFor } from '../auth/helpers';
import Spinner from './Spinner';

export default function ProtectedRoute({ role, children }) {
  const { profile, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) return <Spinner label={t('common.loading')} />;
  if (!profile) return <Navigate to="/" replace />;

  // Logged in with the other role: send them to their own dashboard
  if (role && profile.role !== role) {
    return <Navigate to={homeFor(profile.role)} replace />;
  }

  return children;
}
