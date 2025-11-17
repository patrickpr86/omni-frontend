import { useState, useEffect } from "react";
import { AppLayout } from "@/shared/components/AppLayout";
import { BackButton } from "@/shared/components/BackButton";
import { useAuth } from "@/core/context/AuthContext.tsx";
import { useLanguage } from "@/core/context/LanguageContext.tsx";
import {
  getPendingBookings,
  getMyBookings,
  confirmBooking,
  rejectBooking,
  type Booking,
  BOOKING_STATUS_LABELS,
  MODALITY_LABELS,
  formatDate,
  formatTime,
  formatDateTime,
} from "@/modules/scheduling/api/bookings.ts";

export function TeacherBookingsPage() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"PENDING" | "CONFIRMED" | "ALL">("PENDING");
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [teacherNotes, setTeacherNotes] = useState("");

  useEffect(() => {
    loadBookings();
  }, [token, filter]);

  const loadBookings = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      if (filter === "PENDING") {
        const data = await getPendingBookings(token);
        setBookings(data);
      } else {
        const data = await getMyBookings(token);
        if (filter === "CONFIRMED") {
          setBookings(data.filter((b) => b.status === "CONFIRMED"));
        } else {
          setBookings(data);
        }
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      alert("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId: number) => {
    if (!token) return;
    try {
      await confirmBooking(token, bookingId, { teacherNotes });
      alert("Agendamento confirmado com sucesso!");
      setActioningId(null);
      setTeacherNotes("");
      loadBookings();
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert("Erro ao confirmar agendamento");
    }
  };

  const handleReject = async (bookingId: number) => {
    if (!token) return;
    if (!teacherNotes.trim()) {
      alert("Por favor, informe o motivo da recusa");
      return;
    }
    if (!confirm("Tem certeza que deseja recusar este agendamento?")) return;

    try {
      await rejectBooking(token, bookingId, { teacherNotes });
      alert("Agendamento recusado");
      setActioningId(null);
      setTeacherNotes("");
      loadBookings();
    } catch (error) {
      console.error("Error rejecting booking:", error);
      alert("Erro ao recusar agendamento");
    }
  };

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;

  return (
    <AppLayout>
      <BackButton />
      <div className="page-header">
        <div>
          <h1 className="page-title">
            👨‍🏫 {language === "pt" ? "Gerenciar Solicitações" : "Manage Requests"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {language === "pt"
              ? "Confirme ou recuse solicitações de aulas particulares"
              : "Confirm or reject private lesson requests"}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card">
          <span className="metric-label">
            {language === "pt" ? "Total de Solicitações" : "Total Requests"}
          </span>
          <strong>{bookings.length}</strong>
        </div>
        <div className="metric-card" style={{ border: "2px solid #f59e0b" }}>
          <span className="metric-label">
            {language === "pt" ? "Aguardando Resposta" : "Awaiting Response"}
          </span>
          <strong style={{ color: "#f59e0b", fontSize: "32px" }}>{pendingCount}</strong>
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
          className={filter === "PENDING" ? "button" : "button button-secondary"}
          onClick={() => setFilter("PENDING")}
        >
          {language === "pt" ? "Pendentes" : "Pending"} ({pendingCount})
        </button>
        <button
          className={filter === "CONFIRMED" ? "button" : "button button-secondary"}
          onClick={() => setFilter("CONFIRMED")}
        >
          {language === "pt" ? "Confirmadas" : "Confirmed"}
        </button>
        <button
          className={filter === "ALL" ? "button" : "button button-secondary"}
          onClick={() => setFilter("ALL")}
        >
          {language === "pt" ? "Todas" : "All"}
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <p>{language === "pt" ? "Carregando..." : "Loading..."}</p>
      ) : bookings.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--text-muted)" }}>
            {filter === "PENDING"
              ? language === "pt"
                ? "Nenhuma solicitação pendente"
                : "No pending requests"
              : language === "pt"
              ? "Nenhum agendamento encontrado"
              : "No bookings found"}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="panel"
              style={
                booking.status === "PENDING"
                  ? { border: "2px solid #f59e0b" }
                  : undefined
              }
            >
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
                    {language === "pt" ? "Aluno" : "Student"}: {booking.studentName}
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {booking.studentEmail}
                  </p>
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
                  <p style={{ fontWeight: "500", fontSize: "16px" }}>
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
                    <p
                      style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}
                    >
                      {language === "pt" ? "Local" : "Location"}
                    </p>
                    <p style={{ fontWeight: "500" }}>📍 {booking.location}</p>
                  </div>
                )}
              </div>

              {booking.studentNotes && (
                <div style={{ marginBottom: "16px" }}>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      marginBottom: "4px",
                    }}
                  >
                    {language === "pt" ? "Observações do aluno:" : "Student's notes:"}
                  </p>
                  <p
                    style={{
                      padding: "12px",
                      background: "var(--bg-tertiary)",
                      borderRadius: "8px",
                      fontSize: "14px",
                      borderLeft: "3px solid #f59e0b",
                    }}
                  >
                    💬 {booking.studentNotes}
                  </p>
                </div>
              )}

              {booking.teacherNotes && (
                <div style={{ marginBottom: "16px" }}>
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
                      padding: "12px",
                      background: "var(--bg-tertiary)",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  >
                    {booking.teacherNotes}
                  </p>
                </div>
              )}

              {booking.status === "PENDING" &&
                (actioningId === booking.id ? (
                  <div style={{ marginTop: "16px" }}>
                    <label className="form-field" style={{ marginBottom: "12px" }}>
                      <span>
                        {language === "pt"
                          ? "Observações (opcional para confirmar, obrigatório para recusar)"
                          : "Notes (optional to confirm, required to reject)"}
                      </span>
                      <textarea
                        value={teacherNotes}
                        onChange={(e) => setTeacherNotes(e.target.value)}
                        className="form-input"
                        rows={3}
                        placeholder={
                          language === "pt"
                            ? "Adicione observações sobre o agendamento..."
                            : "Add notes about the booking..."
                        }
                      />
                    </label>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        className="button"
                        onClick={() => handleConfirm(booking.id)}
                        style={{ background: "#10b981", flex: 1 }}
                      >
                        ✓ {language === "pt" ? "Confirmar Aula" : "Confirm Lesson"}
                      </button>
                      <button
                        className="button button-secondary"
                        onClick={() => handleReject(booking.id)}
                        style={{ background: "#ef4444", color: "#fff", flex: 1 }}
                      >
                        ✗ {language === "pt" ? "Recusar" : "Reject"}
                      </button>
                      <button
                        className="button button-secondary"
                        onClick={() => {
                          setActioningId(null);
                          setTeacherNotes("");
                        }}
                      >
                        {language === "pt" ? "Cancelar" : "Cancel"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="button"
                    onClick={() => setActioningId(booking.id)}
                    style={{ background: "#f59e0b" }}
                  >
                    {language === "pt" ? "Responder Solicitação" : "Respond to Request"}
                  </button>
                ))}

              {booking.status === "CONFIRMED" && booking.confirmedAt && (
                <p style={{ fontSize: "13px", color: "#10b981" }}>
                  ✓ {language === "pt" ? "Confirmado em" : "Confirmed on"}{" "}
                  {formatDateTime(booking.confirmedAt)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

