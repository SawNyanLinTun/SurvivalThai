import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

function LoadingScreen() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      {t('common.loading')}
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { session, loading, profile, profileLoading } = useAuth();

  if (loading || (session && profileLoading)) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  if (profile?.role === 'pending') {
    return <Navigate to="/join-class" replace />;
  }

  return children;
}

export function RequireSession({ children }) {
  const { session, loading, profile, profileLoading } = useAuth();

  if (loading || (session && profileLoading)) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  if (profile && profile.role !== 'pending') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
