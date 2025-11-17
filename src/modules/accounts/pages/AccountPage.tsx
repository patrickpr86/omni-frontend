import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchProfile,
  updatePassword,
  updateProfile,
} from "@/modules/accounts/api/profile.ts";
import { AppLayout } from "@/shared/components/AppLayout.tsx";
import { BackButton } from "@/shared/components/BackButton";
import { useAuth } from "@/core/context/AuthContext.tsx";
import { useLanguage } from "@/core/context/LanguageContext.tsx";
import {
  buildDataUrl,
  extractBase64Payload,
  guessMimeTypeFromBase64,
} from "@/shared/utils/media.ts";
import { loadCachedPhoto, storeCachedPhoto } from "@/shared/utils/photoCache.ts";

type FeedbackState = {
  type: "info" | "error";
  message: string;
} | null;

type Section = "profile" | "security";

const DEFAULT_TIMEZONES = [
  "America/Sao_Paulo",
  "America/Bogota",
  "America/New_York",
  "Europe/Lisbon",
  "Europe/Madrid",
  "UTC",
];

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

export function AccountPage() {
  const { token, user, login } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<Section>("profile");
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
          err instanceof Error ? err.message : (language === "pt" ? "Erro ao carregar perfil" : "Error loading profile");
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
    language,
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
        message: language === "pt" ? "Arquivo muito grande. Máximo 2MB." : "File too large. Maximum 2MB.",
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
        message: language === "pt" ? "Perfil atualizado com sucesso!" : "Profile updated successfully!",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : (language === "pt" ? "Erro ao atualizar perfil" : "Error updating profile");
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
        message: language === "pt" ? "A senha deve ter pelo menos 6 caracteres" : "Password must be at least 6 characters",
      });
      return;
    }

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: language === "pt" ? "As senhas não coincidem" : "Passwords do not match",
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
        message: language === "pt" ? "Senha alterada com sucesso!" : "Password changed successfully!",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : (language === "pt" ? "Erro ao alterar senha" : "Error changing password");
      setPasswordFeedback({ type: "error", message });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <AppLayout>
      <BackButton />
      <div className="page-header">
        <h1 className="page-title">
          {language === "pt" ? "Minha Conta" : "My Account"}
        </h1>
        <p className="page-subtitle">
          {language === "pt" 
            ? "Gerencie suas informações pessoais e configurações de segurança" 
            : "Manage your personal information and security settings"}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        display: "flex", 
        gap: "8px", 
        marginBottom: "24px",
        borderBottom: "2px solid var(--border)",
        paddingBottom: "8px"
      }}>
        <button
          type="button"
          onClick={() => setActiveSection("profile")}
          style={{
            padding: "12px 24px",
            background: activeSection === "profile" ? "var(--primary)" : "transparent",
            color: activeSection === "profile" ? "#fff" : "var(--text-primary)",
            border: "none",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            fontWeight: activeSection === "profile" ? "600" : "400",
            transition: "all 0.2s",
          }}
        >
          {language === "pt" ? "Perfil" : "Profile"}
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("security")}
          style={{
            padding: "12px 24px",
            background: activeSection === "security" ? "var(--primary)" : "transparent",
            color: activeSection === "security" ? "#fff" : "var(--text-primary)",
            border: "none",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            fontWeight: activeSection === "security" ? "600" : "400",
            transition: "all 0.2s",
          }}
        >
          {language === "pt" ? "Segurança" : "Security"}
        </button>
      </div>

      {/* Profile Section */}
      {activeSection === "profile" && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{language === "pt" ? "Meu Perfil" : "My Profile"}</h2>
              <p>{language === "pt" ? "Atualize suas informações pessoais" : "Update your personal information"}</p>
            </div>
          </div>

          {profileLoading ? (
            <p className="muted">{language === "pt" ? "Carregando perfil..." : "Loading profile..."}</p>
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
                            <span>{formState.profilePhotoFileName || (language === "pt" ? "Documento anexado" : "Document attached")}</span>
                            <a
                              href={avatarPreview.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={formState.profilePhotoFileName || "arquivo.pdf"}
                            >
                              {language === "pt" ? "Abrir arquivo" : "Open file"}
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
                    <span>{language === "pt" ? "Atualizar foto" : "Update photo"}</span>
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
                      {language === "pt" ? "Remover foto" : "Remove photo"}
                    </button>
                  )}
                </div>

                <div className="profile-fields">
                  <div className="form-grid">
                    <label className="form-field">
                      <span>{language === "pt" ? "Nome completo" : "Full name"}</span>
                      <input
                        type="text"
                        value={formState.fullName}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            fullName: event.target.value,
                          }))
                        }
                        placeholder={language === "pt" ? "Seu nome completo" : "Your full name"}
                      />
                    </label>
                    <label className="form-field">
                      <span>{language === "pt" ? "Telefone" : "Phone"}</span>
                      <input
                        type="tel"
                        value={formState.phoneNumber}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            phoneNumber: event.target.value,
                          }))
                        }
                        placeholder={language === "pt" ? "(19) 98307-5359" : "(555) 123-4567"}
                      />
                    </label>
                  </div>

                  <div className="form-grid">
                    <label className="form-field">
                      <span>{language === "pt" ? "Usuário" : "Username"}</span>
                      <input value={formState.username} disabled />
                    </label>
                    <label className="form-field">
                      <span>{language === "pt" ? "E-mail" : "Email"}</span>
                      <input value={formState.email} disabled />
                    </label>
                  </div>

                  <label className="form-field">
                    <span>{language === "pt" ? "Biografia" : "Bio"}</span>
                    <textarea
                      value={formState.bio}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          bio: event.target.value,
                        }))
                      }
                      placeholder={language === "pt" ? "Conte um pouco sobre você..." : "Tell us a little about yourself..."}
                    />
                  </label>

                  <label className="form-field">
                    <span>{language === "pt" ? "Fuso horário" : "Timezone"}</span>
                    <select
                      value={formState.timezone}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          timezone: event.target.value,
                        }))
                      }
                    >
                      <option value="">{language === "pt" ? "Selecione um fuso horário" : "Select timezone"}</option>
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
                      {savingProfile 
                        ? (language === "pt" ? "Salvando..." : "Saving...") 
                        : (language === "pt" ? "Salvar alterações" : "Save changes")}
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
      )}

      {/* Security Section */}
      {activeSection === "security" && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{language === "pt" ? "Alterar Senha" : "Change Password"}</h2>
              <p>{language === "pt" ? "Defina uma nova senha para sua conta" : "Set a new password for your account"}</p>
            </div>
          </div>

          <form className="profile-password-form" onSubmit={handlePasswordSubmit}>
            <div className="form-grid">
              <label className="form-field">
                <span>{language === "pt" ? "Senha atual" : "Current password"}</span>
                <input
                  type="password"
                  value={passwordState.currentPassword}
                  onChange={(event) =>
                    setPasswordState((prev) => ({
                      ...prev,
                      currentPassword: event.target.value,
                    }))
                  }
                  placeholder={language === "pt" ? "Digite sua senha atual" : "Enter your current password"}
                />
              </label>
              <label className="form-field">
                <span>{language === "pt" ? "Nova senha" : "New password"}</span>
                <input
                  type="password"
                  value={passwordState.newPassword}
                  onChange={(event) =>
                    setPasswordState((prev) => ({
                      ...prev,
                      newPassword: event.target.value,
                    }))
                  }
                  placeholder={language === "pt" ? "Digite sua nova senha" : "Enter your new password"}
                />
              </label>
              <label className="form-field">
                <span>{language === "pt" ? "Confirmar nova senha" : "Confirm new password"}</span>
                <input
                  type="password"
                  value={passwordState.confirmPassword}
                  onChange={(event) =>
                    setPasswordState((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                  placeholder={language === "pt" ? "Confirme sua nova senha" : "Confirm your new password"}
                />
              </label>
            </div>

            <div className="profile-actions">
              <button
                className="secondary-button"
                type="submit"
                disabled={changingPassword}
              >
                {changingPassword 
                  ? (language === "pt" ? "Alterando..." : "Updating...") 
                  : (language === "pt" ? "Alterar senha" : "Change password")}
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
      )}
    </AppLayout>
  );
}
