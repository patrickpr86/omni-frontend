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
  | "calendar"
  | "users"
  | "courses"
  | "money"
  | "earnings"
  | "booking"
  | "classes"
  | "timeline"
  | "championship";

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
    case "users":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "courses":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "money":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
          <path d="M12 18V6" />
        </svg>
      );
    case "earnings":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "booking":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
        </svg>
      );
    case "classes":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "timeline":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="2" x2="12" y2="22" />
          <circle cx="12" cy="2" r="2" />
          <circle cx="12" cy="8" r="2" />
          <circle cx="12" cy="14" r="2" />
          <circle cx="12" cy="20" r="2" />
        </svg>
      );
    case "championship":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
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
    { to: "/eventos", label: language === "pt" ? "Eventos" : "Events", icon: "timeline" },
    { to: "/minha-agenda", label: language === "pt" ? "Minha Agenda" : "My Agenda", icon: "calendar" },
    { to: "/campeonatos", label: language === "pt" ? "Campeonatos" : "Championships", icon: "championship" },
    { to: "/minha-conta", label: language === "pt" ? "Minha Conta" : "My Account", icon: "account" },
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
    navItems.push({ to: "/admin/usuarios", label: language === "pt" ? "Gerenciar Usuários" : "Manage Users", icon: "users" });
    navItems.push({ to: "/admin/cursos", label: language === "pt" ? "Gerenciar Cursos" : "Manage Courses", icon: "courses" });
    navItems.push({ to: "/admin/financeiro", label: language === "pt" ? "Financeiro" : "Financial", icon: "money" });
    navItems.push({ to: "/admin/timeline", label: language === "pt" ? "Gerenciar Timeline" : "Manage Timeline", icon: "timeline" });
  }

  // Financial links for students
  if (roles.includes("STUDENT")) {
    navItems.push({ to: "/minhas-financas", label: language === "pt" ? "Minhas Finanças" : "My Finances", icon: "money" });
  }

  // Financial links for instructors
  if (roles.includes("INSTRUCTOR")) {
    navItems.push({ to: "/meus-ganhos", label: language === "pt" ? "Meus Ganhos" : "My Earnings", icon: "earnings" });
  }

  // Booking links for students
  if (roles.includes("STUDENT")) {
    navItems.push({ to: "/professores-disponiveis", label: language === "pt" ? "Agendar Aula" : "Schedule Lesson", icon: "booking" });
    navItems.push({ to: "/minhas-aulas", label: language === "pt" ? "Minhas Aulas" : "My Lessons", icon: "classes" });
  }

  // Booking links for instructors
  if (roles.includes("INSTRUCTOR")) {
    navItems.push({ to: "/gerenciar-solicitacoes", label: language === "pt" ? "Solicitações" : "Requests", icon: "calendar" });
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

