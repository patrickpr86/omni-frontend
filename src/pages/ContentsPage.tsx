import { AppLayout } from "../components/AppLayout";
import { BackButton } from "../components/BackButton";
import { useLanguage } from "../context/LanguageContext";

export function ContentsPage() {
  const { language } = useLanguage();

  const contents = [
    {
      id: 1,
      title: language === "pt" ? "Boas Práticas em Desenvolvimento" : "Development Best Practices",
      description: language === "pt" 
        ? "Aprenda as melhores práticas para desenvolvimento de software moderno."
        : "Learn the best practices for modern software development.",
      image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      title: language === "pt" ? "Arquitetura de Microserviços" : "Microservices Architecture",
      description: language === "pt"
        ? "Entenda como construir aplicações escaláveis com microserviços."
        : "Understand how to build scalable applications with microservices.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      title: language === "pt" ? "TypeScript Avançado" : "Advanced TypeScript",
      description: language === "pt"
        ? "Domine os recursos avançados do TypeScript para aplicações robustas."
        : "Master advanced TypeScript features for robust applications.",
      image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=300&fit=crop",
    },
    {
      id: 4,
      title: language === "pt" ? "React & Performance" : "React & Performance",
      description: language === "pt"
        ? "Otimize suas aplicações React para máxima performance."
        : "Optimize your React applications for maximum performance.",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
    },
    {
      id: 5,
      title: language === "pt" ? "DevOps & CI/CD" : "DevOps & CI/CD",
      description: language === "pt"
        ? "Automatize seus pipelines e melhore o deploy de aplicações."
        : "Automate your pipelines and improve application deployment.",
      image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=300&fit=crop",
    },
    {
      id: 6,
      title: language === "pt" ? "Segurança em Aplicações Web" : "Web Application Security",
      description: language === "pt"
        ? "Proteja suas aplicações contra vulnerabilidades comuns."
        : "Protect your applications against common vulnerabilities.",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop",
    },
  ];

  return (
    <AppLayout>
      <BackButton />
      <div className="page-header">
        <h1 className="page-title">
          {language === "pt" ? "Conteúdos" : "Contents"}
        </h1>
        <p className="page-subtitle">
          {language === "pt" 
            ? "Explore nossos cursos e materiais de aprendizado" 
            : "Explore our courses and learning materials"}
        </p>
      </div>

      <div className="content-grid">
        {contents.map((content) => (
          <div key={content.id} className="content-card">
            <img
              src={content.image}
              alt={content.title}
              className="content-card-image"
            />
            <div className="content-card-body">
              <h3 className="content-card-title">{content.title}</h3>
              <p className="content-card-description">{content.description}</p>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}


