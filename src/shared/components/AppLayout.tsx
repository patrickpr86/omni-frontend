import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/core/context/AuthContext.tsx";
import { useLanguage } from "@/core/context/LanguageContext.tsx";
import { useTheme } from "@/core/context/ThemeContext.tsx";
import { Sidebar } from "./Sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

function initialsFromName(name?: string) {
  if (!name) return "OM";
  const parts = name.trim().split(/\s+/);
  const [first, second] = parts;
  const letters = [first?.[0], second?.[0]].filter(Boolean);
  if (letters.length === 0 && parts[0]) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return letters.join("").toUpperCase();
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const roles = user?.roles ?? [];
  const notificationCount = roles.length > 0 ? roles.length : 0;
  const avatarPreview = user?.profilePhoto;
  const avatarFallback = initialsFromName(user?.fullName ?? user?.username);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleLanguage = () => {
    setLanguage(language === "pt" ? "en" : "pt");
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main">
        <header className="app-header">
          <div className="header-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder={language === "pt" ? "Pesquisar" : "Search"}
              className="search-input"
            />
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="header-icon-btn"
              onClick={toggleTheme}
              title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            <button
              type="button"
              className="header-icon-btn"
              onClick={toggleLanguage}
              title={language === "pt" ? "English" : "Português"}
            >
              {language === "pt" ? "PT" : "EN"}
            </button>

            <button
              type="button"
              className="header-notification"
              onClick={() => navigate("/notificacoes")}
              aria-label="Notificações"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </button>

            <div className="header-profile">
              <button
                type="button"
                className="profile-button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={user?.fullName ?? user?.username}
                    className="profile-avatar"
                  />
                ) : (
                  <span className="profile-avatar-fallback">
                    {avatarFallback}
                  </span>
                )}
              </button>

              {showProfileMenu && (
                <div className="profile-menu">
                  <div className="profile-menu-header">
                    <div className="profile-menu-info">
                      <strong>{user?.fullName ?? user?.username}</strong>
                      <span>{user?.email}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/minha-conta");
                    }}
                  >
                    {language === "pt" ? "Minha conta" : "My account"}
                  </button>
                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={handleLogout}
                  >
                    {language === "pt" ? "Sair" : "Sign out"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
