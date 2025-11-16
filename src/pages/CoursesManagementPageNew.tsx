import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { BackButton } from "../components/BackButton";
import {
  getAllCoursesAdmin,
  createCourseAdmin,
  updateCourseAdmin,
  deleteCourseAdmin,
  type CourseResponse,
  type UpdateCourseRequest,
} from "../api/admin";

export function CoursesManagementPageNew() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null);
  const [formData, setFormData] = useState<UpdateCourseRequest>({
    title: "",
    description: "",
    price: 0,
    published: false,
    featured: false,
    durationHours: 0,
    difficultyLevel: "BEGINNER",
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getAllCoursesAdmin(token);
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
      alert("Erro ao carregar cursos: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingCourse) {
        await updateCourseAdmin(token, editingCourse.id, formData);
        alert("Curso atualizado com sucesso!");
      } else {
        await createCourseAdmin(token, formData);
        alert("Curso criado com sucesso!");
      }
      await loadCourses();
      resetForm();
    } catch (error) {
      console.error("Error saving course:", error);
      alert(
        `Erro ao ${editingCourse ? "atualizar" : "criar"} curso: ` +
          (error as Error).message
      );
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!token) return;
    if (!confirm(`Tem certeza que deseja excluir o curso "${title}"?`)) return;

    try {
      await deleteCourseAdmin(token, id);
      await loadCourses();
      alert("Curso excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Erro ao excluir curso: " + (error as Error).message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCourse(null);
    setFormData({
      title: "",
      description: "",
      price: 0,
      published: false,
      featured: false,
      durationHours: 0,
      difficultyLevel: "BEGINNER",
    });
  };

  const openEditForm = (course: CourseResponse) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      price: course.price,
      discountPrice: course.discountPrice,
      published: course.published,
      featured: course.featured,
      durationHours: course.durationHours || 0,
      difficultyLevel: course.difficultyLevel || "BEGINNER",
      thumbnailUrl: course.thumbnailUrl,
    });
    setShowForm(true);
  };

  return (
    <AppLayout>
      <BackButton to="/painel/admin" />
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {language === "pt" ? "Gerenciar Cursos" : "Manage Courses"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {language === "pt"
              ? "Cadastre, edite e publique cursos online"
              : "Register, edit and publish online courses"}
          </p>
        </div>
        <button
          className="button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
              setEditingCourse(null);
            }
          }}
        >
          {showForm
            ? language === "pt"
              ? "Cancelar"
              : "Cancel"
            : language === "pt"
            ? "Novo Curso"
            : "New Course"}
        </button>
      </div>

      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card">
          <span className="metric-label">
            {language === "pt" ? "Total de Cursos" : "Total Courses"}
          </span>
          <strong>{courses.length}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            {language === "pt" ? "Publicados" : "Published"}
          </span>
          <strong>{courses.filter((c) => c.published).length}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            {language === "pt" ? "Total de Inscrições" : "Total Enrollments"}
          </span>
          <strong>
            {courses.reduce((sum, c) => sum + c.enrollmentCount, 0)}
          </strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            {language === "pt" ? "Receita Total" : "Total Revenue"}
          </span>
          <strong>
            R${" "}
            {courses
              .reduce(
                (sum, c) =>
                  sum + c.enrollmentCount * (c.discountPrice || c.price),
                0
              )
              .toFixed(2)}
          </strong>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="panel" style={{ marginBottom: "24px" }}>
          <h2>
            {editingCourse
              ? language === "pt"
                ? "Editar Curso"
                : "Edit Course"
              : language === "pt"
              ? "Novo Curso"
              : "New Course"}
          </h2>
          <div className="form-grid">
            <label className="form-field">
              <span>{language === "pt" ? "Título" : "Title"} *</span>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="form-input"
                placeholder="Nome do curso"
              />
            </label>
            <label className="form-field">
              <span>{language === "pt" ? "Duração (horas)" : "Duration (hours)"}</span>
              <input
                type="number"
                value={formData.durationHours || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationHours: parseInt(e.target.value) || 0,
                  })
                }
                className="form-input"
                placeholder="40"
              />
            </label>
          </div>
          <label className="form-field">
            <span>{language === "pt" ? "Descrição" : "Description"}</span>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="form-textarea"
              rows={4}
              placeholder="Descreva o conteúdo do curso..."
            />
          </label>
          <div className="form-grid">
            <label className="form-field">
              <span>{language === "pt" ? "URL da Thumbnail" : "Thumbnail URL"}</span>
              <input
                type="url"
                value={formData.thumbnailUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnailUrl: e.target.value })
                }
                className="form-input"
                placeholder="https://example.com/image.jpg"
              />
            </label>
            <label className="form-field">
              <span>{language === "pt" ? "Nível de Dificuldade" : "Difficulty Level"}</span>
              <select
                value={formData.difficultyLevel}
                onChange={(e) =>
                  setFormData({ ...formData, difficultyLevel: e.target.value })
                }
                className="form-input"
              >
                <option value="BEGINNER">
                  {language === "pt" ? "Iniciante" : "Beginner"}
                </option>
                <option value="INTERMEDIATE">
                  {language === "pt" ? "Intermediário" : "Intermediate"}
                </option>
                <option value="ADVANCED">
                  {language === "pt" ? "Avançado" : "Advanced"}
                </option>
              </select>
            </label>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>{language === "pt" ? "Preço (R$)" : "Price (R$)"}</span>
              <input
                type="number"
                step="0.01"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className="form-input"
                placeholder="199.90"
              />
            </label>
            <label className="form-field">
              <span>{language === "pt" ? "Preço com Desconto" : "Discount Price"}</span>
              <input
                type="number"
                step="0.01"
                value={formData.discountPrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountPrice: parseFloat(e.target.value) || undefined,
                  })
                }
                className="form-input"
                placeholder="149.90"
              />
            </label>
          </div>
          <div className="form-grid">
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
              />
              <span>{language === "pt" ? "Publicado" : "Published"}</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
              />
              <span>{language === "pt" ? "Destaque" : "Featured"}</span>
            </label>
          </div>
          <button type="submit" className="button">
            {editingCourse
              ? language === "pt"
                ? "Atualizar Curso"
                : "Update Course"
              : language === "pt"
              ? "Criar Curso"
              : "Create Course"}
          </button>
        </form>
      )}

      {loading ? (
        <p>{language === "pt" ? "Carregando..." : "Loading..."}</p>
      ) : (
        <div className="content-grid">
          {courses.map((course) => (
            <div
              key={course.id}
              className="content-card"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {course.thumbnailUrl && (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "8px 8px 0 0",
                    marginBottom: "12px",
                  }}
                />
              )}
              <h3>{course.title}</h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                {course.description || "Sem descrição"}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "8px",
                  flexWrap: "wrap",
                }}
              >
                {course.difficultyLevel && (
                  <span className="status status-pending">
                    {course.difficultyLevel}
                  </span>
                )}
                {course.durationHours && (
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {course.durationHours}h
                  </span>
                )}
              </div>
              <div className="metric-foot" style={{ marginTop: "12px" }}>
                <span>
                  {course.enrollmentCount}{" "}
                  {language === "pt" ? "inscritos" : "enrolled"}
                </span>
                <span>
                  R$ {course.discountPrice || course.price}
                  {course.discountPrice && (
                    <span
                      style={{
                        textDecoration: "line-through",
                        marginLeft: "4px",
                        fontSize: "12px",
                        color: "var(--text-muted)",
                      }}
                    >
                      R$ {course.price}
                    </span>
                  )}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "auto",
                  paddingTop: "12px",
                }}
              >
                <button
                  className="button"
                  onClick={() => openEditForm(course)}
                  style={{ flex: 1 }}
                >
                  {language === "pt" ? "Editar" : "Edit"}
                </button>
                <button
                  className="button button-secondary"
                  onClick={() => handleDelete(course.id, course.title)}
                >
                  {language === "pt" ? "Excluir" : "Delete"}
                </button>
              </div>
              <span
                className={`status ${
                  course.published ? "status-confirmed" : "status-pending"
                }`}
                style={{ marginTop: "8px", display: "inline-block" }}
              >
                {course.published
                  ? language === "pt"
                    ? "Publicado"
                    : "Published"
                  : language === "pt"
                  ? "Rascunho"
                  : "Draft"}
              </span>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

