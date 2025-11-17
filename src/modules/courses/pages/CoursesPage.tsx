import { useState, useEffect } from "react";
import { AppLayout } from "@/shared/components/AppLayout";
import { BackButton } from "@/shared/components/BackButton";
import { useAuth } from "@/core/context/AuthContext.tsx";
import { useLanguage } from "@/core/context/LanguageContext.tsx";
import { fetchCourses, enrollInCourse } from "@/modules/courses/api/courses.ts";
import type { Course } from "@/modules/courses/api/courses.ts";

export function CoursesPage() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    if (!token) return;
    try {
      const data = await fetchCourses(token);
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    if (!token) return;
    try {
      await enrollInCourse(token, courseId);
      await loadCourses();
      alert(language === "pt" ? "Inscrição realizada com sucesso!" : "Enrolled successfully!");
    } catch (error) {
      console.error("Error enrolling:", error);
      alert(language === "pt" ? "Erro ao se inscrever" : "Error enrolling");
    }
  };

  return (
    <AppLayout>
      <BackButton />
      <div className="page-header">
        <h1 className="page-title">
          {language === "pt" ? "Cursos Disponíveis" : "Available Courses"}
        </h1>
        <p className="page-subtitle">
          {language === "pt" 
            ? "Explore e se inscreva nos nossos cursos"
            : "Explore and enroll in our courses"}
        </p>
      </div>

      {loading ? (
        <p>{language === "pt" ? "Carregando..." : "Loading..."}</p>
      ) : (
        <div className="content-grid">
          {courses.map((course) => (
            <div key={course.id} className="content-card" style={{ background: "linear-gradient(135deg, #1e2633 0%, #3b82f6 100%)", color: "white" }}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="metric-foot" style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)" }}>
                <span>{course.totalLessons} {language === "pt" ? "aulas" : "lessons"}</span>
                <span>{course.durationHours || 0}h</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <strong style={{ fontSize: "20px" }}>
                  R$ {course.discountPrice || course.price}
                </strong>
                {course.isEnrolled ? (
                  <span className="status status-confirmed">
                    {language === "pt" ? "Inscrito" : "Enrolled"}
                  </span>
                ) : (
                  <button 
                    className="button" 
                    onClick={() => handleEnroll(course.id)}
                    style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}
                  >
                    {language === "pt" ? "Inscrever-se" : "Enroll"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}


