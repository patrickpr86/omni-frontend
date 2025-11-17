import { useState, useEffect } from "react";
import { AppLayout } from "@/shared/components/AppLayout";
import { BackButton } from "@/shared/components/BackButton";
import { useAuth } from "@/core/context/AuthContext.tsx";
import { useLanguage } from "@/core/context/LanguageContext.tsx";
import {
  getChampionships,
  confirmEventRegistration,
  type TimelineEvent,
  formatDate,
  formatTime,
  getMonthName,
} from "@/modules/timeline/api/timeline.ts";

interface ChampionshipModalProps {
  championship: TimelineEvent | null;
  onClose: () => void;
  language: string;
  token: string;
  onRegistrationConfirmed?: () => void;
}

function ChampionshipModal({ 
  championship, 
  onClose, 
  language, 
  token,
  onRegistrationConfirmed 
}: ChampionshipModalProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  if (!championship) return null;

  const handleConfirmRegistration = async () => {
    try {
      setIsRegistering(true);
      await confirmEventRegistration(token, championship.id);
      setIsRegistered(true);
      if (onRegistrationConfirmed) {
        onRegistrationConfirmed();
      }
      // Não fechar o modal imediatamente, mostrar mensagem de sucesso
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error confirming registration:", error);
      alert(language === "pt" ? "Erro ao confirmar inscrição" : "Error confirming registration");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="modern-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-primary)",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, marginBottom: "8px", fontSize: "24px" }}>{championship.title}</h2>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "14px", color: "var(--text-secondary)" }}>
              <span>📅 {formatDate(championship.eventDate)}</span>
              {championship.eventTime && <span>🕐 {formatTime(championship.eventTime)}</span>}
              {championship.location && <span>📍 {championship.location}</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "var(--text-secondary)",
              padding: "4px 8px",
              borderRadius: "8px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-secondary)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {championship.description && (
            <div>
              <h3 style={{ marginBottom: "12px", fontSize: "18px", color: "var(--accent-primary)" }}>
                {language === "pt" ? "Descrição" : "Description"}
              </h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>{championship.description}</p>
            </div>
          )}

        </div>

        {/* Footer with Action Buttons */}
        <div
          style={{
            padding: "20px 24px",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleConfirmRegistration}
            disabled={isRegistering || isRegistered}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: isRegistered 
                ? "var(--success)" 
                : "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "15px",
              cursor: isRegistering || isRegistered ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              opacity: isRegistering ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isRegistering && !isRegistered) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.2)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {isRegistering ? (
              <>⏳ {language === "pt" ? "Confirmando..." : "Confirming..."}</>
            ) : isRegistered ? (
              <>✅ {language === "pt" ? "Inscrição Confirmada!" : "Registration Confirmed!"}</>
            ) : (
              <>✓ {language === "pt" ? "Confirmar Inscrição" : "Confirm Registration"}</>
            )}
          </button>

          {championship.externalUrl && (
            <a
              href={championship.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                // Fechar modal imediatamente ao clicar no link
                e.stopPropagation();
                onClose();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                textDecoration: "none",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "15px",
                border: "1px solid var(--border-color)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.background = "var(--bg-tertiary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "var(--bg-secondary)";
              }}
            >
              ✍️ {language === "pt" ? "Inscrever-se" : "Register"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChampionshipsPage() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [championships, setChampionships] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedChampionship, setSelectedChampionship] = useState<TimelineEvent | null>(null);

  useEffect(() => {
    loadChampionships();
  }, [token, selectedMonth, selectedYear]);

  const loadChampionships = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getChampionships(token, selectedYear, selectedMonth);
      setChampionships(data);
    } catch (error) {
      console.error("Error loading championships:", error);
      alert("Erro ao carregar campeonatos");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (championship: TimelineEvent) => {
    setSelectedChampionship(championship);
  };

  return (
    <AppLayout>
      <BackButton />
      <div className="page-header">
        <div>
          <h1 className="page-title">
            🏆 {language === "pt" ? "Campeonatos" : "Championships"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {language === "pt"
              ? "Explore todos os campeonatos disponíveis"
              : "Explore all available championships"}
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

      {/* Championships List */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{language === "pt" ? "Carregando campeonatos..." : "Loading championships..."}</p>
        </div>
      ) : championships.length === 0 ? (
        <div className="modern-card" style={{ textAlign: "center", padding: "60px 40px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏆</div>
          <h3 style={{ marginBottom: "8px" }}>
            {language === "pt" ? "Nenhum campeonato encontrado" : "No championships found"}
          </h3>
          <p style={{ color: "var(--text-muted)" }}>
            {language === "pt"
              ? `Não há campeonatos cadastrados para ${getMonthName(selectedMonth)} de ${selectedYear}`
              : `No championships registered for ${getMonthName(selectedMonth)} ${selectedYear}`}
          </p>
        </div>
      ) : (
        <div className="modern-grid">
          {championships.map((championship) => (
            <div
              key={championship.id}
              className="modern-card"
              onClick={() => handleCardClick(championship)}
              style={{
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", gap: "16px", alignItems: "start" }}>
                <div
                  className="event-icon"
                  style={{
                    width: "60px",
                    height: "60px",
                    fontSize: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                    borderRadius: "12px",
                    flexShrink: 0,
                  }}
                >
                  🏆
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: "12px", fontSize: "20px" }}>{championship.title}</h3>

                  {championship.description && (
                    <p style={{ color: "var(--text-secondary)", marginBottom: "16px", fontSize: "14px" }}>
                      {championship.description}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      fontSize: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "var(--text-muted)" }}>📅</span>
                      <span>{formatDate(championship.eventDate)}</span>
                      {championship.eventTime && (
                        <>
                          <span style={{ color: "var(--text-muted)", margin: "0 4px" }}>•</span>
                          <span>🕐 {formatTime(championship.eventTime)}</span>
                        </>
                      )}
                    </div>

                    {championship.location && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "var(--text-muted)" }}>📍</span>
                        <span>{championship.location}</span>
                      </div>
                    )}

                    {championship.isExternal && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "8px 12px",
                          background: "var(--warning)",
                          color: "white",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "600",
                          display: "inline-flex",
                        }}
                      >
                        {language === "pt" ? "Externo" : "External"}
                      </div>
                    )}

                    <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--text-muted)" }}>
                      {language === "pt" ? "Clique para ver detalhes completos" : "Click to view full details"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedChampionship && (
        <ChampionshipModal
          championship={selectedChampionship}
          onClose={() => setSelectedChampionship(null)}
          language={language}
          token={token || ""}
          onRegistrationConfirmed={() => {
            // Recarregar campeonatos se necessário
            loadChampionships();
          }}
        />
      )}
    </AppLayout>
  );
}
