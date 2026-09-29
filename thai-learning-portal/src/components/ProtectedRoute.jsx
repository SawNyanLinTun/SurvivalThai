import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        {t('common.loading')}
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}
