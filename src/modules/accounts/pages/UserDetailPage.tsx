import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/shared/components/AppLayout";
import { BackButton } from "@/shared/components/BackButton";
import { useAuth } from "@/core/context/AuthContext.tsx";
import { useLanguage } from "@/core/context/LanguageContext.tsx";
import { getUserDetails, type UserDetailResponse } from "@/modules/admin/api/admin.ts";

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { token } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    if (!token || !userId) return;
    try {
      setLoading(true);
      const data = await getUserDetails(token, parseInt(userId));
      setUser(data);
    } catch (error) {
      console.error("Error loading user details:", error);
      alert("Erro ao carregar detalhes do usuário");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AppLayout><p>{language === "pt" ? "Carregando..." : "Loading..."}</p></AppLayout>;
  }

  if (!user) {
    return <AppLayout><p>{language === "pt" ? "Usuário não encontrado" : "User not found"}</p></AppLayout>;
  }

  return (
    <AppLayout>
      <BackButton to="/admin/usuarios" />
      <div className="page-header">
        <div>
          <button
            className="button button-secondary"
            onClick={() => navigate("/admin/usuarios")}
            style={{ marginBottom: "16px" }}
          >
            ← {language === "pt" ? "Voltar" : "Back"}
          </button>
          <h1 className="page-title">
            {language === "pt" ? "Detalhes do Usuário" : "User Details"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {user.fullName || user.username}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="panel" style={{ marginBottom: "24px" }}>
        <h2>{language === "pt" ? "Informações Básicas" : "Basic Information"}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginTop: "16px" }}>
          <div>
            <strong>{language === "pt" ? "Username" : "Username"}:</strong>
            <p>{user.username}</p>
          </div>
          <div>
            <strong>{language === "pt" ? "Email" : "Email"}:</strong>
            <p>{user.email}</p>
          </div>
          <div>
            <strong>{language === "pt" ? "Nome Completo" : "Full Name"}:</strong>
            <p>{user.fullName || "-"}</p>
          </div>
          <div>
            <strong>{language === "pt" ? "Telefone" : "Phone"}:</strong>
            <p>{user.phoneNumber || "-"}</p>
          </div>
          <div>
            <strong>{language === "pt" ? "Data de Nascimento" : "Date of Birth"}:</strong>
            <p>{user.dateOfBirth || "-"}</p>
          </div>
          <div>
            <strong>{language === "pt" ? "Provedor de Auth" : "Auth Provider"}:</strong>
            <p>{user.authProvider || "LOCAL"}</p>
          </div>
          <div>
            <strong>{language === "pt" ? "Plano" : "Plan"}:</strong>
            <p>{user.planType}</p>
          </div>
          <div>
            <strong>{language === "pt" ? "Último Login" : "Last Login"}:</strong>
            <p>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "-"}</p>
          </div>
        </div>
        <div style={{ marginTop: "16px" }}>
          <strong>{language === "pt" ? "Roles" : "Roles"}:</strong>
          <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
            {user.roles.map((role) => (
              <span key={role} className="status status-confirmed" style={{ fontSize: "13px" }}>
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Course Metrics */}
      <h2 style={{ marginBottom: "16px" }}>{language === "pt" ? "Métricas de Cursos" : "Course Metrics"}</h2>
      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Cursos Inscritos" : "Enrolled Courses"}</span>
          <strong>{user.totalCoursesEnrolled}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Cursos Concluídos" : "Completed Courses"}</span>
          <strong>{user.completedCourses}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Progresso Médio" : "Average Progress"}</span>
          <strong>{user.averageCourseProgress.toFixed(1)}%</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Total Investido" : "Total Spent"}</span>
          <strong>R$ {user.totalSpentOnCourses.toFixed(2)}</strong>
        </div>
      </div>

      {/* Booking Metrics */}
      <h2 style={{ marginBottom: "16px" }}>{language === "pt" ? "Métricas de Reservas" : "Booking Metrics"}</h2>
      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Total de Reservas" : "Total Bookings"}</span>
          <strong>{user.totalBookings}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Confirmadas" : "Confirmed"}</span>
          <strong>{user.confirmedBookings}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Pendentes" : "Pending"}</span>
          <strong>{user.pendingBookings}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Canceladas" : "Cancelled"}</span>
          <strong>{user.cancelledBookings}</strong>
        </div>
      </div>

      {/* Instructor Metrics */}
      {user.roles.includes("INSTRUCTOR") && (
        <>
          <h2 style={{ marginBottom: "16px" }}>{language === "pt" ? "Métricas de Instrutor" : "Instructor Metrics"}</h2>
          <div className="metrics-grid" style={{ marginBottom: "24px" }}>
            <div className="metric-card">
              <span className="metric-label">{language === "pt" ? "Cursos Criados" : "Courses Created"}</span>
              <strong>{user.totalCoursesCreated || 0}</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">{language === "pt" ? "Alunos Matriculados" : "Students Enrolled"}</span>
              <strong>{user.totalStudentsEnrolled || 0}</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">{language === "pt" ? "Avaliação Média" : "Average Rating"}</span>
              <strong>{user.averageCourseRating?.toFixed(1) || "N/A"} ⭐</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">{language === "pt" ? "Aulas Ministradas" : "Classes Taught"}</span>
              <strong>{user.totalBookingsAsInstructor || 0}</strong>
            </div>
          </div>
        </>
      )}

      {/* Modalities */}
      {user.enrolledModalities.length > 0 && (
        <div className="panel" style={{ marginBottom: "24px" }}>
          <h2>{language === "pt" ? "Modalidades Inscritas" : "Enrolled Modalities"}</h2>
          <div style={{ marginTop: "16px" }}>
            {user.enrolledModalities.map((modality) => (
              <div key={modality.modality} style={{ padding: "12px", borderBottom: "1px solid var(--border)" }}>
                <strong>{modality.displayName}</strong>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  {language === "pt" ? "Inscrito em" : "Enrolled at"}: {new Date(modality.enrolledAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teaching Modalities */}
      {user.teachingModalities.length > 0 && (
        <div className="panel">
          <h2>{language === "pt" ? "Modalidades Ensinadas" : "Teaching Modalities"}</h2>
          <div style={{ marginTop: "16px" }}>
            {user.teachingModalities.map((modality) => (
              <div key={modality.modality} style={{ padding: "12px", borderBottom: "1px solid var(--border)" }}>
                <strong>{modality.displayName}</strong>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  {modality.experienceYears && `${modality.experienceYears} ${language === "pt" ? "anos de experiência" : "years of experience"}`}
                  {modality.certificationLevel && ` • ${modality.certificationLevel}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

