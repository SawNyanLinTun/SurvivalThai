import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './i18n';
import './index.css';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import CreateClassPage from './pages/teacher/CreateClassPage';
import ClassWorkspacePage from './pages/teacher/ClassWorkspacePage';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { homeFor } from './auth/helpers';
import { isConfigured } from './lib/supabase';
import Spinner from './components/Spinner';

function LoginRoute() {
  const { profile, loading } = useAuth();
  if (loading) return <Spinner />;
  return profile ? <Navigate to={homeFor(profile.role)} replace /> : <LoginPage />;
}

function NotConfigured() {
  return (
    <div className="mx-auto max-w-lg p-8 text-center">
      <h1 className="text-2xl font-bold text-ink">Supabase is not configured</h1>
      <p className="mt-2 text-ink-muted">
        Copy <code>.env.example</code> to <code>.env</code> (or set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY) and rebuild.
      </p>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginRoute />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="student">
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/classes/new"
        element={
          <ProtectedRoute role="teacher">
            <CreateClassPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/classes/:classId/:tab?"
        element={
          <ProtectedRoute role="teacher">
            <ClassWorkspacePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      {isConfigured ? (
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      ) : (
        <NotConfigured />
      )}
    </ThemeProvider>
  );
}
