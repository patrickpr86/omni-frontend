import { useState, useEffect } from "react";
import { AppLayout } from "../components/AppLayout";
import { BackButton } from "../components/BackButton";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  getUserAgenda,
  type AgendaItem,
  formatDate,
  formatTime,
  getMonthName,
} from "../api/timeline";

export function MyAgendaPage() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadAgenda();
  }, [token, selectedMonth, selectedYear]);

  const loadAgenda = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getUserAgenda(token, selectedYear, selectedMonth);
      setAgendaItems(data);
    } catch (error) {
      console.error("Error loading agenda:", error);
      alert(language === "pt" ? "Erro ao carregar agenda" : "Error loading agenda");
    } finally {
      setLoading(false);
    }
  };

  // Agrupar itens por data
  const itemsByDate = agendaItems.reduce((acc, item) => {
    const dateKey = item.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, AgendaItem[]>);

  const sortedDates = Object.keys(itemsByDate).sort();

  return (
    <AppLayout>
      <BackButton />
      <div className="page-header">
        <div>
          <h1 className="page-title">
            📅 {language === "pt" ? "Minha Agenda" : "My Agenda"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {language === "pt"
              ? "Visualize todos os seus eventos e aulas do mês"
              : "View all your events and classes for the month"}
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

      {/* Agenda Items */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{language === "pt" ? "Carregando agenda..." : "Loading agenda..."}</p>
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="modern-card" style={{ textAlign: "center", padding: "60px 40px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📅</div>
          <h3 style={{ marginBottom: "8px" }}>
            {language === "pt" ? "Nenhum item na agenda" : "No items in agenda"}
          </h3>
          <p style={{ color: "var(--text-muted)" }}>
            {language === "pt"
              ? `Você não tem eventos ou aulas agendadas para ${getMonthName(selectedMonth)} de ${selectedYear}`
              : `You have no events or classes scheduled for ${getMonthName(selectedMonth)} ${selectedYear}`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {sortedDates.map((dateKey) => {
            const items = itemsByDate[dateKey];
            const date = new Date(dateKey);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div key={dateKey} className="modern-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "20px",
                    paddingBottom: "16px",
                    borderBottom: "2px solid var(--border-color)",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isToday
                        ? "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))"
                        : "var(--bg-secondary)",
                      borderRadius: "12px",
                      color: isToday ? "white" : "var(--text-primary)",
                      fontWeight: "700",
                    }}
                  >
                    <div style={{ fontSize: "20px" }}>{date.getDate()}</div>
                    <div style={{ fontSize: "11px", textTransform: "uppercase" }}>
                      {date.toLocaleDateString("pt-BR", { month: "short" })}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>
                      {formatDate(dateKey)}
                      {isToday && (
                        <span
                          style={{
                            marginLeft: "12px",
                            padding: "4px 12px",
                            background: "var(--accent-primary)",
                            color: "white",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {language === "pt" ? "Hoje" : "Today"}
                        </span>
                      )}
                    </h3>
                    <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "14px" }}>
                      {items.length}{" "}
                      {items.length === 1
                        ? language === "pt"
                          ? "item"
                          : "item"
                        : language === "pt"
                        ? "itens"
                        : "items"}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {items.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      style={{
                        padding: "16px",
                        background: "var(--bg-secondary)",
                        borderRadius: "12px",
                        border: "1px solid var(--border-color)",
                        display: "flex",
                        gap: "16px",
                        alignItems: "start",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--bg-tertiary)";
                        e.currentTarget.style.borderColor = "var(--accent-primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--bg-secondary)";
                        e.currentTarget.style.borderColor = "var(--border-color)";
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background:
                            item.type === "EVENT"
                              ? "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))"
                              : "linear-gradient(135deg, var(--success), #22c55e)",
                          borderRadius: "10px",
                          fontSize: "24px",
                          flexShrink: 0,
                        }}
                      >
                        {item.type === "EVENT" ? "📅" : "💪"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
                            {item.title}
                          </h4>
                          <span
                            style={{
                              padding: "4px 8px",
                              background:
                                item.status === "CONFIRMED"
                                  ? "var(--success)"
                                  : item.status === "PENDING"
                                  ? "var(--warning)"
                                  : "var(--error)",
                              color: "white",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "600",
                              textTransform: "uppercase",
                            }}
                          >
                            {item.status}
                          </span>
                        </div>
                        {item.description && (
                          <p
                            style={{
                              margin: "0 0 8px 0",
                              color: "var(--text-secondary)",
                              fontSize: "14px",
                            }}
                          >
                            {item.description}
                          </p>
                        )}
                        <div
                          style={{
                            display: "flex",
                            gap: "16px",
                            flexWrap: "wrap",
                            fontSize: "13px",
                            color: "var(--text-muted)",
                          }}
                        >
                          {item.time && (
                            <span>
                              🕐 {formatTime(item.time)}
                            </span>
                          )}
                          {item.location && (
                            <span>
                              📍 {item.location}
                            </span>
                          )}
                          <span
                            style={{
                              padding: "2px 8px",
                              background: "var(--bg-tertiary)",
                              borderRadius: "6px",
                              fontSize: "12px",
                            }}
                          >
                            {item.type === "EVENT"
                              ? language === "pt"
                                ? "Evento"
                                : "Event"
                              : language === "pt"
                              ? "Aula"
                              : "Class"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}

