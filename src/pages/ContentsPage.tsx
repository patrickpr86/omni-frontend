import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { BackButton } from "../components/BackButton";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { fetchCourses, type Course } from "../api/courses";

export function ContentsPage() {
  const { language } = useLanguage();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await fetchCourses(token || "");
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, discountPrice?: number) => {
    if (discountPrice && discountPrice < price) {
      return (
        <>
          <span style={{ textDecoration: "line-through", color: "var(--text-muted)", marginRight: "8px" }}>
            R$ {price.toFixed(2)}
          </span>
          <span style={{ color: "var(--success)", fontWeight: "bold" }}>
            R$ {discountPrice.toFixed(2)}
          </span>
        </>
      );
    }
    return price > 0 ? `R$ ${price.toFixed(2)}` : language === "pt" ? "Grátis" : "Free";
  };

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case "BEGINNER":
        return "var(--success)";
      case "INTERMEDIATE":
        return "var(--warning)";
      case "ADVANCED":
        return "var(--danger)";
      default:
        return "var(--text-muted)";
    }
  };

  const getDifficultyLabel = (level?: string) => {
    switch (level) {
      case "BEGINNER":
        return language === "pt" ? "Iniciante" : "Beginner";
      case "INTERMEDIATE":
        return language === "pt" ? "Intermediário" : "Intermediate";
      case "ADVANCED":
        return language === "pt" ? "Avançado" : "Advanced";
      default:
        return level || "";
    }
  };

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

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px" }}>
          <p>{language === "pt" ? "Carregando cursos..." : "Loading courses..."}</p>
        </div>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px" }}>
          <p>{language === "pt" ? "Nenhum curso disponível" : "No courses available"}</p>
        </div>
      ) : (
        <div className="content-grid">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="content-card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/cursos/${course.id}`)}
            >
              {course.thumbnailUrl ? (
                <div style={{ position: "relative", zIndex: 1 }}>
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="content-card-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Course";
                    }}
                  />
                </div>
              ) : (
                <div 
                  className="content-card-image" 
                  style={{ 
                    backgroundColor: "var(--border-color)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    color: "var(--text-muted)"
                  }}
                >
                  {language === "pt" ? "Sem imagem" : "No image"}
                </div>
              )}
              <div className="content-card-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <h3 className="content-card-title" style={{ flex: 1, margin: 0 }}>{course.title}</h3>
                  {course.featured && (
                    <span style={{ 
                      background: "var(--primary)", 
                      color: "white", 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px",
                      marginLeft: "8px"
                    }}>
                      {language === "pt" ? "Destaque" : "Featured"}
                    </span>
                  )}
                </div>
                <p className="content-card-description" style={{ 
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  marginBottom: "12px"
                }}>
                  {course.description || (language === "pt" ? "Sem descrição" : "No description")}
                </p>
                
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                  {course.difficultyLevel && (
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px",
                      backgroundColor: getDifficultyColor(course.difficultyLevel) + "20",
                      color: getDifficultyColor(course.difficultyLevel)
                    }}>
                      {getDifficultyLabel(course.difficultyLevel)}
                    </span>
                  )}
                  {course.durationHours && (
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px",
                      backgroundColor: "var(--border-color)"
                    }}>
                      {course.durationHours}h
                    </span>
                  )}
                  {course.totalLessons > 0 && (
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px",
                      backgroundColor: "var(--border-color)"
                    }}>
                      {course.totalLessons} {language === "pt" ? "aulas" : "lessons"}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                  <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                    {formatPrice(course.price, course.discountPrice)}
                  </div>
                  {course.instructor && (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {course.instructor.name}
                    </div>
                  )}
                </div>

                {course.isEnrolled && (
                  <div style={{ 
                    marginTop: "8px", 
                    padding: "8px", 
                    backgroundColor: "var(--success)20", 
                    borderRadius: "4px",
                    textAlign: "center",
                    fontSize: "14px",
                    color: "var(--success)",
                    fontWeight: "bold"
                  }}>
                    {language === "pt" ? "✓ Inscrito" : "✓ Enrolled"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
