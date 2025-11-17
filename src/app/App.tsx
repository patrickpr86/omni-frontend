import { lazy, Suspense } from "react";
import type { ComponentType } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./styles/App.css";
import { useAuth } from "@/core/context/AuthContext.tsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.tsx";

const lazyImport = <T, K extends keyof T>(
  factory: () => Promise<T>,
  selector: K
) =>
  lazy(async () => {
    const module = await factory();
    return { default: module[selector] as ComponentType };
  });

const LoginPage = lazyImport(() => import("@/modules/auth"), "LoginPage");
const SignUpPage = lazyImport(() => import("@/modules/auth"), "SignUpPage");
const PasswordResetPage = lazyImport(
  () => import("@/modules/auth"),
  "PasswordResetPage"
);
const DashboardPage = lazyImport(
  () => import("@/modules/dashboard"),
  "DashboardPage"
);
const StudentDashboardPage = lazyImport(
  () => import("@/modules/dashboard"),
  "StudentDashboardPage"
);
const TeacherDashboardPage = lazyImport(
  () => import("@/modules/dashboard"),
  "TeacherDashboardPage"
);
const AdminDashboardPage = lazyImport(
  () => import("@/modules/admin"),
  "AdminDashboardPage"
);
const UsersManagementPage = lazyImport(
  () => import("@/modules/admin"),
  "UsersManagementPage"
);
const AccountPage = lazyImport(
  () => import("@/modules/accounts"),
  "AccountPage"
);
const UserDetailPage = lazyImport(
  () => import("@/modules/accounts"),
  "UserDetailPage"
);
const CoursesPage = lazyImport(
  () => import("@/modules/courses"),
  "CoursesPage"
);
const CourseDetailPage = lazyImport(
  () => import("@/modules/courses"),
  "CourseDetailPage"
);
const CourseManagementPage = lazyImport(
  () => import("@/modules/courses"),
  "CourseManagementPage"
);
const CourseEditPage = lazyImport(
  () => import("@/modules/courses"),
  "CourseEditPage"
);
const ContentsPage = lazyImport(
  () => import("@/modules/content"),
  "ContentsPage"
);
const AdminFinancialDashboardPage = lazyImport(
  () => import("@/modules/finance"),
  "AdminFinancialDashboardPage"
);
const AdminTransactionsPage = lazyImport(
  () => import("@/modules/finance"),
  "AdminTransactionsPage"
);
const MyFinancesPage = lazyImport(
  () => import("@/modules/finance"),
  "MyFinancesPage"
);
const MyEarningsPage = lazyImport(
  () => import("@/modules/finance"),
  "MyEarningsPage"
);
const SchedulingPage = lazyImport(
  () => import("@/modules/scheduling"),
  "SchedulingPage"
);
const AvailableTeachersPage = lazyImport(
  () => import("@/modules/scheduling"),
  "AvailableTeachersPage"
);
const BookLessonPage = lazyImport(
  () => import("@/modules/scheduling"),
  "BookLessonPage"
);
const MyBookingsPage = lazyImport(
  () => import("@/modules/scheduling"),
  "MyBookingsPage"
);
const TeacherBookingsPage = lazyImport(
  () => import("@/modules/scheduling"),
  "TeacherBookingsPage"
);
const MyAgendaPage = lazyImport(
  () => import("@/modules/scheduling"),
  "MyAgendaPage"
);
const TimelinePage = lazyImport(
  () => import("@/modules/timeline"),
  "TimelinePage"
);
const AdminTimelinePage = lazyImport(
  () => import("@/modules/timeline"),
  "AdminTimelinePage"
);
const ChampionshipsPage = lazyImport(
  () => import("@/modules/engagement"),
  "ChampionshipsPage"
);
const RankingPage = lazyImport(
  () => import("@/modules/engagement"),
  "RankingPage"
);
const SupportPage = lazyImport(
  () => import("@/modules/support"),
  "SupportPage"
);
const NotificationsPage = lazyImport(
  () => import("@/modules/notifications"),
  "NotificationsPage"
);

const SuspenseFallback = (
  <div
    className="app-loading"
    style={{
      display: "flex",
      minHeight: "100vh",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--text-primary)",
    }}
  >
    <span>Carregando interface...</span>
  </div>
);

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={SuspenseFallback}>
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
    </Suspense>
  );
}

export default App;
