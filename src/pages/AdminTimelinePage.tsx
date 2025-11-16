import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { AppLayout } from "../components/AppLayout";
import { BackButton } from "../components/BackButton";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  getTimelineEvents,
  createTimelineEvent,
  syncChampionships,
  type TimelineEvent,
  type CreateTimelineEventRequest,
  EVENT_TYPE_LABELS,
  formatDate,
  formatTime,
  formatPrice,
} from "../api/timeline";
import { SyncIcon, CalendarIcon, TrophyIcon, EventIcon, LocationIcon, ClockIcon, MoneyIcon, PlusIcon } from "../components/Icons";

export function AdminTimelinePage() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [formData, setFormData] = useState<CreateTimelineEventRequest>({
    title: "",
    description: "",
    eventType: "CHAMPIONSHIP",
    target: "ALL",
    eventDate: "",
    eventTime: "",
    location: "",
    externalUrl: "",
    imageUrl: "",
    registrationPrice: undefined,
    prizePool: undefined,
  });

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
      console.error("Error loading events:", error);
      alert("Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await createTimelineEvent(token, formData);
      alert("Evento criado com sucesso!");
      setShowForm(false);
      resetForm();
      loadEvents();
    } catch (error: any) {
      console.error("Error creating event:", error);
      alert(error.message || "Erro ao criar evento");
    }
  };

  const handleSync = async () => {
    if (!token) return;
    if (!confirm("Deseja sincronizar os campeonatos do soucompetidor.com.br agora?")) return;

    try {
      setSyncing(true);
      const response = await syncChampionships(token);
      if (response.synced) {
        alert("Sincronização concluída com sucesso!");
        setTimeout(() => loadEvents(), 2000);
      } else {
        alert(response.message || "Já existem campeonatos para este mês no banco de dados.");
      }
    } catch (error: any) {
      console.error("Error syncing:", error);
      alert(error.message || "Erro ao sincronizar");
    } finally {
      setSyncing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      eventType: "CHAMPIONSHIP",
      target: "ALL",
      eventDate: "",
      eventTime: "",
      location: "",
      externalUrl: "",
      imageUrl: "",
      registrationPrice: undefined,
      prizePool: undefined,
    });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <AppLayout>
      <BackButton to="/painel/admin" />
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <CalendarIcon size={28} />
            {language === "pt" ? "Gerenciar Timeline" : "Manage Timeline"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {language === "pt"
              ? "Crie e gerencie eventos na timeline da plataforma"
              : "Create and manage events in the platform timeline"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="button button-secondary" onClick={handleSync} disabled={syncing} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <SyncIcon size={18} style={{ opacity: syncing ? 0.7 : 1 }} />
            {syncing
              ? language === "pt"
                ? "Sincronizando..."
                : "Syncing..."
              : language === "pt"
              ? "Sincronizar Campeonatos"
              : "Sync Championships"}
          </button>
          <button className="button" onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {showForm ? (
              language === "pt" ? "Cancelar" : "Cancel"
            ) : (
              <>
                <PlusIcon size={18} />
                {language === "pt" ? "Novo Evento" : "New Event"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="modern-card" style={{ marginBottom: "24px" }}>
          <h2 style={{ marginBottom: "20px" }}>
            {language === "pt" ? "Criar Novo Evento" : "Create New Event"}
          </h2>

          <div className="form-grid">
            <label className="form-field">
              <span>{language === "pt" ? "Título" : "Title"} *</span>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="form-input"
                placeholder={language === "pt" ? "Nome do evento" : "Event name"}
              />
            </label>

            <label className="form-field">
              <span>{language === "pt" ? "Tipo de Evento" : "Event Type"} *</span>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                required
                className="form-input"
              >
                {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>{language === "pt" ? "Público-Alvo" : "Target"} *</span>
              <select
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                required
                className="form-input"
              >
                <option value="ALL">{language === "pt" ? "Todos" : "All"}</option>
                <option value="STUDENT">{language === "pt" ? "Alunos" : "Students"}</option>
                <option value="INSTRUCTOR">
                  {language === "pt" ? "Instrutores" : "Instructors"}
                </option>
              </select>
            </label>

            <label className="form-field">
              <span>{language === "pt" ? "Data" : "Date"} *</span>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
                min={today}
                className="form-input"
              />
            </label>

            <label className="form-field">
              <span>{language === "pt" ? "Horário" : "Time"}</span>
              <input
                type="time"
                value={formData.eventTime}
                onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                className="form-input"
              />
            </label>

            <label className="form-field">
              <span>{language === "pt" ? "Local" : "Location"}</span>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="form-input"
                placeholder={language === "pt" ? "Local do evento" : "Event location"}
              />
            </label>
          </div>

          <label className="form-field">
            <span>{language === "pt" ? "Descrição" : "Description"}</span>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-input"
              rows={4}
              placeholder={language === "pt" ? "Descrição do evento..." : "Event description..."}
            />
          </label>

          <div className="form-grid">
            <label className="form-field">
              <span>{language === "pt" ? "URL Externa" : "External URL"}</span>
              <input
                type="url"
                value={formData.externalUrl}
                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                className="form-input"
                placeholder="https://..."
              />
            </label>

            <label className="form-field">
              <span>{language === "pt" ? "URL da Imagem" : "Image URL"}</span>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="form-input"
                placeholder="https://..."
              />
            </label>

            <label className="form-field">
              <span>{language === "pt" ? "Valor da Inscrição (R$)" : "Registration Price (R$)"}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.registrationPrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registrationPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className="form-input"
                placeholder={language === "pt" ? "Ex: 150.00" : "Ex: 150.00"}
              />
            </label>

            <label className="form-field">
              <span>{language === "pt" ? "Premiação Total (R$)" : "Prize Pool (R$)"}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.prizePool || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    prizePool: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className="form-input"
                placeholder={language === "pt" ? "Ex: 50000.00" : "Ex: 50000.00"}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button type="submit" className="button">
              {language === "pt" ? "Criar Evento" : "Create Event"}
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              {language === "pt" ? "Cancelar" : "Cancel"}
            </button>
          </div>
        </form>
      )}

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
                  {new Date(2000, month - 1, 1).toLocaleDateString("pt-BR", { month: "long" })}
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

      {/* Events List */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{language === "pt" ? "Carregando..." : "Loading..."}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="modern-card" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--text-muted)" }}>
            {language === "pt" ? "Nenhum evento encontrado" : "No events found"}
          </p>
        </div>
      ) : (
        <div className="modern-grid">
          {events.map((event) => (
            <div key={event.id} className="modern-card">
              <div style={{ display: "flex", gap: "12px", alignItems: "start", marginBottom: "12px" }}>
                <div className="event-icon" style={{ width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <EventIcon size={32} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: "8px" }}>{event.title}</h3>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                    <span className="event-type-badge">
                      {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                    </span>
                    <span className="event-type-badge">{event.targetDisplay}</span>
                    {event.isExternal && (
                      <span className="event-external-badge">
                        {language === "pt" ? "Externo" : "External"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {event.description && (
                <p style={{ color: "var(--text-secondary)", marginBottom: "12px", fontSize: "14px" }}>
                  {event.description}
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CalendarIcon size={14} />
                  {formatDate(event.eventDate)}
                </div>
                {event.eventTime && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <ClockIcon size={14} />
                    {formatTime(event.eventTime)}
                  </div>
                )}
                {event.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <LocationIcon size={14} />
                    {event.location}
                  </div>
                )}
                {!event.isExternal && event.registrationPrice && (
                  <div style={{ fontWeight: "600", color: "var(--accent-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <MoneyIcon size={14} />
                    {formatPrice(event.registrationPrice)}
                  </div>
                )}
                {!event.isExternal && event.prizePool && (
                  <div style={{ fontWeight: "600", color: "var(--success)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <TrophyIcon size={14} />
                    Premiação: {formatPrice(event.prizePool)}
                  </div>
                )}
                {event.externalUrl && (
                  <div>
                    <a
                      href={event.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--accent-primary)", textDecoration: "none" }}
                    >
                      🔗 {language === "pt" ? "Ver detalhes" : "View details"}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
