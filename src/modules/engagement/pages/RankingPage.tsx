import { AppLayout } from "@/shared/components/AppLayout";
import { BackButton } from "@/shared/components/BackButton";
import { useLanguage } from "@/core/context/LanguageContext.tsx";
import { useAuth } from "@/core/context/AuthContext.tsx";

export function RankingPage() {
  const { language } = useLanguage();
  const { user } = useAuth();

  const rankings = [
    { position: 1, name: "João Silva", points: 2500, avatar: "https://i.pravatar.cc/150?img=12" },
    { position: 2, name: "Maria Santos", points: 2350, avatar: "https://i.pravatar.cc/150?img=5" },
    { position: 3, name: "Pedro Costa", points: 2200, avatar: "https://i.pravatar.cc/150?img=33" },
    { position: 4, name: "Ana Oliveira", points: 2100, avatar: "https://i.pravatar.cc/150?img=9" },
    { position: 5, name: "Carlos Ferreira", points: 2000, avatar: "https://i.pravatar.cc/150?img=15" },
    { position: 6, name: user?.fullName || "Você", points: 1850, avatar: user?.profilePhoto || "https://i.pravatar.cc/150?img=20" },
    { position: 7, name: "Beatriz Lima", points: 1750, avatar: "https://i.pravatar.cc/150?img=10" },
    { position: 8, name: "Rafael Souza", points: 1600, avatar: "https://i.pravatar.cc/150?img=18" },
    { position: 9, name: "Juliana Alves", points: 1500, avatar: "https://i.pravatar.cc/150?img=16" },
    { position: 10, name: "Lucas Ribeiro", points: 1400, avatar: "https://i.pravatar.cc/150?img=11" },
  ];

  return (
    <AppLayout>
      <BackButton />
      <div className="page-header">
        <h1 className="page-title">Ranking</h1>
        <p className="page-subtitle">
          {language === "pt"
            ? "Confira os melhores alunos da plataforma"
            : "Check out the top students on the platform"}
        </p>
      </div>

      <div className="ranking-container">
        <div className="ranking-list">
          {rankings.map((item) => (
            <div
              key={item.position}
              className={`ranking-item ${
                item.name === (user?.fullName || "Você") ? "ranking-item-current" : ""
              }`}
            >
              <div className="ranking-position">
                {item.position <= 3 ? (
                  <span className={`medal medal-${item.position}`}>
                    {item.position === 1 ? "🥇" : item.position === 2 ? "🥈" : "🥉"}
                  </span>
                ) : (
                  <span className="position-number">{item.position}</span>
                )}
              </div>

              <img
                src={item.avatar}
                alt={item.name}
                className="ranking-avatar"
              />

              <div className="ranking-info">
                <strong className="ranking-name">{item.name}</strong>
                <span className="ranking-points">
                  {item.points} {language === "pt" ? "pontos" : "points"}
                </span>
              </div>

              {item.name === (user?.fullName || "Você") && (
                <span className="ranking-badge">
                  {language === "pt" ? "Você" : "You"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}


