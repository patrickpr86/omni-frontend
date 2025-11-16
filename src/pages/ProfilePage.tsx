import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfile } from "../api/auth.ts";
import { updatePassword, updateProfile } from "../api/profile.ts";
import { AppLayout } from "../components/AppLayout.tsx";
import { BackButton } from "../components/BackButton";
import { useAuth } from "../context/AuthContext.tsx";
import { useLanguage } from "../context/LanguageContext.tsx";
import {
  buildDataUrl,
  extractBase64Payload,
  guessMimeTypeFromBase64,
} from "../utils/media.ts";
import { loadCachedPhoto, storeCachedPhoto } from "../utils/photoCache.ts";

type FeedbackState = {
  type: "info" | "error";
  message: string;
} | null;

const DEFAULT_TIMEZONES = [
  "America/Sao_Paulo",
  "America/Bogota",
  "America/New_York",
  "Europe/Lisbon",
  "Europe/Madrid",
  "UTC",
];

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

export function ProfilePage() {
  const { token, user, login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const cachedPhoto = useMemo(() => loadCachedPhoto(), []);

  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<FeedbackState>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<FeedbackState>(null);

  const initialPhotoBase64 =
    user?.profilePhotoBase64 ?? cachedPhoto?.base64 ?? "";
  const initialPhotoMime =
    user?.profilePhotoMimeType ??
    cachedPhoto?.mimeType ??
    guessMimeTypeFromBase64(initialPhotoBase64) ??
    "";
  const initialPhotoFileName =
    user?.profilePhotoFileName ?? cachedPhoto?.fileName ?? "";
  const initialPhotoDataUrl = user?.profilePhoto
    ? user.profilePhoto
    : initialPhotoBase64
    ? buildDataUrl(initialPhotoBase64, initialPhotoMime)
    : "";

  const [formState, setFormState] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
    fullName: user?.fullName ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    bio: user?.bio ?? "",
    timezone: user?.timezone ?? "",
    profilePhotoBase64: initialPhotoDataUrl,
    profilePhotoMimeType: initialPhotoMime,
    profilePhotoFileName: initialPhotoFileName,
  });

  const [passwordState, setPasswordState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const authToken = token;

    if (!authToken) {
      navigate("/login");
      return;
    }

    async function loadProfile(currentToken: string) {
      setProfileLoading(true);
      try {
        const profile = await fetchProfile(currentToken);
        const rawPhoto = profile.profilePhotoBase64 ?? profile.profilePhoto ?? "";
        const cachedFromStorage = loadCachedPhoto();
        const fallbackPhoto = rawPhoto
          || user?.profilePhotoBase64
          || user?.profilePhoto
          || cachedFromStorage?.base64
          || "";
        const fallbackMime =
          user?.profilePhotoMimeType || cachedFromStorage?.mimeType || "";
        const fallbackFileName =
          profile.profilePhotoFileName ??
          user?.profilePhotoFileName ??
          cachedFromStorage?.fileName ??
          "";

        const extracted = extractBase64Payload(fallbackPhoto, fallbackMime);
        const finalBase64 =
          extracted.base64 || cachedFromStorage?.base64 || initialPhotoBase64;
        const finalMime =
          extracted.mimeType ||
          fallbackMime ||
          guessMimeTypeFromBase64(finalBase64) ||
          "";
        const finalDataUrl = rawPhoto && rawPhoto.startsWith("data:")
          ? rawPhoto
          : finalBase64
          ? buildDataUrl(finalBase64, finalMime)
          : "";
        const finalFileName = finalDataUrl ? fallbackFileName : "";

        setFormState((prev) => ({
          ...prev,
          username: profile.username,
          email: profile.email,
          fullName: profile.fullName ?? "",
          phoneNumber: profile.phoneNumber ?? "",
          bio: profile.bio ?? "",
          timezone: profile.timezone ?? "",
          profilePhotoBase64: finalDataUrl,
          profilePhotoMimeType: finalMime,
          profilePhotoFileName: finalDataUrl
            ? finalFileName || prev.profilePhotoFileName || ""
            : "",
        }));

        if (finalBase64) {
          storeCachedPhoto({
            base64: finalBase64,
            mimeType: finalMime,
            fileName: finalFileName,
          });
        } else {
          storeCachedPhoto(null);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t("profileLoadError");
        setProfileFeedback({ type: "error", message });
      } finally {
        setProfileLoading(false);
      }
    }

    loadProfile(authToken);
  }, [
    navigate,
    token,
    user?.profilePhoto,
    user?.profilePhotoBase64,
    user?.profilePhotoMimeType,
    user?.profilePhotoFileName,
    initialPhotoBase64,
    t,
  ]);

  const canSaveProfile = useMemo(() => {
    if (!formState.fullName.trim()) return false;
    if (!formState.email.trim()) return false;
    return true;
  }, [formState.email, formState.fullName]);

  const avatarPreview = useMemo(() => {
    if (!formState.profilePhotoBase64) {
      return { url: "", isImage: true, mimeType: "" };
    }

    const extracted = extractBase64Payload(
      formState.profilePhotoBase64,
      formState.profilePhotoMimeType
    );
    const mimeType =
      extracted.mimeType ||
      guessMimeTypeFromBase64(extracted.base64) ||
      formState.profilePhotoMimeType ||
      "";
    const url = formState.profilePhotoBase64.startsWith("data:")
      ? formState.profilePhotoBase64
      : extracted.base64
      ? buildDataUrl(extracted.base64, mimeType)
      : "";

    return {
      url,
      isImage: mimeType.startsWith("image/"),
      mimeType,
    };
  }, [formState.profilePhotoBase64, formState.profilePhotoMimeType]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE) {
      setProfileFeedback({
        type: "error",
        message: t("fileSizeError"),
      });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString() ?? "";
      const extracted = extractBase64Payload(result, file.type);
      const mimeType =
        extracted.mimeType || file.type || guessMimeTypeFromBase64(extracted.base64);
      const dataUrl = result.startsWith("data:")
        ? result
        : extracted.base64
        ? buildDataUrl(extracted.base64, mimeType)
        : "";

      setFormState((prev) => ({
        ...prev,
        profilePhotoBase64: dataUrl,
        profilePhotoMimeType: mimeType ?? prev.profilePhotoMimeType ?? "",
        profilePhotoFileName: file.name,
      }));
      setProfileFeedback(null);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const authToken = token;
    if (!authToken) return;
    if (!canSaveProfile) return;

    setSavingProfile(true);
    setProfileFeedback(null);

    try {
      const photoInfo = extractBase64Payload(
        formState.profilePhotoBase64,
        formState.profilePhotoMimeType
      );

      const payload = {
        fullName: formState.fullName.trim(),
        phoneNumber: formState.phoneNumber.trim() || undefined,
        bio: formState.bio.trim() || undefined,
        timezone: formState.timezone || undefined,
        profilePhotoBase64: photoInfo.base64 || null,
        profilePhotoMimeType: photoInfo.base64
          ? photoInfo.mimeType || null
          : null,
        profilePhotoFileName: photoInfo.base64
          ? formState.profilePhotoFileName || null
          : null,
      };

      const updatedProfile = await updateProfile(authToken, payload);
      const serverPhoto =
        updatedProfile.profilePhotoBase64 ?? updatedProfile.profilePhoto ?? "";
      const serverExtracted = extractBase64Payload(
        serverPhoto || photoInfo.base64,
        photoInfo.mimeType || formState.profilePhotoMimeType
      );
      const resolvedBase64 = serverExtracted.base64 || photoInfo.base64;
      const resolvedDataUrl = serverPhoto && serverPhoto.startsWith("data:")
        ? serverPhoto
        : resolvedBase64
        ? buildDataUrl(resolvedBase64, serverExtracted.mimeType)
        : "";
      const resolvedMime =
        serverExtracted.mimeType ||
        photoInfo.mimeType ||
        formState.profilePhotoMimeType ||
        "";

      login(authToken, {
        username: updatedProfile.username,
        email: updatedProfile.email,
        fullName: updatedProfile.fullName,
        phoneNumber: updatedProfile.phoneNumber,
        profilePhoto: resolvedDataUrl,
        profilePhotoBase64: resolvedBase64,
        profilePhotoMimeType: resolvedMime,
        profilePhotoFileName:
          updatedProfile.profilePhotoFileName ?? formState.profilePhotoFileName,
        bio: updatedProfile.bio,
        timezone: updatedProfile.timezone,
        roles: updatedProfile.roles ?? user?.roles ?? [],
      });

      setFormState((prev) => ({
        ...prev,
        fullName: updatedProfile.fullName ?? prev.fullName,
        phoneNumber: updatedProfile.phoneNumber ?? prev.phoneNumber,
        bio: updatedProfile.bio ?? prev.bio,
        timezone: updatedProfile.timezone ?? prev.timezone,
        profilePhotoBase64: resolvedDataUrl,
        profilePhotoMimeType: resolvedMime,
        profilePhotoFileName: resolvedDataUrl
          ? updatedProfile.profilePhotoFileName ?? prev.profilePhotoFileName ?? ""
          : "",
      }));

      if (resolvedBase64) {
        storeCachedPhoto({
          base64: resolvedBase64,
          mimeType: resolvedMime,
          fileName:
            updatedProfile.profilePhotoFileName ?? formState.profilePhotoFileName,
        });
      } else {
        storeCachedPhoto(null);
      }

      setProfileFeedback({
        type: "info",
        message: t("profileUpdatedSuccess"),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("profileUpdateError");
      setProfileFeedback({ type: "error", message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const authToken = token;
    if (!authToken) return;

    if (!passwordState.newPassword || passwordState.newPassword.length < 6) {
      setPasswordFeedback({
        type: "error",
        message: t("passwordMinLength"),
      });
      return;
    }

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: t("passwordMismatch"),
      });
      return;
    }

    setChangingPassword(true);
    setPasswordFeedback(null);

    try {
      await updatePassword(authToken, {
        currentPassword: passwordState.currentPassword,
        newPassword: passwordState.newPassword,
      });

      setPasswordState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordFeedback({
        type: "info",
        message: t("passwordUpdatedSuccess"),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("passwordUpdateError");
      setPasswordFeedback({ type: "error", message });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <AppLayout>
      <BackButton />
      <>
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{t("yourProfile")}</h2>
              <p>{t("updateInfo")}</p>
            </div>
          </div>

          {profileLoading ? (
            <p className="muted">{t("loadingProfile")}</p>
          ) : (
            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <div className="profile-grid">
                <div className="avatar-column">
                  <div className="avatar-preview">
                    {avatarPreview.url ? (
                      avatarPreview.isImage ? (
                        <img
                          src={avatarPreview.url}
                          alt={`Avatar de ${formState.fullName || formState.username}`}
                        />
                      ) : (
                        <div className="avatar-doc-preview">
                          <span className="avatar-doc-icon" aria-hidden="true">
                            📄
                          </span>
                          <div className="avatar-doc-info">
                            <span>{formState.profilePhotoFileName || t("documentAttached")}</span>
                            <a
                              href={avatarPreview.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={formState.profilePhotoFileName || "arquivo.pdf"}
                            >
                              {t("openFile")}
                            </a>
                          </div>
                        </div>
                      )
                    ) : (
                      <span className="avatar-placeholder">
                        {formState.fullName?.charAt(0)?.toUpperCase() ??
                          formState.username.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <label className="avatar-upload">
                    <span>{t("updateFile")}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,application/pdf,.pdf"
                      onChange={handleAvatarChange}
                    />
                  </label>

                  {formState.profilePhotoBase64 && (
                    <button
                      className="link-button"
                      type="button"
                      onClick={() => {
                        setFormState((prev) => ({
                          ...prev,
                          profilePhotoBase64: "",
                          profilePhotoMimeType: "",
                          profilePhotoFileName: "",
                        }));
                        storeCachedPhoto(null);
                      }}
                    >
                      {t("removeFile")}
                    </button>
                  )}
                </div>

                <div className="profile-fields">
                  <div className="form-grid">
                    <label className="form-field">
                      <span>{t("fullName")}</span>
                      <input
                        type="text"
                        value={formState.fullName}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            fullName: event.target.value,
                          }))
                        }
                        placeholder={t("fullNamePlaceholder")}
                      />
                    </label>
                    <label className="form-field">
                      <span>{t("phone")}</span>
                      <input
                        type="tel"
                        value={formState.phoneNumber}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            phoneNumber: event.target.value,
                          }))
                        }
                        placeholder={t("phonePlaceholder")}
                      />
                    </label>
                  </div>

                  <div className="form-grid">
                    <label className="form-field">
                      <span>{t("username")}</span>
                      <input value={formState.username} disabled />
                    </label>
                    <label className="form-field">
                      <span>{t("email")}</span>
                      <input value={formState.email} disabled />
                    </label>
                  </div>

                  <label className="form-field">
                    <span>{t("bio")}</span>
                    <textarea
                      value={formState.bio}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          bio: event.target.value,
                        }))
                      }
                      placeholder={t("bioPlaceholder")}
                    />
                  </label>

                  <label className="form-field">
                    <span>{t("timezone")}</span>
                    <select
                      value={formState.timezone}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          timezone: event.target.value,
                        }))
                      }
                    >
                      <option value="">{t("selectTimezone")}</option>
                      {DEFAULT_TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="profile-actions">
                    <button
                      className="primary-button"
                      type="submit"
                      disabled={!canSaveProfile || savingProfile}
                    >
                      {savingProfile ? t("saving") : t("saveChanges")}
                    </button>
                    {profileFeedback && (
                      <p
                        className={`feedback ${{
                          info: "feedback-info",
                          error: "feedback-error",
                        }[profileFeedback.type]}`}
                      >
                        {profileFeedback.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{t("updatePassword")}</h2>
              <p>{t("setNewPassword")}</p>
            </div>
          </div>

          <form className="profile-password-form" onSubmit={handlePasswordSubmit}>
            <div className="form-grid">
              <label className="form-field">
                <span>{t("currentPassword")}</span>
                <input
                  type="password"
                  value={passwordState.currentPassword}
                  onChange={(event) =>
                    setPasswordState((prev) => ({
                      ...prev,
                      currentPassword: event.target.value,
                    }))
                  }
                  placeholder={t("currentPassword")}
                />
              </label>
              <label className="form-field">
                <span>{t("newPassword")}</span>
                <input
                  type="password"
                  value={passwordState.newPassword}
                  onChange={(event) =>
                    setPasswordState((prev) => ({
                      ...prev,
                      newPassword: event.target.value,
                    }))
                  }
                  placeholder={t("newPassword")}
                />
              </label>
              <label className="form-field">
                <span>{t("confirmNewPassword")}</span>
                <input
                  type="password"
                  value={passwordState.confirmPassword}
                  onChange={(event) =>
                    setPasswordState((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                  placeholder={t("repeatPassword")}
                />
              </label>
            </div>

            <div className="profile-actions">
              <button
                className="secondary-button"
                type="submit"
                disabled={changingPassword}
              >
                {changingPassword ? t("updating") : t("updatePasswordButton")}
              </button>
              {passwordFeedback && (
                <p
                  className={`feedback ${{
                    info: "feedback-info",
                    error: "feedback-error",
                  }[passwordFeedback.type]}`}
                >
                  {passwordFeedback.message}
                </p>
              )}
            </div>
          </form>
        </section>
      </>
    </AppLayout>
  );
}
