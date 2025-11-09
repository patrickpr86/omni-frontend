import { AppLayout } from "../components/AppLayout";
import { useLanguage } from "../context/LanguageContext";

export function SupportPage() {
  const { language } = useLanguage();

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">
          {language === "pt" ? "Atendimento" : "Support"}
        </h1>
        <p className="page-subtitle">
          {language === "pt"
            ? "Entre em contato conosco para suporte e assistência"
            : "Contact us for support and assistance"}
        </p>
      </div>

      <div className="support-container">
        <div className="support-card">
          <div className="support-icon">📧</div>
          <h3 className="support-card-title">E-mail</h3>
          <p className="support-card-description">
            {language === "pt"
              ? "Envie-nos um e-mail e responderemos em até 24 horas"
              : "Send us an email and we'll respond within 24 hours"}
          </p>
          <a href="mailto:support@omniapp.com" className="button">
            support@omniapp.com
          </a>
        </div>

        <div className="support-card">
          <div className="support-icon">💬</div>
          <h3 className="support-card-title">Chat</h3>
          <p className="support-card-description">
            {language === "pt"
              ? "Converse conosco em tempo real"
              : "Chat with us in real-time"}
          </p>
          <button className="button">
            {language === "pt" ? "Iniciar chat" : "Start chat"}
          </button>
        </div>

        <div className="support-card">
          <div className="support-icon">📚</div>
          <h3 className="support-card-title">
            {language === "pt" ? "Central de Ajuda" : "Help Center"}
          </h3>
          <p className="support-card-description">
            {language === "pt"
              ? "Encontre respostas para perguntas frequentes"
              : "Find answers to frequently asked questions"}
          </p>
          <button className="button button-secondary">
            {language === "pt" ? "Ver artigos" : "View articles"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

