import { useAuth } from '../context/AuthContext';
import DashboardPage from './DashboardPage';
import TeacherDashboardPage from './TeacherDashboardPage';

export default function DashboardRouter() {
  const { profile } = useAuth();

  if (profile?.role === 'teacher') {
    return <TeacherDashboardPage />;
  }

  return <DashboardPage />;
}
