import { useState } from "react";
import type { FormEvent } from "react";
import { AppLayout } from "../components/AppLayout";
import { BackButton } from "../components/BackButton";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export function MyAccountPage() {
  const { user, updateUser } = useAuth();
  const { language } = useLanguage();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [timezone, setTimezone] = useState(user?.timezone || "GMT-03:00");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProfileUpdate = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      updateUser({
        ...user!,
        fullName,
        phoneNumber,
        bio,
        timezone,
      });
      setSuccess(language === "pt" ? "Perfil atualizado com sucesso!" : "Profile updated successfully!");
    } catch (err) {
      setError(language === "pt" ? "Erro ao atualizar perfil" : "Error updating profile");
    }
  };

  const handlePasswordChange = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError(language === "pt" ? "As senhas não coincidem" : "Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError(language === "pt" ? "A senha deve ter pelo menos 6 caracteres" : "Password must be at least 6 characters");
      return;
    }

    setSuccess(language === "pt" ? "Senha alterada com sucesso!" : "Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <AppLayout>
      <BackButton />
      <div className="page-header">
        <h1 className="page-title">
          {language === "pt" ? "Minha Conta" : "My Account"}
        </h1>
        <p className="page-subtitle">
          {language === "pt" ? "Gerencie suas informações pessoais" : "Manage your personal information"}
        </p>
      </div>

      {success && (
        <div className="alert alert-success">{success}</div>
      )}
      
      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      <div className="account-container">
        <section className="account-section">
          <h2 className="section-title">
            {language === "pt" ? "Meu perfil" : "My Profile"}
          </h2>
          <p className="section-description">
            {language === "pt"
              ? "Conte um pouco sobre você para seus colegas de turma."
              : "Tell your classmates a little about yourself."}
          </p>

          <form onSubmit={handleProfileUpdate} className="account-form">
            <div className="form-row">
              <label className="form-field">
                <span className="field-label">
                  {language === "pt" ? "Nome completo" : "Full name"}
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={language === "pt" ? "Patrick Pascoal Ribeiro" : "John Doe"}
                  className="form-input"
                />
              </label>

              <label className="form-field">
                <span className="field-label">
                  {language === "pt" ? "Telefone" : "Phone"}
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(19) 98307-5359"
                  className="form-input"
                />
              </label>
            </div>

            <label className="form-field">
              <span className="field-label">
                {language === "pt" ? "Biografia" : "Bio"}
              </span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Software Engineer"
                className="form-textarea"
                rows={4}
              />
            </label>

            <label className="form-field">
              <span className="field-label">
                {language === "pt" ? "Fuso horário" : "Timezone"}
              </span>
              <p className="field-description">
                {language === "pt"
                  ? "Ajuste a data e hora da plataforma conforme sua região."
                  : "Adjust the platform date and time according to your region."}
              </p>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="form-select"
              >
                <option value="GMT-03:00">(GMT-03:00) Brasília</option>
                <option value="GMT-05:00">(GMT-05:00) New York</option>
                <option value="GMT+00:00">(GMT+00:00) London</option>
                <option value="GMT+01:00">(GMT+01:00) Paris</option>
                <option value="GMT+09:00">(GMT+09:00) Tokyo</option>
              </select>
            </label>

            <button type="submit" className="button">
              {language === "pt" ? "Salvar alterações" : "Save changes"}
            </button>
          </form>
        </section>

        <section className="account-section">
          <h2 className="section-title">
            {language === "pt" ? "Alterar senha" : "Change Password"}
          </h2>
          <p className="section-description">
            {language === "pt"
              ? "Deixe em branco caso não queira alterá-la."
              : "Leave blank if you don't want to change it."}
          </p>

          <form onSubmit={handlePasswordChange} className="account-form">
            <label className="form-field">
              <span className="field-label">
                {language === "pt" ? "Senha atual" : "Current password"}
              </span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input"
              />
            </label>

            <div className="form-row">
              <label className="form-field">
                <span className="field-label">
                  {language === "pt" ? "Nova senha" : "New password"}
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                />
              </label>

              <label className="form-field">
                <span className="field-label">
                  {language === "pt" ? "Confirme sua nova senha" : "Confirm new password"}
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                />
              </label>
            </div>

            <button type="submit" className="button">
              {language === "pt" ? "Alterar senha" : "Change password"}
            </button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}

