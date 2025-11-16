import { useEffect, useMemo, useState } from "react";
import {
  getUpcomingBookings,
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
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type ContentHighlight = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  background: string;
};

type OnboardingCard = {
  id: string;
  title: string;
  subtitle: string;
  background: string;
};

function extractMonthKey(date?: string) {
  if (!date) return "desconhecido";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "desconhecido";
  }
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(key: string, locale: string) {
  if (key === "desconhecido") {
    return "Sem data";
  }
  const [year, month] = key.split("-");
  const parsed = new Date(Number(year), Number(month) - 1, 1);
  return parsed.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}

export function StudentDashboardPage() {
  const { token } = useAuth();
  const { language, t } = useLanguage();

  const [bookingsState, setBookingsState] = useState<FetchState<Booking[]>>(() =>
    createEmptyState([])
  );
  const [bookingFilter, setBookingFilter] =
    useState<BookingFilter>(defaultBookingFilter);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [monthlyGoal, setMonthlyGoal] = useState<number>(8);

  const featuredSeries = useMemo<ContentHighlight[]>(() => {
    if (language === "pt") {
      return [
        {
          id: "microservices",
          title: "Boas Práticas e Padrões em Microservices",
          subtitle: "Última edição da Decoder Week",
          category: "Decoder Week",
          background: "linear-gradient(135deg, #0f172a 0%, #2563eb 100%)",
        },
        {
          id: "spring",
          title: "Descomplicando Microservices com Spring",
          subtitle: "Segunda edição da Decoder Week",
          category: "Decoder Week",
          background: "linear-gradient(135deg, #0f172a 0%, #a855f7 100%)",
        },
        {
          id: "monolith",
          title: "O Fim dos Sistemas Monolíticos",
          subtitle: "Primeira edição da Decoder Week",
          category: "Decoder Week",
          background: "linear-gradient(135deg, #0f172a 0%, #f97316 100%)",
        },
      ];
    }
    return [
      {
        id: "microservices",
        title: "Best Practices for Microservices",
        subtitle: "Latest Decoder Week edition",
        category: "Decoder Week",
        background: "linear-gradient(135deg, #0f172a 0%, #2563eb 100%)",
      },
      {
        id: "spring",
        title: "Demystifying Microservices with Spring",
        subtitle: "Second Decoder Week edition",
        category: "Decoder Week",
        background: "linear-gradient(135deg, #0f172a 0%, #a855f7 100%)",
      },
      {
        id: "monolith",
        title: "The End of Monolithic Systems",
        subtitle: "First Decoder Week edition",
        category: "Decoder Week",
        background: "linear-gradient(135deg, #0f172a 0%, #f97316 100%)",
      },
    ];
  }, [language]);

  const onboardingCards = useMemo<OnboardingCard[]>(() => {
    if (language === "pt") {
      return [
        {
          id: "welcome",
          title: "Seja bem-vindo(a) ao Projeto Decoder",
          subtitle: "Overview completo do programa",
          background: "linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)",
        },
        {
          id: "terms",
          title: "Avisos Importantes e Termos de Uso",
          subtitle: "Suporte, termos e copyright",
          background: "linear-gradient(135deg, #0f172a 0%, #06b6d4 100%)",
        },
        {
          id: "schedule",
          title: "Cronograma Projeto Decoder",
          subtitle: "Conteúdo programático completo",
          background: "linear-gradient(135deg, #0f172a 0%, #60a5fa 100%)",
        },
      ];
    }
    return [
      {
        id: "welcome",
        title: "Welcome to the Decoder Project",
        subtitle: "Complete overview to get started",
        background: "linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)",
      },
      {
        id: "terms",
        title: "Important Notices & Terms of Use",
        subtitle: "Support, usage terms and copyright",
        background: "linear-gradient(135deg, #0f172a 0%, #06b6d4 100%)",
      },
      {
        id: "schedule",
        title: "Decoder Project Roadmap",
        subtitle: "Full chronological programme",
        background: "linear-gradient(135deg, #0f172a 0%, #60a5fa 100%)",
      },
    ];
  }, [language]);

  useEffect(() => {
    async function loadBookings() {
      if (!token) return;
      setBookingsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await getUpcomingBookings(token);
        setBookingsState({ data, loading: false, error: null });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar seus agendamentos.";
        setBookingsState({ data: [], loading: false, error: message });
      }
    }

    loadBookings();
  }, [token]);

  const filteredBookingsByStatus = useFilteredBookings(
    bookingsState.data,
    bookingFilter
  );

  const monthOptions = useMemo(() => {
    const unique = new Set<string>();
    bookingsState.data.forEach((booking) => {
      unique.add(extractMonthKey(booking.requestedDate));
    });
    return ["all", ...Array.from(unique)];
  }, [bookingsState.data]);

  const filteredBookings = useMemo(() => {
    if (selectedMonth === "all") {
      return filteredBookingsByStatus;
    }
    return filteredBookingsByStatus.filter(
      (booking) => extractMonthKey(booking.requestedDate) === selectedMonth
    );
  }, [filteredBookingsByStatus, selectedMonth]);

  const confirmedCount = filteredBookings.filter(
    (booking) => booking.status === "CONFIRMED"
  ).length;
  const pendingCount = filteredBookings.filter(
    (booking) => booking.status === "PENDING"
  ).length;

  const totalMinutes = filteredBookings.reduce((sum, booking) => {
    return sum + (booking.durationMinutes ?? 60);
  }, 0);

  const progress = monthlyGoal > 0 ? Math.min(confirmedCount / monthlyGoal, 1) : 0;
  const progressPercent = Math.round(progress * 100);

  // Dados para gráficos
  const statusChartData = useMemo(() => [
    { name: "Confirmadas", value: confirmedCount, color: "#34d399" },
    { name: "Pendentes", value: pendingCount, color: "#f59e0b" },
    { name: "Restante", value: Math.max(0, monthlyGoal - confirmedCount), color: "#374151" },
  ], [confirmedCount, pendingCount, monthlyGoal]);

  const weeklyData = useMemo(() => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const counts = new Array(7).fill(0);
    
    filteredBookings.forEach((booking) => {
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
  }, [filteredBookings]);

  const handleExportReport = () => {
    if (filteredBookings.length === 0) {
      return;
    }
    const rows: string[][] = [
      ["Status", "Modalidade", "Data", "Horário", "Instrutor", "Duração (min)"],
      ...filteredBookings.map((booking) => [
        formatStatus(booking.status),
        booking.modality ?? "-",
        formatDate(booking.requestedDate),
        formatTime(booking.requestedTime),
        booking.teacherName ?? "-",
        String(booking.durationMinutes ?? 60),
      ]),
    ];
    downloadCsv("relatorio-aluno.csv", rows);
  };

  return (
    <AppLayout>
      <BackButton />
      <div className="dashboard-stack">
        <section className="content-rail">
          <div className="content-rail-header">
            <div>
              <span className="content-rail-chip">Decoder Week</span>
              <h2>
                {language === "pt"
                  ? "Todas as edições"
                  : "All editions"}
              </h2>
            </div>
            <button type="button" className="link-button content-rail-link">
              {language === "pt" ? "Ver tudo →" : "See all →"}
            </button>
          </div>
          <div className="content-rail-track">
            {featuredSeries.map((item) => (
              <article
                key={item.id}
                className="content-card"
                style={{ background: item.background }}
              >
                <span className="content-card-tag">{item.category}</span>
                <strong>{item.title}</strong>
                <p>{item.subtitle}</p>
                <button type="button" className="content-card-button">
                  {language === "pt" ? "Assistir agora" : "Watch now"}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="content-rail content-rail--mini">
          <div className="content-rail-header">
            <div>
              <span className="content-rail-chip">
                {language === "pt" ? "Boas-vindas" : "Onboarding"}
              </span>
              <h2>
                {language === "pt"
                  ? "Comece por aqui"
                  : "Start here"}
              </h2>
            </div>
            <button type="button" className="link-button content-rail-link">
              {language === "pt" ? "Ver tudo →" : "See all →"}
            </button>
          </div>
          <div className="content-rail-track">
            {onboardingCards.map((card) => (
              <article
                key={card.id}
                className="content-card content-card-mini"
                style={{ background: card.background }}
              >
                <strong>{card.title}</strong>
                <p>{card.subtitle}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="metrics-showcase">
          <div className="metrics-showcase-header">
            <div>
              <h1>{t("studentDashboardTitle")}</h1>
              <p>{t("studentDashboardSubtitle")}</p>
            </div>
            <div className="metrics-badge">
              <span>{t("monthlyGoalLabel")}</span>
              <strong>{monthlyGoal} {t("classesLabel")}</strong>
              <small>{progressPercent}% {t("ofGoalReached")}</small>
            </div>
          </div>
          <div className="metrics-grid metrics-grid-enhanced">
            <article className="metric-card neon-card">
              <span className="metric-label">{t("confirmed")}</span>
              <strong>{confirmedCount}</strong>
              <div className="metric-foot">
                <span>{t("progressMetricLabel")}</span>
                <span className="metric-chip">{progressPercent}%</span>
              </div>
            </article>
            <article className="metric-card neon-card">
              <span className="metric-label">{t("PENDING")}</span>
              <strong>{pendingCount}</strong>
              <div className="metric-foot">
                <span>{t("waitingApprovalLabel")}</span>
              </div>
            </article>
            <article className="metric-card neon-card">
              <span className="metric-label">{t("totalStudyTimeLabel")}</span>
              <strong>{Math.round(totalMinutes / 60)}</strong>
              <div className="metric-foot">
                <span>{t("hoursAbbr")}</span>
              </div>
            </article>
          </div>
        </section>

        <section className="panel glass-panel">
          <div className="panel-header">
            <div>
              <h2>{t("goalManagementTitle")}</h2>
              <p>{t("goalManagementSubtitle")}</p>
            </div>
            <div className="goal-controls">
              <label>
                <span>{t("monthlyGoalLabel")}</span>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={monthlyGoal}
                  onChange={(event) => setMonthlyGoal(Number(event.target.value))}
                />
              </label>
              <span className="goal-value">{monthlyGoal} {t("classesLabel")}</span>
            </div>
          </div>
          <div className="progress-wrapper">
            <div className="progress-track">
              <div
                className="progress-indicator"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="progress-meta">
              <span>{t("progressMetricLabel")}</span>
              <strong>{progressPercent}%</strong>
            </div>
          </div>
        </section>

        <section className="panel glass-panel">
          <div className="panel-header">
            <h2>{language === "pt" ? "Visão Geral" : "Overview"}</h2>
          </div>
          <div className="charts-grid">
            <div className="chart-container">
              <h3 className="chart-title">
                {language === "pt" ? "Status das Aulas" : "Class Status"}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
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
                {statusChartData.map((item, index) => (
                  <div key={index} className="legend-item">
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-container">
              <h3 className="chart-title">
                {language === "pt" ? "Aulas por Dia da Semana" : "Classes by Weekday"}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
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
              <h2>{t("yourUpcomingClasses")}</h2>
              <p>{t("filterAndTrack")}</p>
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
                <span>{t("monthFilterLabel")}</span>
                <select
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                >
                  {monthOptions.map((option) => {
                    const locale = language === "pt" ? "pt-BR" : "en-US";
                    const label =
                      option === "all"
                        ? t("allMonthsOption")
                        : option === "desconhecido"
                          ? language === "pt" ? "Sem data" : "No date"
                          : formatMonthLabel(option, locale);
                    return (
                      <option key={option} value={option}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </label>
              <button
                type="button"
                className="secondary-button"
                onClick={handleExportReport}
              >
                {t("exportCsv")}
              </button>
            </div>
          </div>

          {bookingsState.loading && <p className="muted">{t("loadingBookings")}</p>}
          {bookingsState.error && (
            <p className="feedback feedback-error">{bookingsState.error}</p>
          )}

          <div className="booking-list">
            {filteredBookings.map((booking) => (
              <article key={booking.id} className="booking-card">
                <header>
                  <strong>{booking.modality ?? "Modalidade"}</strong>
                  <span className={`status status-${booking.status.toLowerCase()}`}>
                    {formatStatus(booking.status)}
                  </span>
                </header>
                <ul>
                  <li>
                    <strong>{t("date")}:</strong> {formatDate(booking.requestedDate)}
                  </li>
                  <li>
                    <strong>{t("time")}:</strong> {formatTime(booking.requestedTime)}
                  </li>
                  <li>
                    <strong>{t("teacher")}:</strong>{" "}
                    {booking.teacherName ?? t("selectTeacher")}
                  </li>
                  <li>
                    <strong>{t("duration")}:</strong>{" "}
                    {booking.durationMinutes ?? 60} {t("minutes")}
                  </li>
                </ul>
              </article>
            ))}
            {filteredBookings.length === 0 && !bookingsState.loading && (
              <p className="muted">{t("noFilteredResults")}</p>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
