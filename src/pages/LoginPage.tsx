import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest, fetchProfile } from "../api/auth.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { useLanguage } from "../context/LanguageContext.tsx";
import {
  buildDataUrl,
  extractBase64Payload,
} from "../utils/media.ts";
import { loadCachedPhoto, storeCachedPhoto } from "../utils/photoCache.ts";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, language } = useLanguage();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loginLead =
    language === "pt"
      ? "Para continuar, faça login ou registre-se."
      : "To continue, sign in or create your access.";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!usernameOrEmail || !password) {
      setError(t("requiredCredentials"));
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const authResponse = await loginRequest({ usernameOrEmail, password });
      const profile = await fetchProfile(authResponse.token);
      const rawPhoto = profile.profilePhotoBase64 ?? profile.profilePhoto ?? "";
      const cached = loadCachedPhoto();
      const extracted = extractBase64Payload(rawPhoto, cached?.mimeType ?? "");
      const photoBase64 = extracted.base64 || cached?.base64 || "";
      const photoMime = extracted.mimeType || cached?.mimeType || "";
      const photoFileName = profile.profilePhotoFileName ?? cached?.fileName ?? "";
      const photoDataUrl = rawPhoto && rawPhoto.startsWith("data:")
        ? rawPhoto
        : photoBase64
        ? buildDataUrl(photoBase64, photoMime)
        : cached?.base64
        ? buildDataUrl(cached.base64, cached.mimeType)
        : "";

      login(authResponse.token, {
        username: profile.username,
        email: profile.email,
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        profilePhoto: photoDataUrl,
        profilePhotoBase64: photoBase64,
        profilePhotoMimeType: photoMime,
        profilePhotoFileName: photoFileName,
        bio: profile.bio,
        timezone: profile.timezone,
        roles: profile.roles,
      });

      if (photoBase64) {
        storeCachedPhoto({ base64: photoBase64, mimeType: photoMime, fileName: photoFileName });
      } else {
        storeCachedPhoto(null);
      }

      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("loginError"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-background" />
      
      <div className="login-card">
        <div className="login-brand">
          <span className="login-logo">OM</span>
          <strong>OmniApp</strong>
        </div>

        <div className="login-form-container">
          <p className="login-lead">{loginLead}</p>

          {error && <div className="login-error">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span className="login-field-label">E-mail</span>
              <input
                type="text"
                value={usernameOrEmail}
                autoComplete="username"
                onChange={(event) => setUsernameOrEmail(event.target.value)}
                placeholder={language === "pt" ? "seu.email@exemplo.com" : "your.email@example.com"}
                className="login-input"
              />
            </label>

            <label className="login-field">
              <span className="login-field-label">{language === "pt" ? "Senha" : "Password"}</span>
              <input
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="login-input"
              />
            </label>

            <div className="login-footer">
              <span className="login-forgot">
                {language === "pt" ? "Esqueceu sua senha?" : "Forgot your password?"}{" "}
                <Link to="/reset-senha" className="login-link">
                  {language === "pt" ? "Clique aqui" : "Click here"}
                </Link>
              </span>

              <button
                className="login-button"
                type="submit"
                disabled={loading}
              >
                {loading ? (language === "pt" ? "Entrando..." : "Signing in...") : "login"}
              </button>

              <span className="login-forgot" style={{ textAlign: "center", marginTop: "16px" }}>
                {language === "pt" ? "Não tem uma conta?" : "Don't have an account?"}{" "}
                <Link to="/cadastro" className="login-link">
                  {language === "pt" ? "Criar conta" : "Sign up"}
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
