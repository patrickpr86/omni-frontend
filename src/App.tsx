import type { ReactElement } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useAuth } from "./context/AuthContext.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { PasswordResetPage } from "./pages/PasswordResetPage.tsx";
import { SchedulingPage } from "./pages/dashboard/SchedulingPage.tsx";
import { StudentDashboardPage } from "./pages/dashboard/StudentDashboardPage.tsx";
import { TeacherDashboardPage } from "./pages/dashboard/TeacherDashboardPage.tsx";
import { AdminDashboardPage } from "./pages/AdminDashboardPage.tsx";
import { TimelinePage } from "./pages/TimelinePage.tsx";
import { AdminTimelinePage } from "./pages/AdminTimelinePage.tsx";
import { ChampionshipsPage } from "./pages/ChampionshipsPage.tsx";
import { MyAgendaPage } from "./pages/MyAgendaPage.tsx";
import { ContentsPage } from "./pages/ContentsPage.tsx";
import { RankingPage } from "./pages/RankingPage.tsx";
import { AccountPage } from "./pages/AccountPage.tsx";
import { SupportPage } from "./pages/SupportPage.tsx";
import { NotificationsPage } from "./pages/NotificationsPage.tsx";
import { CoursesManagementPageNew } from "./pages/CoursesManagementPageNew.tsx";
import { CourseManagementPage } from "./pages/CourseManagementPage.tsx";
import { CourseEditPage } from "./pages/CourseEditPage.tsx";
import { UsersManagementPage } from "./pages/UsersManagementPage.tsx";
import { UserDetailPage } from "./pages/UserDetailPage.tsx";
import { CoursesPage } from "./pages/CoursesPage.tsx";
import { CourseDetailPage } from "./pages/CourseDetailPage.tsx";
import { AdminFinancialDashboardPage } from "./pages/AdminFinancialDashboardPage.tsx";
import { AdminTransactionsPage } from "./pages/AdminTransactionsPage.tsx";
import { MyFinancesPage } from "./pages/MyFinancesPage.tsx";
import { MyEarningsPage } from "./pages/MyEarningsPage.tsx";
import { AvailableTeachersPage } from "./pages/AvailableTeachersPage.tsx";
import { BookLessonPage } from "./pages/BookLessonPage.tsx";
import { MyBookingsPage } from "./pages/MyBookingsPage.tsx";
import { TeacherBookingsPage } from "./pages/TeacherBookingsPage.tsx";
import { SignUpPage } from "./pages/SignUpPage.tsx";

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
        path="/cadastro"
        element={isAuthenticated ? <Navigate to="/" replace /> : <SignUpPage />}
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
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/eventos"
        element={
          <ProtectedRoute>
            <TimelinePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/minha-agenda"
        element={
          <ProtectedRoute>
            <MyAgendaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campeonatos"
        element={
          <ProtectedRoute>
            <ChampionshipsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/timeline"
        element={
          <ProtectedRoute>
            <AdminTimelinePage />
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
            <AccountPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <AccountPage />
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
        path="/cursos/:courseId"
        element={
          <ProtectedRoute>
            <CourseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cursos"
        element={
          <ProtectedRoute>
            <CourseManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cursos/:courseId/editar"
        element={
          <ProtectedRoute>
            <CourseEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute>
            <UsersManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/usuarios/:userId"
        element={
          <ProtectedRoute>
            <UserDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/financeiro"
        element={
          <ProtectedRoute>
            <AdminFinancialDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/financeiro/transacoes"
        element={
          <ProtectedRoute>
            <AdminTransactionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/minhas-financas"
        element={
          <ProtectedRoute>
            <MyFinancesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meus-ganhos"
        element={
          <ProtectedRoute>
            <MyEarningsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/professores-disponiveis"
        element={
          <ProtectedRoute>
            <AvailableTeachersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agendar-aula/:teacherId"
        element={
          <ProtectedRoute>
            <BookLessonPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/minhas-aulas"
        element={
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gerenciar-solicitacoes"
        element={
          <ProtectedRoute>
            <TeacherBookingsPage />
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
