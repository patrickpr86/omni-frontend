import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "../api/auth.ts";
import { useLanguage } from "../context/LanguageContext.tsx";

export function PasswordResetPage() {
  const { t } = useLanguage();
  const [requestState, setRequestState] = useState({
    usernameOrEmail: "",
    loading: false,
    feedback: null as { type: "info" | "error"; message: string } | null,
  });

  const [confirmState, setConfirmState] = useState({
    resetToken: "",
    newPassword: "",
    confirmPassword: "",
    loading: false,
    feedback: null as { type: "info" | "error"; message: string } | null,
  });

  const handleRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requestState.usernameOrEmail.trim()) {
      setRequestState((prev) => ({
        ...prev,
        feedback: { type: "error", message: t("requiredCredentials") },
      }));
      return;
    }

    setRequestState((prev) => ({ ...prev, loading: true, feedback: null }));

    try {
      await requestPasswordReset({
        usernameOrEmail: requestState.usernameOrEmail.trim(),
      });
      setRequestState((prev) => ({
        ...prev,
        loading: false,
        feedback: {
          type: "info",
          message: t("resetInstructionsSent"),
        },
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("resetRequestError");
      setRequestState((prev) => ({
        ...prev,
        loading: false,
        feedback: { type: "error", message },
      }));
    }
  };

  const handleConfirmSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!confirmState.resetToken.trim()) {
      setConfirmState((prev) => ({
        ...prev,
        feedback: { type: "error", message: t("resetTokenRequired") },
      }));
      return;
    }

    if (confirmState.newPassword.length < 6) {
      setConfirmState((prev) => ({
        ...prev,
        feedback: {
          type: "error",
          message: t("passwordMinLength"),
        },
      }));
      return;
    }

    if (confirmState.newPassword !== confirmState.confirmPassword) {
      setConfirmState((prev) => ({
        ...prev,
        feedback: {
          type: "error",
          message: t("passwordMismatch"),
        },
      }));
      return;
    }

    setConfirmState((prev) => ({ ...prev, loading: true, feedback: null }));

    try {
      await resetPassword({
        resetToken: confirmState.resetToken.trim(),
        newPassword: confirmState.newPassword,
        confirmPassword: confirmState.confirmPassword,
      });

      setConfirmState({
        resetToken: "",
        newPassword: "",
        confirmPassword: "",
        loading: false,
        feedback: {
          type: "info",
          message: t("resetPasswordSuccess"),
        },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("resetPasswordError");
      setConfirmState((prev) => ({
        ...prev,
        loading: false,
        feedback: { type: "error", message },
      }));
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>{t("resetPassword")}</h1>
        <p className="auth-subtitle">
          {t("resetPasswordDesc")}
        </p>

        <form className="auth-form" onSubmit={handleRequestSubmit}>
          <h2>1. {t("requestLink")}</h2>
          <label className="form-field">
            <span>{t("usernameOrEmail")}</span>
            <input
              type="text"
              value={requestState.usernameOrEmail}
              onChange={(event) =>
                setRequestState((prev) => ({
                  ...prev,
                  usernameOrEmail: event.target.value,
                }))
              }
              placeholder={t("usernameOrEmailPlaceholder")}
            />
          </label>
          <button className="primary-button" type="submit" disabled={requestState.loading}>
            {requestState.loading ? t("sendingInstructions") : t("sendInstructions")}
          </button>
          {requestState.feedback && (
            <p
              className={`feedback ${{
                info: "feedback-info",
                error: "feedback-error",
              }[requestState.feedback.type]}`}
            >
              {requestState.feedback.message}
            </p>
          )}
        </form>

        <form className="auth-form" onSubmit={handleConfirmSubmit}>
          <h2>2. {t("defineNewPassword")}</h2>
          <label className="form-field">
            <span>{t("resetToken")}</span>
            <input
              type="text"
              value={confirmState.resetToken}
              onChange={(event) =>
                setConfirmState((prev) => ({
                  ...prev,
                  resetToken: event.target.value,
                }))
              }
              placeholder={t("resetTokenPlaceholder")}
            />
          </label>
          <label className="form-field">
            <span>{t("newPassword")}</span>
            <input
              type="password"
              value={confirmState.newPassword}
              onChange={(event) =>
                setConfirmState((prev) => ({
                  ...prev,
                  newPassword: event.target.value,
                }))
              }
              placeholder={t("passwordPlaceholder")}
            />
          </label>
          <label className="form-field">
            <span>{t("confirmNewPassword")}</span>
            <input
              type="password"
              value={confirmState.confirmPassword}
              onChange={(event) =>
                setConfirmState((prev) => ({
                  ...prev,
                  confirmPassword: event.target.value,
                }))
              }
              placeholder={t("passwordPlaceholder")}
            />
          </label>
          <button
            className="secondary-button"
            type="submit"
            disabled={confirmState.loading}
          >
            {confirmState.loading ? t("resetting") : t("resetPasswordButton")}
          </button>
          {confirmState.feedback && (
            <p
              className={`feedback ${{
                info: "feedback-info",
                error: "feedback-error",
              }[confirmState.feedback.type]}`}
            >
              {confirmState.feedback.message}
            </p>
          )}
        </form>

        <p className="muted">
          <Link to="/login">{t("backToLogin")}</Link>
        </p>
      </div>
    </div>
  );
}
