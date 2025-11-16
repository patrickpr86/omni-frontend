import { useCallback, useEffect, useMemo, useState } from "react";
import {
  confirmBooking,
  getPendingBookings,
  getUpcomingBookings,
  rejectBooking,
} from "../../api/bookings.ts";
import type { Booking } from "../../api/types.ts";
import { AppLayout } from "../../components/AppLayout.tsx";
import { BackButton } from "../../components/BackButton";
import { useAuth } from "../../context/AuthContext.tsx";
import { useLanguage } from "../../context/LanguageContext.tsx";
import {
  createEmptyState,
  defaultBookingFilter,
  downloadCsv,
  formatDate,
  formatStatus,
  formatTime,
  useFilteredBookings,
} from "./dashboardUtils.ts";
import type { BookingFilter, FetchState } from "./dashboardUtils.ts";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export function TeacherDashboardPage() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [scheduleState, setScheduleState] = useState<FetchState<Booking[]>>(() =>
    createEmptyState([])
  );
  const [pendingState, setPendingState] = useState<FetchState<Booking[]>>(() =>
    createEmptyState([])
  );
  const [bookingFilter, setBookingFilter] =
    useState<BookingFilter>(defaultBookingFilter);
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setScheduleState((prev) => ({ ...prev, loading: true, error: null }));
    setPendingState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [schedule, pending] = await Promise.all([
        getUpcomingBookings(token),
        getPendingBookings(token),
      ]);
      setScheduleState({ data: schedule, loading: false, error: null });
      setPendingState({ data: pending, loading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível carregar seus agendamentos.";
      setScheduleState({ data: [], loading: false, error: message });
      setPendingState({ data: [], loading: false, error: message });
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredScheduleByStatus = useFilteredBookings(
    scheduleState.data,
    bookingFilter
  );

  const dayOptions = useMemo(() => {
    const unique = new Set<string>();
    scheduleState.data.forEach((booking) => {
      if (!booking.requestedDate) return;
      const day = new Date(booking.requestedDate).toLocaleDateString("pt-BR", {
        weekday: "long",
      });
      unique.add(day);
    });
    return ["all", ...Array.from(unique)];
  }, [scheduleState.data]);

  const filteredSchedule = useMemo(() => {
    if (selectedDay === "all") {
      return filteredScheduleByStatus;
    }
    return filteredScheduleByStatus.filter((booking) => {
      if (!booking.requestedDate) return false;
      const day = new Date(booking.requestedDate).toLocaleDateString("pt-BR", {
        weekday: "long",
      });
      return day === selectedDay;
    });
  }, [filteredScheduleByStatus, selectedDay]);

  // Dados para gráficos
  const statusDistribution = useMemo(() => {
    const confirmed = scheduleState.data.filter(b => b.status === "CONFIRMED").length;
    const pending = pendingState.data.length;
    const rejected = scheduleState.data.filter(b => b.status === "REJECTED").length;
    
    return [
      { name: "Confirmadas", value: confirmed, color: "#34d399" },
      { name: "Pendentes", value: pending, color: "#f59e0b" },
      { name: "Rejeitadas", value: rejected, color: "#ef4444" },
    ].filter(item => item.value > 0);
  }, [scheduleState.data, pendingState.data]);

  const weekdayData = useMemo(() => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const counts = new Array(7).fill(0);
    
    scheduleState.data.forEach((booking) => {
      if (booking.requestedDate && booking.status === "CONFIRMED") {
        const date = new Date(booking.requestedDate);
        const dayIndex = date.getDay();
        counts[dayIndex]++;
      }
    });
    
    return days.map((day, index) => ({
      day,
      aulas: counts[index]
    }));
  }, [scheduleState.data]);

  async function handlePendingAction(
    action: "confirm" | "reject",
    bookingId: number
  ) {
    if (!token) return;
    try {
      const updated =
        action === "confirm"
          ? await confirmBooking(token, bookingId)
          : await rejectBooking(token, bookingId, { teacherNotes: "Recusado" });

      setPendingState((prev) => ({
        ...prev,
        data: prev.data.filter((item) => item.id !== bookingId),
      }));
      setScheduleState((prev) => ({
        ...prev,
        data:
          action === "confirm"
            ? [updated, ...prev.data]
            : prev.data.filter((item) => item.id !== bookingId),
      }));
      setFeedback(
        action === "confirm"
          ? t("bookingConfirmedMessage")
          : t("bookingRejectedMessage")
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o agendamento.";
      setFeedback(message);
    }
  }

  const handleExportSchedule = () => {
    if (filteredSchedule.length === 0) {
      setFeedback(t("noFilteredResults"));
      return;
    }
    const rows: string[][] = [
      ["Status", "Aluno", "Modalidade", "Data", "Horário", "Duração (min)"],
      ...filteredSchedule.map((booking) => [
        formatStatus(booking.status),
        booking.studentName ?? "-",
        booking.modality ?? "-",
        formatDate(booking.requestedDate),
        formatTime(booking.requestedTime),
        String(booking.durationMinutes ?? 60),
      ]),
    ];
    downloadCsv("agenda-instrutor.csv", rows);
    setFeedback(t("exportSuccessMessage"));
  };

  return (
    <AppLayout>
      <BackButton />
      <div className="dashboard-stack">
        <section className="metrics-showcase">
          <div className="metrics-showcase-header">
            <div>
              <h1>{t("teacherDashboardTitle")}</h1>
              <p>{t("teacherDashboardSubtitle")}</p>
            </div>
            <div className="metrics-badge">
              <span>{t("pendingRequests")}</span>
              <strong>{pendingState.data.length}</strong>
              <small>{t("manageApprovals")}</small>
            </div>
          </div>
        </section>

        <section className="panel glass-panel">
          <div className="panel-header">
            <h2>Dashboard Visual</h2>
          </div>
          <div className="charts-grid">
            <div className="chart-container">
              <h3 className="chart-title">Distribuição de Aulas</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: "#1a1f2e",
                      border: "1px solid #2d3548",
                      borderRadius: "8px",
                      color: "#e2e8f0"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {statusDistribution.map((item, index) => (
                  <div key={index} className="legend-item">
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-container">
              <h3 className="chart-title">Aulas por Dia da Semana</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weekdayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3548" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#94a3b8"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: "#1a1f2e",
                      border: "1px solid #2d3548",
                      borderRadius: "8px",
                      color: "#e2e8f0"
                    }}
                  />
                  <Bar dataKey="aulas" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="panel glass-panel">
          <div className="panel-header">
            <div>
              <h2>{t("teacherScheduleTitle")}</h2>
              <p>{t("teacherScheduleSubtitle")}</p>
            </div>
            <div className="filter-bar">
              <label>
                <span>{t("statusFilterLabel")}</span>
                <select
                  value={bookingFilter.status}
                  onChange={(event) =>
                    setBookingFilter((prev) => ({
                      ...prev,
                      status: event.target.value as BookingFilter["status"],
                    }))
                  }
                >
                  <option value="ALL">{t("allStatuses")}</option>
                  <option value="PENDING">{t("PENDING")}</option>
                  <option value="CONFIRMED">{t("CONFIRMED")}</option>
                  <option value="REJECTED">{t("REJECTED")}</option>
                  <option value="CANCELLED">{t("CANCELLED")}</option>
                </select>
              </label>
              <label>
                <span>{t("timeRangeFilterLabel")}</span>
                <select
                  value={bookingFilter.scope}
                  onChange={(event) =>
                    setBookingFilter((prev) => ({
                      ...prev,
                      scope: event.target.value as BookingFilter["scope"],
                    }))
                  }
                >
                  <option value="upcoming">{t("upcomingScope")}</option>
                  <option value="past">{t("pastScope")}</option>
                  <option value="all">{t("allScope")}</option>
                </select>
              </label>
              <label>
                <span>{t("dayFilterLabel")}</span>
                <select
                  value={selectedDay}
                  onChange={(event) => setSelectedDay(event.target.value)}
                >
                  {dayOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? t("allDaysOption") : option}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="secondary-button"
                onClick={handleExportSchedule}
              >
                {t("exportCsv")}
              </button>
            </div>
          </div>

          {scheduleState.loading && <p className="muted">{t("loadingBookings")}</p>}
          {scheduleState.error && (
            <p className="feedback feedback-error">{scheduleState.error}</p>
          )}

          <div className="booking-list">
            {filteredSchedule.map((booking) => (
              <article key={booking.id} className="booking-card">
                <header>
                  <strong>{booking.studentName ?? t("student")}</strong>
                  <span className={`status status-${booking.status.toLowerCase()}`}>
                    {formatStatus(booking.status)}
                  </span>
                </header>
                <ul>
                  <li>
                    <strong>{t("modality")}:</strong> {booking.modality ?? "-"}
                  </li>
                  <li>
                    <strong>{t("date")}:</strong> {formatDate(booking.requestedDate)}
                  </li>
                  <li>
                    <strong>{t("time")}:</strong> {formatTime(booking.requestedTime)}
                  </li>
                  <li>
                    <strong>{t("duration")}:</strong>{" "}
                    {booking.durationMinutes ?? 60} {t("minutes")}
                  </li>
                </ul>
              </article>
            ))}
            {filteredSchedule.length === 0 && !scheduleState.loading && (
              <p className="muted">{t("noFilteredResults")}</p>
            )}
          </div>
        </section>

        <section className="panel glass-panel">
          <div className="panel-header">
            <div>
              <h2>{t("pendingRequests")}</h2>
              <p>{t("manageApprovals")}</p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={loadData}
            >
              {t("refresh")}
            </button>
          </div>

          {pendingState.loading && <p className="muted">{t("loadingBookings")}</p>}
          {pendingState.error && (
            <p className="feedback feedback-error">{pendingState.error}</p>
          )}

          <div className="booking-list">
            {pendingState.data.map((booking) => (
              <article key={booking.id} className="booking-card">
                <header>
                  <strong>{booking.studentName ?? t("student")}</strong>
                  <span className="badge">{booking.modality ?? "-"}</span>
                </header>
                <ul>
                  <li>
                    <strong>{t("date")}:</strong> {formatDate(booking.requestedDate)}
                  </li>
                  <li>
                    <strong>{t("time")}:</strong> {formatTime(booking.requestedTime)}
                  </li>
                  <li>
                    <strong>{t("studentNotes")}:</strong>{" "}
                    {booking.studentNotes ?? "—"}
                  </li>
                </ul>
                <footer className="booking-actions">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => handlePendingAction("confirm", booking.id)}
                  >
                    {t("confirm")}
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handlePendingAction("reject", booking.id)}
                  >
                    {t("reject")}
                  </button>
                </footer>
              </article>
            ))}
            {pendingState.data.length === 0 && !pendingState.loading && (
              <p className="muted">{t("noRequests")}</p>
            )}
          </div>

          {feedback && <p className="feedback feedback-info">{feedback}</p>}
        </section>
      </div>
    </AppLayout>
  );
}
