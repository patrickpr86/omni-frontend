import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/shared/components/AppLayout";
import { BackButton } from "@/shared/components/BackButton";
import { useAuth } from "@/core/context/AuthContext.tsx";
import { useLanguage } from "@/core/context/LanguageContext.tsx";
import {
  getAvailableTeachers,
  type AvailableTeacher,
  MODALITY_LABELS,
  DAY_LABELS,
} from "@/modules/scheduling/api/bookings.ts";

export function AvailableTeachersPage() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<AvailableTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModality, setFilterModality] = useState<string>("ALL");

  useEffect(() => {
    loadTeachers();
  }, [token]);

  const loadTeachers = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getAvailableTeachers(token);
      setTeachers(data);
    } catch (error) {
      console.error("Error loading teachers:", error);
      alert("Erro ao carregar professores");
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers =
    filterModality === "ALL"
      ? teachers
      : teachers.filter((t) => t.modalities.includes(filterModality));

  const allModalities = Array.from(
    new Set(teachers.flatMap((t) => t.modalities))
  );

  return (
    <AppLayout>
      <BackButton />
      <div className="page-header">
        <div>
          <h1 className="page-title">
            👨‍🏫 {language === "pt" ? "Agendar Aula Particular" : "Schedule Private Lesson"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {language === "pt"
              ? "Escolha um professor e agende sua aula particular"
              : "Choose a teacher and schedule your private lesson"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontWeight: "500" }}>
            {language === "pt" ? "Filtrar por modalidade:" : "Filter by modality:"}
          </span>
          <select
            value={filterModality}
            onChange={(e) => setFilterModality(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
            }}
          >
            <option value="ALL">
              {language === "pt" ? "Todas as modalidades" : "All modalities"}
            </option>
            {allModalities.map((modality) => (
              <option key={modality} value={modality}>
                {MODALITY_LABELS[modality] || modality}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Grid */}
      {loading ? (
        <p>{language === "pt" ? "Carregando..." : "Loading..."}</p>
      ) : filteredTeachers.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--text-muted)" }}>
            {language === "pt"
              ? "Nenhum professor disponível no momento"
              : "No teachers available at the moment"}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="panel" style={{ position: "relative" }}>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "20px", marginBottom: "4px" }}>
                    {teacher.fullName || teacher.username}
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    @{teacher.username}
                  </p>
                </div>
                {teacher.isAvailable && (
                  <span
                    style={{
                      padding: "4px 12px",
                      background: "#d1fae5",
                      color: "#065f46",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {language === "pt" ? "Disponível" : "Available"}
                  </span>
                )}
              </div>

              {/* Experience */}
              {teacher.experienceYears && (
                <p style={{ marginBottom: "12px", fontSize: "14px" }}>
                  <strong>{language === "pt" ? "Experiência:" : "Experience:"}</strong>{" "}
                  {teacher.experienceYears}{" "}
                  {teacher.experienceYears === 1
                    ? language === "pt"
                      ? "ano"
                      : "year"
                    : language === "pt"
                    ? "anos"
                    : "years"}
                </p>
              )}

              {/* Certification */}
              {teacher.certificationLevel && (
                <p style={{ marginBottom: "12px", fontSize: "14px" }}>
                  <strong>{language === "pt" ? "Certificação:" : "Certification:"}</strong>{" "}
                  {teacher.certificationLevel}
                </p>
              )}

              {/* Modalities */}
              <div style={{ marginBottom: "12px" }}>
                <strong style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>
                  {language === "pt" ? "Modalidades:" : "Modalities:"}
                </strong>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {teacher.modalities.map((modality) => (
                    <span
                      key={modality}
                      style={{
                        padding: "4px 10px",
                        background: "var(--bg-tertiary)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      {MODALITY_LABELS[modality] || modality}
                    </span>
                  ))}
                </div>
              </div>

              {/* Available Days */}
              <div style={{ marginBottom: "16px" }}>
                <strong style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>
                  {language === "pt" ? "Dias disponíveis:" : "Available days:"}
                </strong>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {teacher.availableDays.map((day) => (
                    <span
                      key={day}
                      style={{
                        padding: "3px 8px",
                        background: "var(--accent-primary)",
                        color: "#fff",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {DAY_LABELS[day] || day}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact */}
              {teacher.phoneNumber && (
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                  📱 {teacher.phoneNumber}
                </p>
              )}

              {/* Action Button */}
              <button
                className="button"
                onClick={() => navigate(`/agendar-aula/${teacher.id}`)}
                disabled={!teacher.isAvailable}
                style={{ width: "100%" }}
              >
                {language === "pt" ? "Agendar Aula" : "Schedule Lesson"}
              </button>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

