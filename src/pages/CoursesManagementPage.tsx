import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { fetchAllCoursesAdmin, createCourse, deleteCourse, fetchCourseMetrics } from "../api/courses";
import type { Course, CourseMetrics, CourseRequest } from "../api/courses";

export function CoursesManagementPage() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [metrics, setMetrics] = useState<CourseMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CourseRequest>({
    title: "",
    description: "",
    price: 0,
    published: false,
    featured: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!token) return;
    try {
      const [coursesData, metricsData] = await Promise.all([
        fetchAllCoursesAdmin(token),
        fetchCourseMetrics(token)
      ]);
      setCourses(coursesData);
      setMetrics(metricsData);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await createCourse(token, formData);
      await loadData();
      setShowForm(false);
      setFormData({ title: "", description: "", price: 0, published: false, featured: false });
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm("Tem certeza que deseja excluir este curso?")) return;

    try {
      await deleteCourse(token, id);
      await loadData();
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">
          {language === "pt" ? "Gerenciar Cursos" : "Manage Courses"}
        </h1>
        <button className="button" onClick={() => setShowForm(!showForm)}>
          {showForm ? (language === "pt" ? "Cancelar" : "Cancel") : (language === "pt" ? "Novo Curso" : "New Course")}
        </button>
      </div>

      {metrics && (
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">{language === "pt" ? "Total de Cursos" : "Total Courses"}</span>
            <strong>{metrics.totalCourses}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">{language === "pt" ? "Publicados" : "Published"}</span>
            <strong>{metrics.publishedCourses}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">{language === "pt" ? "Inscrições" : "Enrollments"}</span>
            <strong>{metrics.totalEnrollments}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">{language === "pt" ? "Receita Total" : "Total Revenue"}</span>
            <strong>R$ {metrics.totalRevenue.toFixed(2)}</strong>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="panel">
          <h2>{language === "pt" ? "Novo Curso" : "New Course"}</h2>
          <div className="form-grid">
            <label className="form-field">
              <span>{language === "pt" ? "Título" : "Title"}</span>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="form-input"
              />
            </label>
            <label className="form-field">
              <span>{language === "pt" ? "Preço" : "Price"}</span>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="form-input"
              />
            </label>
          </div>
          <label className="form-field">
            <span>{language === "pt" ? "Descrição" : "Description"}</span>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea"
              rows={4}
            />
          </label>
          <div className="form-grid">
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              />
              <span>{language === "pt" ? "Publicado" : "Published"}</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              />
              <span>{language === "pt" ? "Destaque" : "Featured"}</span>
            </label>
          </div>
          <button type="submit" className="button">
            {language === "pt" ? "Criar Curso" : "Create Course"}
          </button>
        </form>
      )}

      {loading ? (
        <p>{language === "pt" ? "Carregando..." : "Loading..."}</p>
      ) : (
        <div className="content-grid">
          {courses.map((course) => (
            <div key={course.id} className="content-card" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="metric-foot">
                <span>{course.enrollmentCount} {language === "pt" ? "inscritos" : "enrolled"}</span>
                <span>R$ {course.price}</span>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                <button className="button button-secondary" onClick={() => handleDelete(course.id)}>
                  {language === "pt" ? "Excluir" : "Delete"}
                </button>
                <span className={`status ${course.published ? "status-confirmed" : "status-pending"}`}>
                  {course.published ? (language === "pt" ? "Publicado" : "Published") : (language === "pt" ? "Rascunho" : "Draft")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

