import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/shared/components/AppLayout";
import { BackButton } from "@/shared/components/BackButton";
import { useAuth } from "@/core/context/AuthContext.tsx";
import { useLanguage } from "@/core/context/LanguageContext.tsx";
import {
  getAvailableTeachers,
  createBooking,
  type AvailableTeacher,
  type CreateBookingRequest,
  MODALITY_LABELS,
  DAY_LABELS,
} from "@/modules/scheduling/api/bookings.ts";

export function BookLessonPage() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const { token } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState<AvailableTeacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateBookingRequest>({
    teacherId: parseInt(teacherId || "0"),
    modality: "",
    requestedDate: "",
    requestedTime: "",
    durationMinutes: 60,
    studentNotes: "",
    location: "",
  });

  useEffect(() => {
    loadTeacher();
  }, [token, teacherId]);

  const loadTeacher = async () => {
    if (!token || !teacherId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const teachers = await getAvailableTeachers(token);
      const found = teachers.find((t) => t.id === parseInt(teacherId));
      if (found) {
        setTeacher(found);
        if (found.modalities.length > 0) {
          setFormData((prev) => ({ ...prev, modality: found.modalities[0] }));
        }
      } else {
        alert("Professor não encontrado");
        navigate("/professores-disponiveis");
      }
    } catch (error) {
      console.error("Error loading teacher:", error);
      alert("Erro ao carregar professor");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.modality || !formData.requestedDate || !formData.requestedTime) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setSubmitting(true);
      await createBooking(token, formData);
      alert("Agendamento solicitado com sucesso! Aguarde a confirmação do professor.");
      navigate("/minhas-aulas");
    } catch (error: any) {
      console.error("Error creating booking:", error);
      alert(error.message || "Erro ao criar agendamento");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <p>{language === "pt" ? "Carregando..." : "Loading..."}</p>
      </AppLayout>
    );
  }

  if (!teacher) {
    return (
      <AppLayout>
        <p>{language === "pt" ? "Professor não encontrado" : "Teacher not found"}</p>
      </AppLayout>
    );
  }

  // Get min date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <AppLayout>
      <BackButton to="/professores-disponiveis" />
      <div className="page-header">
        <div>
          <button
            className="button button-secondary"
            onClick={() => navigate("/professores-disponiveis")}
            style={{ marginBottom: "16px" }}
          >
            ← {language === "pt" ? "Voltar" : "Back"}
          </button>
          <h1 className="page-title">
            📅 {language === "pt" ? "Agendar Aula Particular" : "Schedule Private Lesson"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {language === "pt" ? "Com" : "With"} {teacher.fullName || teacher.username}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* Teacher Info */}
        <div className="panel">
          <h2 style={{ marginBottom: "16px" }}>
            {language === "pt" ? "Informações do Professor" : "Teacher Information"}
          </h2>

          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>
              {teacher.fullName || teacher.username}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>@{teacher.username}</p>
          </div>

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

          {teacher.certificationLevel && (
            <p style={{ marginBottom: "16px", fontSize: "14px" }}>
              <strong>{language === "pt" ? "Certificação:" : "Certification:"}</strong>{" "}
              {teacher.certificationLevel}
            </p>
          )}

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

          <div>
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
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="panel">
          <h2 style={{ marginBottom: "16px" }}>
            {language === "pt" ? "Dados do Agendamento" : "Booking Details"}
          </h2>

          <label className="form-field">
            <span>{language === "pt" ? "Modalidade" : "Modality"} *</span>
            <select
              value={formData.modality}
              onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
              required
              className="form-input"
            >
              <option value="">{language === "pt" ? "Selecione..." : "Select..."}</option>
              {teacher.modalities.map((modality) => (
                <option key={modality} value={modality}>
                  {MODALITY_LABELS[modality] || modality}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>{language === "pt" ? "Data" : "Date"} *</span>
            <input
              type="date"
              value={formData.requestedDate}
              onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
              required
              min={today}
              className="form-input"
            />
          </label>

          <label className="form-field">
            <span>{language === "pt" ? "Horário" : "Time"} *</span>
            <input
              type="time"
              value={formData.requestedTime}
              onChange={(e) => setFormData({ ...formData, requestedTime: e.target.value })}
              required
              className="form-input"
            />
          </label>

          <label className="form-field">
            <span>{language === "pt" ? "Duração (minutos)" : "Duration (minutes)"}</span>
            <select
              value={formData.durationMinutes}
              onChange={(e) =>
                setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })
              }
              className="form-input"
            >
              <option value={30}>30 {language === "pt" ? "minutos" : "minutes"}</option>
              <option value={60}>60 {language === "pt" ? "minutos" : "minutes"}</option>
              <option value={90}>90 {language === "pt" ? "minutos" : "minutes"}</option>
              <option value={120}>120 {language === "pt" ? "minutos" : "minutes"}</option>
            </select>
          </label>

          <label className="form-field">
            <span>{language === "pt" ? "Local" : "Location"}</span>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="form-input"
              placeholder={language === "pt" ? "Academia, endereço, etc." : "Gym, address, etc."}
            />
          </label>

          <label className="form-field">
            <span>{language === "pt" ? "Observações" : "Notes"}</span>
            <textarea
              value={formData.studentNotes}
              onChange={(e) => setFormData({ ...formData, studentNotes: e.target.value })}
              className="form-input"
              rows={4}
              placeholder={
                language === "pt"
                  ? "Adicione informações importantes para o professor..."
                  : "Add important information for the teacher..."
              }
            />
          </label>

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button type="submit" className="button" disabled={submitting} style={{ flex: 1 }}>
              {submitting
                ? language === "pt"
                  ? "Enviando..."
                  : "Submitting..."
                : language === "pt"
                ? "Solicitar Agendamento"
                : "Request Booking"}
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => navigate("/professores-disponiveis")}
            >
              {language === "pt" ? "Cancelar" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

