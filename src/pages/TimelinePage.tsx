import { useState, useEffect } from "react";
import { AppLayout } from "../components/AppLayout";
import { BackButton } from "../components/BackButton";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  getTimelineEvents,
  type TimelineEvent,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_ICONS,
  formatDate,
  formatTime,
  getMonthName,
  formatPrice,
} from "../api/timeline";

export function TimelinePage() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState<string>("ALL");

  useEffect(() => {
    loadEvents();
  }, [token, selectedMonth, selectedYear]);

  const loadEvents = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getTimelineEvents(token, selectedYear, selectedMonth);
      setEvents(data);
    } catch (error) {
      console.error("Error loading timeline events:", error);
      alert("Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents =
    filterType === "ALL"
      ? events
      : events.filter((e) => e.eventType === filterType);

  const eventsByDate = filteredEvents.reduce((acc, event) => {
    const date = event.eventDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  // Apenas os dias que têm eventos
  const sortedDates = Object.keys(eventsByDate).sort();

  const allEventTypes = Array.from(new Set(events.map((e) => e.eventType)));

  const handleExternalClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AppLayout>
      <BackButton />
      <div className="page-header">
        <div>
          <h1 className="page-title">
            📅 {language === "pt" ? "Eventos" : "Events"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {language === "pt"
              ? "Acompanhe todos os eventos, campeonatos e atividades do mês"
              : "Track all events, championships and activities of the month"}
          </p>
        </div>
      </div>

      {/* Month/Year Selector */}
      <div className="modern-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <label className="form-field" style={{ margin: 0 }}>
            <span>{language === "pt" ? "Mês" : "Month"}</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="form-input"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field" style={{ margin: 0 }}>
            <span>{language === "pt" ? "Ano" : "Year"}</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="form-input"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>
          </label>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontWeight: "500" }}>
            {language === "pt" ? "Filtrar por tipo:" : "Filter by type:"}
          </span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-input"
            style={{ width: "auto", minWidth: "200px" }}
          >
            <option value="ALL">
              {language === "pt" ? "Todos os tipos" : "All types"}
            </option>
            {allEventTypes.map((type) => (
              <option key={type} value={type}>
                {EVENT_TYPE_LABELS[type] || type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{language === "pt" ? "Carregando eventos..." : "Loading events..."}</p>
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="modern-card" style={{ textAlign: "center", padding: "60px 40px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📅</div>
          <h3 style={{ marginBottom: "8px" }}>
            {language === "pt" ? "Nenhum evento encontrado" : "No events found"}
          </h3>
          <p style={{ color: "var(--text-muted)" }}>
            {language === "pt"
              ? `Não há eventos cadastrados para ${getMonthName(selectedMonth)} de ${selectedYear}`
              : `No events registered for ${getMonthName(selectedMonth)} ${selectedYear}`}
          </p>
        </div>
      ) : (
        <div className="timeline-container">
          {sortedDates.map((date) => (
            <div key={date} className="timeline-day">
              <div className="timeline-date-header">
                <div className="timeline-date-marker"></div>
                <h3 className="timeline-date-title">{formatDate(date)}</h3>
              </div>

              <div className="timeline-events">
                {eventsByDate[date].map((event) => (
                  <div
                    key={event.id}
                    className={`timeline-event-card ${event.isExternal ? "external-event" : ""}`}
                    onClick={() => {
                      if (event.externalUrl) {
                        handleExternalClick(event.externalUrl);
                      }
                    }}
                    style={{
                      cursor: event.externalUrl ? "pointer" : "default",
                    }}
                  >
                    <div className="event-icon">
                      {EVENT_TYPE_ICONS[event.eventType] || "📅"}
                    </div>

                    <div className="event-content">
                      <div className="event-header">
                        <h4 className="event-title">{event.title}</h4>
                        <div className="event-badges">
                          <span className="event-type-badge">
                            {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                          </span>
                          {event.isExternal && (
                            <span className="event-external-badge">
                              {language === "pt" ? "Externo" : "External"}
                            </span>
                          )}
                        </div>
                      </div>

                      {event.description && (
                        <p className="event-description">{event.description}</p>
                      )}

                      <div className="event-details">
                        {event.eventTime && (
                          <span className="event-detail">
                            🕐 {formatTime(event.eventTime)}
                          </span>
                        )}
                        {event.location && (
                          <span className="event-detail">📍 {event.location}</span>
                        )}
                        {!event.isExternal && event.registrationPrice && (
                          <span className="event-detail" style={{ fontWeight: "600", color: "var(--accent-primary)" }}>
                            💰 {formatPrice(event.registrationPrice)}
                          </span>
                        )}
                        {!event.isExternal && event.prizePool && (
                          <span className="event-detail" style={{ fontWeight: "600", color: "var(--success)" }}>
                            🏆 Premiação: {formatPrice(event.prizePool)}
                          </span>
                        )}
                        {event.externalUrl && (
                          <span className="event-detail event-link">
                            🔗 {language === "pt" ? "Ver detalhes" : "View details"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
