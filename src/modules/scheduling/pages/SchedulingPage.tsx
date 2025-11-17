import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  fetchClasses,
  fetchModalities,
} from "@/modules/scheduling/api/classes.ts";
import {
  cancelBooking,
  createBooking,
  getAvailableTeachers,
  getUpcomingBookings,
} from "@/modules/scheduling/api/bookings.ts";
import type {
  AvailableTeacher,
  Booking,
  MartialArtClass,
} from "@/shared/api/types.ts";
import { AppLayout } from "@/shared/components/AppLayout.tsx";
import { BackButton } from "@/shared/components/BackButton";
import { useAuth } from "@/core/context/AuthContext.tsx";
import { useLanguage } from "@/core/context/LanguageContext.tsx";
import {
  createEmptyState,
  defaultBookingFilter,
  downloadCsv,
  formatDate,
  formatStatus,
  formatTime,
  useFilteredBookings,
} from "@/modules/dashboard/utils/dashboardUtils.ts";
import type { BookingFilter, FetchState } from "@/modules/dashboard/utils/dashboardUtils.ts";

type BookingFormState = {
  teacherId: string;
  modality: string;
  requestedDate: string;
  requestedTime: string;
  durationMinutes: number;
  studentNotes: string;
  location: string;
};

export function SchedulingPage() {
  const { token, user } = useAuth();
  const { t } = useLanguage();

  const [classesState, setClassesState] = useState<FetchState<MartialArtClass[]>>(
    () => createEmptyState([])
  );
  const [modalitiesState, setModalitiesState] = useState<FetchState<string[]>>(
    () => createEmptyState([])
  );
  const [availableTeachersState, setAvailableTeachersState] = useState<
    FetchState<AvailableTeacher[]>
  >(() => createEmptyState([]));
  const [upcomingBookingsState, setUpcomingBookingsState] = useState<
    FetchState<Booking[]>
  >(() => createEmptyState([]));
  const [submitFeedback, setSubmitFeedback] = useState<
    { type: "info" | "error"; message: string } | null
  >(null);
  const [bookingFilter, setBookingFilter] =
    useState<BookingFilter>(defaultBookingFilter);
  const [bookingForm, setBookingForm] = useState<BookingFormState>({
    teacherId: "",
    modality: "",
    requestedDate: "",
    requestedTime: "",
    durationMinutes: 60,
    studentNotes: "",
    location: "",
  });

  const isStudent = Boolean(user?.roles.includes("STUDENT"));

  const filteredUpcomingBookings = useFilteredBookings(
    upcomingBookingsState.data,
    bookingFilter
  );

  const selectedTeacher = useMemo(
    () =>
      availableTeachersState.data.find(
        (teacher) => String(teacher.id) === bookingForm.teacherId
      ),
    [availableTeachersState.data, bookingForm.teacherId]
  );

  const teacherModalities = useMemo(
    () => selectedTeacher?.modalities ?? [],
    [selectedTeacher]
  );

  const modalityOptions = useMemo(() => {
    if (!selectedTeacher) {
      return modalitiesState.data;
    }
    return teacherModalities.length > 0 ? teacherModalities : modalitiesState.data;
  }, [modalitiesState.data, selectedTeacher, teacherModalities]);

  const resetForm = useCallback(() => {
    setBookingForm({
      teacherId: "",
      modality: "",
      requestedDate: "",
      requestedTime: "",
      durationMinutes: 60,
      studentNotes: "",
      location: "",
    });
  }, []);

  const loadCatalog = useCallback(
    async (authToken: string | null) => {
      setClassesState((prev) => ({ ...prev, loading: true, error: null }));
      setModalitiesState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const [classes, modalities] = await Promise.all([
          fetchClasses(authToken ?? undefined),
          fetchModalities(authToken ?? undefined),
        ]);
        setClassesState({ data: classes, loading: false, error: null });
        setModalitiesState({ data: modalities, loading: false, error: null });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar a lista de aulas.";
        setClassesState({ data: [], loading: false, error: message });
        setModalitiesState({ data: [], loading: false, error: message });
      }
    },
    []
  );

  const loadStudentResources = useCallback(
    async (authToken: string) => {
      setAvailableTeachersState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));
      setUpcomingBookingsState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const [teachers, upcomingBookings] = await Promise.all([
          getAvailableTeachers(authToken),
          getUpcomingBookings(authToken),
        ]);
        setAvailableTeachersState({
          data: teachers,
          loading: false,
          error: null,
        });
        setUpcomingBookingsState({
          data: upcomingBookings,
          loading: false,
          error: null,
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os recursos de agendamento.";
        setAvailableTeachersState({
          data: [],
          loading: false,
          error: message,
        });
        setUpcomingBookingsState({
          data: [],
          loading: false,
          error: message,
        });
      }
    },
    []
  );

  useEffect(() => {
    loadCatalog(token ?? null);
  }, [loadCatalog, token]);

  useEffect(() => {
    if (!token || !isStudent) return;
    loadStudentResources(token);
  }, [isStudent, loadStudentResources, token]);

  useEffect(() => {
    if (!bookingForm.teacherId) {
      return;
    }

    if (
      bookingForm.modality &&
      modalityOptions.length > 0 &&
      !modalityOptions.includes(bookingForm.modality)
    ) {
      setBookingForm((prev) => ({
        ...prev,
        modality: modalityOptions[0],
      }));
    }
  }, [bookingForm.modality, bookingForm.teacherId, modalityOptions]);

  async function handleCreateBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    if (
      !bookingForm.teacherId ||
      !bookingForm.modality ||
      !bookingForm.requestedDate ||
      !bookingForm.requestedTime
    ) {
      setSubmitFeedback({
        type: "error",
        message: "Selecione professor, modalidade, data e horário para agendar.",
      });
      return;
    }

    try {
      setSubmitFeedback(null);
      const payload = {
        teacherId: Number(bookingForm.teacherId),
        requestedDate: bookingForm.requestedDate,
        requestedTime: bookingForm.requestedTime,
        durationMinutes: Number(bookingForm.durationMinutes) || 60,
        modality: bookingForm.modality,
        studentNotes: bookingForm.studentNotes || undefined,
        location: bookingForm.location || undefined,
      };

      const booking = await createBooking(token, payload);
      setUpcomingBookingsState((prev) => ({
        ...prev,
        data: [booking, ...prev.data],
      }));
      resetForm();
      setSubmitFeedback({
        type: "info",
        message: t("bookingCreatedSuccess"),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível criar o agendamento.";
      setSubmitFeedback({ type: "error", message });
    }
  }

  async function handleCancelBooking(bookingId: number) {
    if (!token) return;
    try {
      await cancelBooking(token, bookingId);
      setUpcomingBookingsState((prev) => ({
        ...prev,
        data: prev.data.filter((item) => item.id !== bookingId),
      }));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível cancelar o agendamento.";
      setSubmitFeedback({ type: "error", message });
    }
  }

  const handleExportFiltered = () => {
    if (filteredUpcomingBookings.length === 0) {
      setSubmitFeedback({
        type: "error",
        message: "Nenhum agendamento atende aos filtros selecionados.",
      });
      return;
    }

    const rows: string[][] = [
      ["Status", "Modalidade", "Data", "Horário", "Instrutor", "Local"],
      ...filteredUpcomingBookings.map((booking) => [
        formatStatus(booking.status),
        booking.modality ?? "-",
        formatDate(booking.requestedDate),
        formatTime(booking.requestedTime),
        booking.teacherName ?? "-",
        booking.location ?? "-",
      ]),
    ];

    downloadCsv("agendamentos.csv", rows);
    setSubmitFeedback({
      type: "info",
      message: "Exportação concluída! Verifique seus downloads.",
    });
  };

  return (
    <AppLayout>
      <BackButton />
      <div className="dashboard-stack">
        <section className="panel glass-panel">
          <div className="panel-header">
            <div>
              <h1>{t("newBooking")}</h1>
              <p>{t("requestPrivateClass")}</p>
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
              <button
                type="button"
                className="secondary-button"
                onClick={handleExportFiltered}
              >
                {t("exportCsv")}
              </button>
            </div>
          </div>

          <div className="grid-2">
            <div className="booking-list">
              {upcomingBookingsState.loading && (
                <p className="muted">{t("loadingBookings")}</p>
              )}
              {upcomingBookingsState.error && (
                <p className="feedback feedback-error">
                  {upcomingBookingsState.error}
                </p>
              )}

              {filteredUpcomingBookings.map((booking) => (
                <article key={booking.id} className="booking-card">
                  <header>
                    <span className={`status status-${booking.status.toLowerCase()}`}>
                      {formatStatus(booking.status)}
                    </span>
                    <strong>{booking.modality ?? "Modalidade"}</strong>
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
                      <strong>{t("location")}:</strong>{" "}
                      {booking.location ?? t("locationPlaceholder")}
                    </li>
                  </ul>
                  {isStudent && booking.status === "PENDING" && (
                    <footer>
                      <button
                        className="link-button"
                        type="button"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        {t("cancelRequest")}
                      </button>
                    </footer>
                  )}
                </article>
              ))}

              {filteredUpcomingBookings.length === 0 &&
                !upcomingBookingsState.loading && (
                  <p className="muted">{t("noFilteredResults")}</p>
                )}
            </div>

            {isStudent && (
              <div className="booking-form-wrapper">
                {availableTeachersState.loading && (
                  <p className="muted">{t("loading")}...</p>
                )}
                {availableTeachersState.error && (
                  <p className="feedback feedback-error">
                    {availableTeachersState.error}
                  </p>
                )}
                {modalitiesState.error && (
                  <p className="feedback feedback-error">{modalitiesState.error}</p>
                )}

                <form className="booking-form" onSubmit={handleCreateBooking}>
                  <label className="form-field">
                    <span>{t("teacher")}</span>
                    <select
                      value={bookingForm.teacherId}
                      disabled={availableTeachersState.loading}
                      onChange={(event) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          teacherId: event.target.value,
                          modality: "",
                        }))
                      }
                    >
                      <option value="">{t("selectTeacher")}</option>
                      {availableTeachersState.data.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.fullName ?? teacher.username}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-field">
                    <span>{t("modality")}</span>
                    <select
                      value={bookingForm.modality}
                      onChange={(event) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          modality: event.target.value,
                        }))
                      }
                    >
                      <option value="">{t("selectModality")}</option>
                      {modalityOptions.map((modality) => (
                        <option key={modality} value={modality}>
                          {modality}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="form-row">
                    <label className="form-field">
                      <span>{t("date")}</span>
                      <input
                        type="date"
                        value={bookingForm.requestedDate}
                        onChange={(event) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            requestedDate: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="form-field">
                      <span>{t("time")}</span>
                      <input
                        type="time"
                        value={bookingForm.requestedTime}
                        onChange={(event) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            requestedTime: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="form-field">
                      <span>
                        {t("duration")} ({t("minutes")})
                      </span>
                      <input
                        type="number"
                        min={30}
                        step={15}
                        value={bookingForm.durationMinutes}
                        onChange={(event) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            durationMinutes: Number(event.target.value),
                          }))
                        }
                      />
                    </label>
                  </div>

                  <label className="form-field">
                    <span>{t("location")}</span>
                    <input
                      type="text"
                      placeholder={t("locationPlaceholder")}
                      value={bookingForm.location}
                      onChange={(event) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          location: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="form-field">
                    <span>{t("notes")}</span>
                    <textarea
                      placeholder={t("notesPlaceholder")}
                      value={bookingForm.studentNotes}
                      onChange={(event) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          studentNotes: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <div className="form-actions">
                    <button className="primary-button" type="submit">
                      {t("requestBooking")}
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={resetForm}
                    >
                      {t("clearFilters")}
                    </button>
                  </div>

                  {submitFeedback && (
                    <p
                      className={`feedback ${{
                        info: "feedback-info",
                        error: "feedback-error",
                      }[submitFeedback.type]}`}
                    >
                      {submitFeedback.message}
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>
        </section>

        <section className="panel glass-panel">
          <div className="panel-header">
            <div>
              <h2>{t("availableClasses")}</h2>
              <p>{t("modalitiesAndSchedules")}</p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => loadCatalog(token ?? null)}
            >
              {t("refresh")}
            </button>
          </div>

          {classesState.loading && <p className="muted">{t("loadingClasses")}</p>}
          {classesState.error && (
            <div className="feedback feedback-error">
              {classesState.error}
            </div>
          )}

          <div className="classes-grid">
            {classesState.data.map((item) => (
              <article key={item.id} className="class-card">
                <header>
                  <span className="badge">{item.modality}</span>
                  <h3>{item.title}</h3>
                </header>
                <p className="muted">{item.description}</p>
                <ul>
                  <li>
                    <strong>{t("teacher")}:</strong>{" "}
                    {item.instructorName ?? t("selectTeacher")}
                  </li>
                  <li>
                    <strong>{t("location")}:</strong>{" "}
                    {item.location ?? t("locationPlaceholder")}
                  </li>
                  <li>
                    <strong>{t("daysLabel")}:</strong>{" "}
                    {item.days && item.days.length > 0
                      ? item.days.join(", ")
                      : t("noSchedule")}
                  </li>
                  <li>
                    <strong>{t("time")}:</strong>{" "}
                    {item.startTime && item.endTime
                      ? `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`
                      : t("noSchedule")}
                  </li>
                </ul>
              </article>
            ))}

            {classesState.data.length === 0 && !classesState.loading && (
              <p className="muted">{t("noClassesAvailable")}</p>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
