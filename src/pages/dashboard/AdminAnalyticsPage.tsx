import { useEffect, useMemo, useState } from "react";
import { fetchDashboardMetrics } from "../../api/analytics.ts";
import type { DashboardMetrics } from "../../api/types.ts";
import { AppLayout } from "../../components/AppLayout.tsx";
import { BackButton } from "../../components/BackButton";
import { AnalyticsHighlights } from "../../components/AnalyticsHighlights.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { useLanguage } from "../../context/LanguageContext.tsx";
import {
  createEmptyState,
  downloadCsv,
  formatPercentage,
} from "./dashboardUtils.ts";
import type { FetchState } from "./dashboardUtils.ts";

const TIMELINE_LIMIT_OPTIONS = [6, 12, 24];

export function AdminAnalyticsPage() {
  const { token } = useAuth();
  const { t, translate, language } = useLanguage();

  const [analyticsState, setAnalyticsState] = useState<
    FetchState<DashboardMetrics | null>
  >(() => createEmptyState<DashboardMetrics | null>(null));
  const [timelineLimit, setTimelineLimit] = useState<number>(6);
  const [modalitySearch, setModalitySearch] = useState<string>("");

  useEffect(() => {
    async function loadAnalytics() {
      if (!token) return;
      setAnalyticsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const metrics = await fetchDashboardMetrics(token);
        setAnalyticsState({ data: metrics, loading: false, error: null });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar as métricas do painel.";
        setAnalyticsState({ data: null, loading: false, error: message });
      }
    }

    loadAnalytics();
  }, [token]);

  const generalMetrics = analyticsState.data?.generalMetrics;
  const bookingMetrics = analyticsState.data?.bookingMetrics;

  const filteredTimeline = useMemo(() => {
    if (!analyticsState.data) return [];
    const items = analyticsState.data.growthTimeline;
    return timelineLimit ? items.slice(-timelineLimit) : items;
  }, [analyticsState.data, timelineLimit]);

  const filteredModalities = useMemo(() => {
    if (!analyticsState.data) return [];
    const term = modalitySearch.trim().toLowerCase();
    if (!term) {
      return analyticsState.data.modalityMetrics;
    }
    return analyticsState.data.modalityMetrics.filter((metric) =>
      metric.modalityName.toLowerCase().includes(term)
    );
  }, [analyticsState.data, modalitySearch]);

  const handleExportMetrics = () => {
    if (!analyticsState.data) return;
    const rows: string[][] = [
      ["Indicador", "Valor"],
      ["Usuários totais", String(generalMetrics?.totalUsers ?? 0)],
      ["Alunos", String(generalMetrics?.totalStudents ?? 0)],
      ["Instrutores", String(generalMetrics?.totalInstructors ?? 0)],
      ["Reservas", String(bookingMetrics?.totalBookings ?? 0)],
      [
        "Taxa de confirmação",
        formatPercentage(bookingMetrics?.confirmationRate ?? 0),
      ],
    ];
    downloadCsv("painel-admin.csv", rows);
  };

  const timelineOptionLabel = (value: number) =>
    language === "pt" ? `Últimos ${value}` : `Last ${value}`;

  return (
    <AppLayout>
      <BackButton to="/painel/admin" />
      <div className="dashboard-stack">
        <section className="metrics-showcase">
          <div className="metrics-showcase-header">
            <div>
              <h1>{t("adminDashboardTitle")}</h1>
              <p>{t("adminDashboardSubtitle")}</p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={handleExportMetrics}
            >
              {t("exportCsv")}
            </button>
          </div>
          <div className="metrics-grid metrics-grid-enhanced">
            <article className="metric-card neon-card">
              <span className="metric-label">{t("activeUsers")}</span>
              <strong>{generalMetrics?.totalUsers ?? 0}</strong>
              <div className="metric-foot">
                <span>{t("students")}</span>
                <span className="metric-chip">
                  {generalMetrics?.totalStudents ?? 0}
                </span>
              </div>
            </article>
            <article className="metric-card neon-card">
              <span className="metric-label">{t("instructors")}</span>
              <strong>{generalMetrics?.totalInstructors ?? 0}</strong>
              <div className="metric-foot">
                <span>{t("modalitiesActive")}</span>
                <span className="metric-chip">
                  {generalMetrics?.activeModalities ?? 0}
                </span>
              </div>
            </article>
            <article className="metric-card neon-card">
              <span className="metric-label">{t("reservations")}</span>
              <strong>{bookingMetrics?.totalBookings ?? 0}</strong>
              <div className="metric-foot">
                <span>{t("confirmationRate")}</span>
                <span className="metric-chip">
                  {formatPercentage(bookingMetrics?.confirmationRate ?? 0)}
                </span>
              </div>
            </article>
          </div>
        </section>

        {analyticsState.loading && (
          <section className="panel glass-panel">
            <p className="muted">{t("loading")}...</p>
          </section>
        )}

        {analyticsState.error && (
          <section className="panel glass-panel">
            <p className="feedback feedback-error">{analyticsState.error}</p>
          </section>
        )}

        {analyticsState.data && (
          <>
            <section className="panel glass-panel">
              <div className="panel-header">
                <div>
                  <h2>{t("growthTrend")}</h2>
                  <p>{t("usersVsReservations")}</p>
                </div>
                <div className="filter-bar">
                  <label>
                    <span>{t("timelineRangeLabel")}</span>
                    <select
                      value={timelineLimit}
                      onChange={(event) =>
                        setTimelineLimit(Number(event.target.value))
                      }
                    >
                      {TIMELINE_LIMIT_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {timelineOptionLabel(option)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <AnalyticsHighlights metrics={{ ...analyticsState.data, growthTimeline: filteredTimeline }} />
            </section>

            <section className="panel glass-panel">
              <div className="panel-header">
                <div>
                  <h2>{t("popularModalities")}</h2>
                  <p>{t("periodTrends")}</p>
                </div>
                <div className="filter-bar">
                  <label>
                    <span>{t("searchModalityLabel")}</span>
                    <input
                      type="search"
                      value={modalitySearch}
                      onChange={(event) => setModalitySearch(event.target.value)}
                      placeholder={t("searchPlaceholder")}
                    />
                  </label>
                </div>
              </div>

              <div className="admin-grid">
                <article>
                  <h3>{t("modalityOverviewTitle")}</h3>
                  <ul className="stat-list">
                    {filteredModalities.slice(0, 8).map((metric) => (
                      <li key={metric.modality}>
                        <strong>{metric.modalityName}</strong>
                        <span className="muted">
                          {metric.studentCount} {t("students")} · {metric.instructorCount} {t("instructors")}
                        </span>
                      </li>
                    ))}
                    {filteredModalities.length === 0 && (
                      <li className="muted">{t("noRecords")}</li>
                    )}
                  </ul>
                </article>

                <article>
                  <h3>{t("confirmationRates")}</h3>
                  <p>
                    {formatPercentage(bookingMetrics?.confirmationRate ?? 0)}
                    <span className="muted"> {t("ofReservationsConfirmed")}</span>
                  </p>
                  <p>
                    {bookingMetrics?.pendingBookings ?? 0} {t("pendingInPeriod")}
                  </p>
                </article>

                <article>
                  <h3>{t("hotTimes")}</h3>
                  <ul className="stat-list">
                    {analyticsState.data.popularTimeSlots.slice(0, 4).map((slot) => (
                      <li key={slot.timeSlot}>
                        <strong>{slot.timeSlot}</strong>
                        <span className="muted">
                          {slot.bookingCount} {t("reservations").toLowerCase()}
                        </span>
                      </li>
                    ))}
                    {analyticsState.data.popularTimeSlots.length === 0 && (
                      <li className="muted">{t("noRecords")}</li>
                    )}
                  </ul>
                </article>
              </div>
            </section>

            <section className="panel glass-panel">
              <div className="panel-header">
                <div>
                  <h2>{t("instructorPerformance")}</h2>
                  <p>{t("rankingByConfirmed")}</p>
                </div>
              </div>

              <div className="table-list">
                {analyticsState.data.topInstructors.slice(0, 8).map((instructor) => (
                  <div key={instructor.instructorId} className="table-row">
                    <span className="table-primary">{instructor.instructorName}</span>
                    <span>
                      {instructor.totalBookings} {t("reservations").toLowerCase()}
                    </span>
                    <span>
                      {formatPercentage(instructor.confirmationRate)} {t("ofConfirmation")}
                    </span>
                    <span className="muted">
                      {(instructor.modalities ?? []).length > 0
                        ? instructor.modalities.join(", ")
                        : translate("noDataYet")}
                    </span>
                  </div>
                ))}

                {analyticsState.data.topInstructors.length === 0 && (
                  <p className="muted">{t("noRecords")}</p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
