import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { BackButton } from "../components/BackButton";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  getMyBookings,
  cancelBooking,
  type Booking,
  BOOKING_STATUS_LABELS,
  MODALITY_LABELS,
  formatDate,
  formatTime,
  formatDateTime,
} from "../api/bookings";

export function MyBookingsPage() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "PAST">("ALL");

  useEffect(() => {
    loadBookings();
  }, [token]);

  const loadBookings = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getMyBookings(token);
      setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
      alert("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (!token) return;
    if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return;

    try {
      await cancelBooking(token, bookingId);
      alert("Agendamento cancelado com sucesso");
      loadBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Erro ao cancelar agendamento");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "ALL") return true;
    if (filter === "PENDING") return booking.status === "PENDING";
    if (filter === "CONFIRMED") return booking.status === "CONFIRMED";
    if (filter === "PAST")
      return booking.status === "COMPLETED" || booking.status === "CANCELLED" || booking.status === "REJECTED";
    return true;
  });

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;

  return (
    <AppLayout>
      <BackButton />
      <div className="page-header">
        <div>
          <h1 className="page-title">
            📚 {language === "pt" ? "Minhas Aulas Particulares" : "My Private Lessons"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {language === "pt"
              ? "Acompanhe seus agendamentos de aulas particulares"
              : "Track your private lesson bookings"}
          </p>
        </div>
        <button className="button" onClick={() => navigate("/professores-disponiveis")}>
          {language === "pt" ? "Nova Aula" : "New Lesson"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card">
          <span className="metric-label">
            {language === "pt" ? "Total de Aulas" : "Total Lessons"}
          </span>
          <strong>{bookings.length}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            {language === "pt" ? "Aguardando Confirmação" : "Awaiting Confirmation"}
          </span>
          <strong style={{ color: "#f59e0b" }}>{pendingCount}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            {language === "pt" ? "Confirmadas" : "Confirmed"}
          </span>
          <strong style={{ color: "#10b981" }}>{confirmedCount}</strong>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "16px", display: "flex", gap: "12px" }}>
        <button
          className={filter === "ALL" ? "button" : "button button-secondary"}
          onClick={() => setFilter("ALL")}
        >
          {language === "pt" ? "Todas" : "All"}
        </button>
        <button
          className={filter === "PENDING" ? "button" : "button button-secondary"}
          onClick={() => setFilter("PENDING")}
        >
          {language === "pt" ? "Pendentes" : "Pending"} ({pendingCount})
        </button>
        <button
          className={filter === "CONFIRMED" ? "button" : "button button-secondary"}
          onClick={() => setFilter("CONFIRMED")}
        >
          {language === "pt" ? "Confirmadas" : "Confirmed"} ({confirmedCount})
        </button>
        <button
          className={filter === "PAST" ? "button" : "button button-secondary"}
          onClick={() => setFilter("PAST")}
        >
          {language === "pt" ? "Histórico" : "History"}
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <p>{language === "pt" ? "Carregando..." : "Loading..."}</p>
      ) : filteredBookings.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
            {language === "pt"
              ? "Você ainda não tem aulas agendadas"
              : "You don't have any scheduled lessons yet"}
          </p>
          <button className="button" onClick={() => navigate("/professores-disponiveis")}>
            {language === "pt" ? "Agendar Primeira Aula" : "Schedule First Lesson"}
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="panel">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>
                    {MODALITY_LABELS[booking.modality] || booking.modality} -{" "}
                    {language === "pt" ? "Professor" : "Teacher"} {booking.teacherName}
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {language === "pt" ? "Solicitado em" : "Requested on"}{" "}
                    {formatDateTime(booking.createdAt)}
                  </p>
                </div>
                <span className={`status status-${booking.status.toLowerCase()}`}>
                  {BOOKING_STATUS_LABELS[booking.status]}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    {language === "pt" ? "Data e Hora" : "Date and Time"}
                  </p>
                  <p style={{ fontWeight: "500" }}>
                    📅 {formatDate(booking.requestedDate)} às {formatTime(booking.requestedTime)}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    {language === "pt" ? "Duração" : "Duration"}
                  </p>
                  <p style={{ fontWeight: "500" }}>
                    ⏱️ {booking.durationMinutes} {language === "pt" ? "minutos" : "minutes"}
                  </p>
                </div>

                {booking.location && (
                  <div>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>
                      {language === "pt" ? "Local" : "Location"}
                    </p>
                    <p style={{ fontWeight: "500" }}>📍 {booking.location}</p>
                  </div>
                )}
              </div>

              {booking.studentNotes && (
                <div style={{ marginBottom: "12px" }}>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      marginBottom: "4px",
                    }}
                  >
                    {language === "pt" ? "Suas observações:" : "Your notes:"}
                  </p>
                  <p
                    style={{
                      padding: "8px 12px",
                      background: "var(--bg-tertiary)",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    {booking.studentNotes}
                  </p>
                </div>
              )}

              {booking.teacherNotes && (
                <div style={{ marginBottom: "12px" }}>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      marginBottom: "4px",
                    }}
                  >
                    {language === "pt" ? "Observações do professor:" : "Teacher's notes:"}
                  </p>
                  <p
                    style={{
                      padding: "8px 12px",
                      background: "var(--bg-tertiary)",
                      borderRadius: "6px",
                      fontSize: "14px",
                      borderLeft: "3px solid var(--accent-primary)",
                    }}
                  >
                    {booking.teacherNotes}
                  </p>
                </div>
              )}

              {booking.status === "CONFIRMED" && booking.confirmedAt && (
                <p style={{ fontSize: "13px", color: "#10b981", marginBottom: "12px" }}>
                  ✓ {language === "pt" ? "Confirmado em" : "Confirmed on"}{" "}
                  {formatDateTime(booking.confirmedAt)}
                </p>
              )}

              {booking.status === "REJECTED" && booking.rejectedAt && (
                <p style={{ fontSize: "13px", color: "#ef4444", marginBottom: "12px" }}>
                  ✗ {language === "pt" ? "Recusado em" : "Rejected on"}{" "}
                  {formatDateTime(booking.rejectedAt)}
                </p>
              )}

              {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                <button
                  className="button button-secondary"
                  onClick={() => handleCancel(booking.id)}
                >
                  {language === "pt" ? "Cancelar Agendamento" : "Cancel Booking"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

