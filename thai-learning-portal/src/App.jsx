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
import { getUser, homeFor } from './auth';

function LoginRoute() {
  const user = getUser();
  return user ? <Navigate to={homeFor(user.role)} replace /> : <LoginPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </ThemeProvider>
  );
}
