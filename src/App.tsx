import type { ReactElement } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useAuth } from "./context/AuthContext.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { ProfilePage } from "./pages/ProfilePage.tsx";
import { PasswordResetPage } from "./pages/PasswordResetPage.tsx";
import { SchedulingPage } from "./pages/dashboard/SchedulingPage.tsx";
import { StudentDashboardPage } from "./pages/dashboard/StudentDashboardPage.tsx";
import { TeacherDashboardPage } from "./pages/dashboard/TeacherDashboardPage.tsx";
import { AdminAnalyticsPage } from "./pages/dashboard/AdminAnalyticsPage.tsx";
import { ContentsPage } from "./pages/ContentsPage.tsx";
import { RankingPage } from "./pages/RankingPage.tsx";
import { MyAccountPage } from "./pages/MyAccountPage.tsx";
import { SupportPage } from "./pages/SupportPage.tsx";
import { NotificationsPage } from "./pages/NotificationsPage.tsx";
import { CoursesManagementPage } from "./pages/CoursesManagementPage.tsx";
import { CoursesPage } from "./pages/CoursesPage.tsx";

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/reset-senha"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <PasswordResetPage />
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agendamentos"
        element={
          <ProtectedRoute>
            <SchedulingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel/aluno"
        element={
          <ProtectedRoute>
            <StudentDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel/instrutor"
        element={
          <ProtectedRoute>
            <TeacherDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel/admin"
        element={
          <ProtectedRoute>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/conteudos"
        element={
          <ProtectedRoute>
            <ContentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ranking"
        element={
          <ProtectedRoute>
            <RankingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/minha-conta"
        element={
          <ProtectedRoute>
            <MyAccountPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/atendimento"
        element={
          <ProtectedRoute>
            <SupportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notificacoes"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cursos"
        element={
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cursos"
        element={
          <ProtectedRoute>
            <CoursesManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
