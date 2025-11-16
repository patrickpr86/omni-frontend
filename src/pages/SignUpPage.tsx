import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, type RegisterRequest } from "../api/auth.ts";
import { useLanguage } from "../context/LanguageContext.tsx";

export function SignUpPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [formData, setFormData] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signUpLead =
    language === "pt"
      ? "Crie sua conta e comece a treinar hoje!"
      : "Create your account and start training today!";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Validações
    if (!formData.username || !formData.email || !formData.password) {
      setError(language === "pt" ? "Preencha todos os campos obrigatórios" : "Fill all required fields");
      return;
    }

    if (formData.username.length < 3) {
      setError(language === "pt" ? "Username deve ter no mínimo 3 caracteres" : "Username must be at least 3 characters");
      return;
    }

    if (formData.password.length < 6) {
      setError(language === "pt" ? "Senha deve ter no mínimo 6 caracteres" : "Password must be at least 6 characters");
      return;
    }

    if (formData.password !== confirmPassword) {
      setError(language === "pt" ? "As senhas não coincidem" : "Passwords do not match");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await registerUser(formData);
      alert(
        language === "pt"
          ? "Conta criada com sucesso! Faça login para continuar."
          : "Account created successfully! Please login to continue."
      );
      navigate("/login");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(language === "pt" ? "Erro ao criar conta" : "Error creating account");
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
          <p className="login-lead">{signUpLead}</p>

          {error && <div className="login-error">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span className="login-field-label">
                Username * <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>(mínimo 3 caracteres)</span>
              </span>
              <input
                type="text"
                value={formData.username}
                onChange={(event) => setFormData({ ...formData, username: event.target.value })}
                placeholder={language === "pt" ? "seu_username" : "your_username"}
                className="login-input"
                required
                minLength={3}
              />
            </label>

            <label className="login-field">
              <span className="login-field-label">E-mail *</span>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                placeholder={
                  language === "pt" ? "seu.email@exemplo.com" : "your.email@example.com"
                }
                className="login-input"
                required
              />
            </label>

            <label className="login-field">
              <span className="login-field-label">
                {language === "pt" ? "Senha" : "Password"} * <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>(mínimo 6 caracteres)</span>
              </span>
              <input
                type="password"
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                placeholder="••••••••"
                className="login-input"
                required
                minLength={6}
              />
            </label>

            <label className="login-field">
              <span className="login-field-label">
                {language === "pt" ? "Confirmar Senha" : "Confirm Password"} *
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                className="login-input"
                required
              />
            </label>

            <label className="login-field">
              <span className="login-field-label">
                {language === "pt" ? "Nome Completo" : "Full Name"} ({language === "pt" ? "opcional" : "optional"})
              </span>
              <input
                type="text"
                value={formData.fullName}
                onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                placeholder={language === "pt" ? "Seu Nome Completo" : "Your Full Name"}
                className="login-input"
              />
            </label>

            <label className="login-field">
              <span className="login-field-label">
                {language === "pt" ? "Telefone" : "Phone"} ({language === "pt" ? "opcional" : "optional"})
              </span>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(event) => setFormData({ ...formData, phoneNumber: event.target.value })}
                placeholder={language === "pt" ? "(11) 99999-9999" : "+55 11 99999-9999"}
                className="login-input"
              />
            </label>

            <div className="login-footer">
              <span className="login-forgot">
                {language === "pt" ? "Já tem uma conta?" : "Already have an account?"}{" "}
                <Link to="/login" className="login-link">
                  {language === "pt" ? "Faça login" : "Sign in"}
                </Link>
              </span>

              <button className="login-button" type="submit" disabled={loading}>
                {loading
                  ? language === "pt"
                    ? "Criando conta..."
                    : "Creating account..."
                  : language === "pt"
                  ? "Criar Conta"
                  : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

