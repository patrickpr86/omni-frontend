import { AppLayout } from "../components/AppLayout";
import { BackButton } from "../components/BackButton";
import { useLanguage } from "../context/LanguageContext";

export function NotificationsPage() {
  const { language } = useLanguage();

  const notifications = [
    {
      id: 1,
      title: language === "pt" ? "Novo curso disponível" : "New course available",
      message: language === "pt" 
        ? "O curso de TypeScript Avançado já está disponível na plataforma."
        : "The Advanced TypeScript course is now available on the platform.",
      time: language === "pt" ? "há 2 horas" : "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: language === "pt" ? "Atualização de perfil" : "Profile update",
      message: language === "pt"
        ? "Suas informações de perfil foram atualizadas com sucesso."
        : "Your profile information has been successfully updated.",
      time: language === "pt" ? "há 1 dia" : "1 day ago",
      read: true,
    },
    {
      id: 3,
      title: language === "pt" ? "Nova conquista" : "New achievement",
      message: language === "pt"
        ? "Você desbloqueou a conquista 'Estudante Dedicado'!"
        : "You've unlocked the 'Dedicated Student' achievement!",
      time: language === "pt" ? "há 3 dias" : "3 days ago",
      read: true,
    },
  ];

  return (
    <AppLayout>
      <BackButton />
      <div className="page-header">
        <h1 className="page-title">
          {language === "pt" ? "Notificações" : "Notifications"}
        </h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            {language === "pt" 
              ? `${notifications.filter(n => !n.read).length} não lidas` 
              : `${notifications.filter(n => !n.read).length} unread`}
          </p>
          <button className="button button-secondary">
            {language === "pt" ? "Marcar todas como lidas" : "Mark all as read"}
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-item ${!notification.read ? "notification-unread" : ""}`}
          >
            <div className="notification-indicator" />
            <div className="notification-content">
              <h3 className="notification-title">{notification.title}</h3>
              <p className="notification-message">{notification.message}</p>
              <span className="notification-time">{notification.time}</span>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

