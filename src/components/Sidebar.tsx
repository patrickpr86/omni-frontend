import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

type IconName =
  | "home"
  | "contents"
  | "ranking"
  | "profile"
  | "account"
  | "support"
  | "student"
  | "teacher"
  | "admin"
  | "calendar";

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  exact?: boolean;
}

function SidebarIcon({ name }: { name: IconName }) {
  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "contents":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    case "ranking":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 16v5l-4-3-4 3v-5" />
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "account":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3" />
          <circle cx="12" cy="10" r="3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case "support":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "student":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    case "teacher":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "admin":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    default:
      return null;
  }
}

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useAuth();
  const { language } = useLanguage();

  const roles = user?.roles ?? [];

  const navItems: NavItem[] = [
    { to: "/conteudos", label: language === "pt" ? "Conteúdos" : "Contents", icon: "contents", exact: true },
    { to: "/ranking", label: "Ranking", icon: "ranking" },
    { to: "/perfil", label: language === "pt" ? "Perfil" : "Profile", icon: "profile" },
    { to: "/minha-conta", label: language === "pt" ? "Minha conta" : "My Account", icon: "account" },
    { to: "/atendimento", label: language === "pt" ? "Atendimento" : "Support", icon: "support" },
  ];

  // Add role-specific items
  if (roles.includes("STUDENT")) {
    navItems.push({ to: "/painel/aluno", label: language === "pt" ? "Painel Aluno" : "Student Panel", icon: "student" });
  }
  if (roles.includes("TEACHER")) {
    navItems.push({ to: "/painel/instrutor", label: language === "pt" ? "Painel Professor" : "Teacher Panel", icon: "teacher" });
  }
  if (roles.includes("ADMIN")) {
    navItems.push({ to: "/painel/admin", label: language === "pt" ? "Painel Admin" : "Admin Panel", icon: "admin" });
  }

  return (
    <aside className={`sidebar ${isExpanded ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      <div className="sidebar-header">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Recolher menu" : "Expandir menu"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {isExpanded && (
          <Link to="/" className="sidebar-logo">
            <span className="logo-icon">OM</span>
            <span className="logo-text">OmniApp</span>
          </Link>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? "sidebar-nav-item-active" : ""}`
            }
            title={!isExpanded ? item.label : undefined}
          >
            <span className="sidebar-nav-icon">
              <SidebarIcon name={item.icon} />
            </span>
            {isExpanded && <span className="sidebar-nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

