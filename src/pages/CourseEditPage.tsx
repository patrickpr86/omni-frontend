import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { BackButton } from "../components/BackButton";
import {
  getAllCoursesAdmin,
  updateCourseAdmin,
  uploadCourseThumbnail,
  uploadVideo,
  uploadAudio,
  uploadImage,
  uploadDocument,
  createCourseSection,
  updateCourseSection,
  deleteCourseSection,
  getCourseSections,
  type CourseResponse,
  type UpdateCourseRequest,
  type CourseSectionRequest,
} from "../api/admin";

export function CourseEditPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { language } = useLanguage();
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "sections">("info");

  const [courseFormData, setCourseFormData] = useState<UpdateCourseRequest>({
    title: "",
    description: "",
    price: 0,
    published: false,
    featured: false,
    durationHours: 0,
    difficultyLevel: "BEGINNER",
    targetAudience: "",
  });

  const [sectionFormData, setSectionFormData] = useState<CourseSectionRequest>({
    title: "",
    description: "",
    usefulLinks: "",
    orderIndex: 0,
    videoLesson: {
      title: "",
      description: "",
      videoUrl: "",
      durationMinutes: 0,
      orderIndex: 0,
    },
    materials: [],
  });

  useEffect(() => {
    if (courseId && token) {
      loadCourseData();
    }
  }, [courseId, token]);

  const loadCourseData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const courses = await getAllCoursesAdmin(token);
      const foundCourse = courses.find((c) => c.id === parseInt(courseId || "0"));
      
      if (!foundCourse) {
        alert(language === "pt" ? "Curso não encontrado" : "Course not found");
        navigate("/admin/cursos");
        return;
      }

      setCourse(foundCourse);
      setCourseFormData({
        title: foundCourse.title,
        description: foundCourse.description || "",
        price: foundCourse.price,
        discountPrice: foundCourse.discountPrice,
        published: foundCourse.published,
        featured: foundCourse.featured,
        durationHours: foundCourse.durationHours || 0,
        difficultyLevel: foundCourse.difficultyLevel || "BEGINNER",
        thumbnailUrl: foundCourse.thumbnailUrl,
        targetAudience: (foundCourse as any).targetAudience || "",
        instructorId: foundCourse.instructor?.id,
      });

      const sectionsData = await getCourseSections(token, foundCourse.id);
      setSections(sectionsData);
    } catch (error) {
      console.error("Error loading course:", error);
      alert("Erro ao carregar curso: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    type: "thumbnail" | "video" | "audio" | "image" | "document"
  ): Promise<string> => {
    if (!token) throw new Error("No token");
    
    setUploading(type);
    try {
      let response;
      switch (type) {
        case "thumbnail":
          response = await uploadCourseThumbnail(token, file);
          break;
        case "video":
          response = await uploadVideo(token, file);
          break;
        case "audio":
          response = await uploadAudio(token, file);
          break;
        case "image":
          response = await uploadImage(token, file);
          break;
        case "document":
          response = await uploadDocument(token, file);
          break;
      }
      return response.url;
    } finally {
      setUploading(null);
    }
  };

  const handleCourseSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !course) return;

    try {
      await updateCourseAdmin(token, course.id, courseFormData);
      alert(language === "pt" ? "Curso atualizado com sucesso!" : "Course updated successfully!");
      await loadCourseData();
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Erro ao atualizar curso: " + (error as Error).message);
    }
  };

  const handleSectionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !course) return;

    try {
      // Preparar dados da seção - só incluir videoLesson se houver videoUrl
      const sectionData: CourseSectionRequest = {
        title: sectionFormData.title,
        description: sectionFormData.description,
        usefulLinks: sectionFormData.usefulLinks,
        orderIndex: sectionFormData.orderIndex,
        materials: sectionFormData.materials,
      };

      // Só incluir videoLesson se houver videoUrl válido
      if (sectionFormData.videoLesson?.videoUrl && sectionFormData.videoLesson.videoUrl.trim() !== "") {
        sectionData.videoLesson = sectionFormData.videoLesson;
      }

      if (editingSection) {
        await updateCourseSection(token, course.id, editingSection.id, sectionData);
        alert(language === "pt" ? "Seção atualizada com sucesso!" : "Section updated successfully!");
      } else {
        await createCourseSection(token, course.id, sectionData);
        alert(language === "pt" ? "Seção criada com sucesso!" : "Section created successfully!");
      }
      await loadCourseData();
      resetSectionForm();
    } catch (error) {
      console.error("Error saving section:", error);
      alert("Erro ao salvar seção: " + (error as Error).message);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!token || !course) return;
    if (!confirm(language === "pt" ? "Tem certeza que deseja excluir esta seção?" : "Are you sure you want to delete this section?")) return;

    try {
      await deleteCourseSection(token, course.id, sectionId);
      await loadCourseData();
      alert(language === "pt" ? "Seção excluída com sucesso!" : "Section deleted successfully!");
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("Erro ao excluir seção: " + (error as Error).message);
    }
  };

  const openEditSection = (section: any) => {
    setEditingSection(section);
    setSectionFormData({
      title: section.title,
      description: section.description || "",
      usefulLinks: section.usefulLinks || "",
      orderIndex: section.orderIndex || 0,
      videoLesson: section.videoLesson ? {
        title: section.videoLesson.title || "",
        description: section.videoLesson.description || "",
        videoUrl: section.videoLesson.videoUrl || "",
        durationMinutes: section.videoLesson.durationMinutes || 0,
        orderIndex: section.videoLesson.orderIndex || 0,
      } : {
        title: "",
        description: "",
        videoUrl: "",
        durationMinutes: 0,
        orderIndex: 0,
      },
      materials: section.materials || [],
    });
    setShowSectionForm(true);
  };

  const resetSectionForm = () => {
    setShowSectionForm(false);
    setEditingSection(null);
    setSectionFormData({
      title: "",
      description: "",
      usefulLinks: "",
      orderIndex: 0,
      videoLesson: {
        title: "",
        description: "",
        videoUrl: "",
        durationMinutes: 0,
        orderIndex: 0,
      },
      materials: [],
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <p>{language === "pt" ? "Carregando..." : "Loading..."}</p>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout>
        <p>{language === "pt" ? "Curso não encontrado" : "Course not found"}</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <BackButton to="/admin/cursos" />
      
      <div className="page-header">
        <div>
          <h1 className="page-title">{course.title}</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {language === "pt"
              ? "Gerencie as informações do curso e suas aulas"
              : "Manage course information and lessons"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "2px solid var(--border-color)" }}>
        <button
          className={`button ${activeTab === "info" ? "" : "button-secondary"}`}
          onClick={() => setActiveTab("info")}
          style={{ borderBottom: activeTab === "info" ? "2px solid var(--primary)" : "none", borderRadius: "0" }}
        >
          {language === "pt" ? "Informações do Curso" : "Course Information"}
        </button>
        <button
          className={`button ${activeTab === "sections" ? "" : "button-secondary"}`}
          onClick={() => setActiveTab("sections")}
          style={{ borderBottom: activeTab === "sections" ? "2px solid var(--primary)" : "none", borderRadius: "0" }}
        >
          {language === "pt" ? "Aulas (Seções)" : "Lessons (Sections)"} ({sections.length})
        </button>
      </div>

      {activeTab === "info" && (
        <form onSubmit={handleCourseSubmit} className="panel">
          <h2>{language === "pt" ? "Editar Informações do Curso" : "Edit Course Information"}</h2>
          
          <div className="form-grid">
            <label className="form-field">
              <span>{language === "pt" ? "Título" : "Title"} *</span>
              <input
                type="text"
                value={courseFormData.title}
                onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                required
                className="form-input"
              />
            </label>
            <label className="form-field">
              <span>{language === "pt" ? "Duração (horas)" : "Duration (hours)"}</span>
              <input
                type="number"
                value={courseFormData.durationHours || ""}
                onChange={(e) =>
                  setCourseFormData({
                    ...courseFormData,
                    durationHours: parseInt(e.target.value) || 0,
                  })
                }
                className="form-input"
              />
            </label>
          </div>

          <label className="form-field">
            <span>{language === "pt" ? "Descrição" : "Description"}</span>
            <textarea
              value={courseFormData.description}
              onChange={(e) =>
                setCourseFormData({ ...courseFormData, description: e.target.value })
              }
              className="form-textarea"
              rows={4}
            />
          </label>

          <div className="form-grid">
            <label className="form-field">
              <span>{language === "pt" ? "Público Alvo" : "Target Audience"}</span>
              <input
                type="text"
                value={courseFormData.targetAudience || ""}
                onChange={(e) =>
                  setCourseFormData({ ...courseFormData, targetAudience: e.target.value })
                }
                className="form-input"
                placeholder={language === "pt" ? "Ex: Iniciantes, Intermediários..." : "Ex: Beginners, Intermediate..."}
              />
            </label>
            <label className="form-field">
              <span>{language === "pt" ? "Preço (R$)" : "Price (R$)"}</span>
              <input
                type="number"
                step="0.01"
                value={courseFormData.price || ""}
                onChange={(e) =>
                  setCourseFormData({
                    ...courseFormData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className="form-input"
              />
            </label>
          </div>

          {/* Upload de Capa */}
          <label className="form-field">
            <span>{language === "pt" ? "Capa do Curso" : "Course Thumbnail"}</span>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <input
                type="file"
                accept="image/*"
                id="thumbnail-upload"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const url = await handleFileUpload(file, "thumbnail");
                      setCourseFormData({ ...courseFormData, thumbnailUrl: url });
                      alert(language === "pt" ? "Capa enviada com sucesso!" : "Thumbnail uploaded successfully!");
                    } catch (error) {
                      alert("Erro ao fazer upload: " + (error as Error).message);
                    }
                  }
                }}
                disabled={uploading === "thumbnail"}
              />
              <label htmlFor="thumbnail-upload" className="button" style={{ cursor: "pointer", margin: 0 }}>
                {uploading === "thumbnail"
                  ? language === "pt" ? "Enviando..." : "Uploading..."
                  : language === "pt" ? "📷 Enviar Capa" : "📷 Upload Thumbnail"}
              </label>
              {courseFormData.thumbnailUrl && (
                <img
                  src={courseFormData.thumbnailUrl}
                  alt="Thumbnail"
                  style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "6px" }}
                />
              )}
            </div>
          </label>

          <div className="form-grid">
            <label className="form-field">
              <span>{language === "pt" ? "Nível de Dificuldade" : "Difficulty Level"}</span>
              <select
                value={courseFormData.difficultyLevel}
                onChange={(e) =>
                  setCourseFormData({ ...courseFormData, difficultyLevel: e.target.value })
                }
                className="form-input"
              >
                <option value="BEGINNER">{language === "pt" ? "Iniciante" : "Beginner"}</option>
                <option value="INTERMEDIATE">{language === "pt" ? "Intermediário" : "Intermediate"}</option>
                <option value="ADVANCED">{language === "pt" ? "Avançado" : "Advanced"}</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={courseFormData.published}
                onChange={(e) =>
                  setCourseFormData({ ...courseFormData, published: e.target.checked })
                }
              />
              <span>{language === "pt" ? "Tornar curso disponível na seção Conteúdos" : "Make course available in Contents section"}</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={courseFormData.featured}
                onChange={(e) =>
                  setCourseFormData({ ...courseFormData, featured: e.target.checked })
                }
              />
              <span>{language === "pt" ? "Destaque" : "Featured"}</span>
            </label>
          </div>

          <button type="submit" className="button">
            {language === "pt" ? "Salvar Alterações" : "Save Changes"}
          </button>
        </form>
      )}

      {activeTab === "sections" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2>{language === "pt" ? "Aulas do Curso" : "Course Lessons"}</h2>
            <button
              className="button"
              onClick={() => {
                resetSectionForm();
                setShowSectionForm(!showSectionForm);
              }}
            >
              {showSectionForm
                ? language === "pt" ? "Cancelar" : "Cancel"
                : language === "pt" ? "+ Nova Aula" : "+ New Lesson"}
            </button>
          </div>

          {showSectionForm && (
            <form onSubmit={handleSectionSubmit} className="panel" style={{ marginBottom: "24px" }}>
              <h3>
                {editingSection
                  ? language === "pt" ? "Editar Aula" : "Edit Lesson"
                  : language === "pt" ? "Nova Aula" : "New Lesson"}
              </h3>
              
              <label className="form-field">
                <span>{language === "pt" ? "Título da Aula" : "Lesson Title"} *</span>
                <input
                  type="text"
                  value={sectionFormData.title}
                  onChange={(e) =>
                    setSectionFormData({ ...sectionFormData, title: e.target.value })
                  }
                  required
                  className="form-input"
                />
              </label>

              <label className="form-field">
                <span>{language === "pt" ? "Descrição" : "Description"}</span>
                <textarea
                  value={sectionFormData.description}
                  onChange={(e) =>
                    setSectionFormData({ ...sectionFormData, description: e.target.value })
                  }
                  className="form-textarea"
                  rows={4}
                  placeholder={language === "pt" ? "Descreva o conteúdo desta aula..." : "Describe the content of this lesson..."}
                />
              </label>

              {/* Upload de Vídeo */}
              <label className="form-field">
                <span>{language === "pt" ? "Vídeo da Aula" : "Lesson Video"}</span>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <input
                    type="file"
                    id="video-upload"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const url = await handleFileUpload(file, "video");
                          setSectionFormData({
                            ...sectionFormData,
                            videoLesson: {
                              title: file.name,
                              description: sectionFormData.videoLesson?.description || "",
                              videoUrl: url,
                              durationMinutes: sectionFormData.videoLesson?.durationMinutes || 0,
                              orderIndex: sectionFormData.videoLesson?.orderIndex || 0,
                            },
                          });
                          alert(language === "pt" ? "Vídeo enviado com sucesso!" : "Video uploaded successfully!");
                        } catch (error) {
                          alert("Erro ao fazer upload: " + (error as Error).message);
                        }
                      }
                    }}
                    disabled={uploading === "video"}
                  />
                  <label htmlFor="video-upload" className="button" style={{ cursor: "pointer", margin: 0 }}>
                    {uploading === "video"
                      ? language === "pt" ? "Enviando..." : "Uploading..."
                      : language === "pt" ? "🎥 Enviar Vídeo" : "🎥 Upload Video"}
                  </label>
                  {sectionFormData.videoLesson?.videoUrl && (
                    <span style={{ color: "var(--success)", fontSize: "14px" }}>
                      ✓ {sectionFormData.videoLesson.title}
                    </span>
                  )}
                </div>
              </label>

              {/* Upload de Materiais */}
              <label className="form-field">
                <span>{language === "pt" ? "Materiais de Apoio" : "Support Materials"}</span>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <input
                    type="file"
                    id="material-upload"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const type = file.type.startsWith("audio/") ? "audio" : 
                                     file.type.startsWith("image/") ? "image" : "document";
                          const url = await handleFileUpload(file, type);
                          const newMaterial = {
                            title: file.name,
                            fileUrl: url,
                            fileType: type.toUpperCase(),
                            fileSize: file.size,
                            orderIndex: sectionFormData.materials?.length || 0,
                          };
                          setSectionFormData({
                            ...sectionFormData,
                            materials: [...(sectionFormData.materials || []), newMaterial],
                          });
                          alert(language === "pt" ? "Material enviado com sucesso!" : "Material uploaded successfully!");
                        } catch (error) {
                          alert("Erro ao fazer upload: " + (error as Error).message);
                        }
                      }
                    }}
                    disabled={!!uploading}
                  />
                  <label htmlFor="material-upload" className="button" style={{ cursor: "pointer", margin: 0 }}>
                    {uploading
                      ? language === "pt" ? "Enviando..." : "Uploading..."
                      : language === "pt" ? "📎 Enviar Material" : "📎 Upload Material"}
                  </label>
                </div>
                {sectionFormData.materials && sectionFormData.materials.length > 0 && (
                  <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {sectionFormData.materials.map((material, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "8px 12px",
                          background: "var(--bg-tertiary)",
                          borderRadius: "6px",
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span>{material.title}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newMaterials = sectionFormData.materials?.filter((_, i) => i !== index) || [];
                            setSectionFormData({ ...sectionFormData, materials: newMaterials });
                          }}
                          style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer" }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </label>

              {/* Links Úteis */}
              <label className="form-field">
                <span>{language === "pt" ? "Links Úteis" : "Useful Links"}</span>
                <textarea
                  value={sectionFormData.usefulLinks || ""}
                  onChange={(e) =>
                    setSectionFormData({ ...sectionFormData, usefulLinks: e.target.value })
                  }
                  className="form-textarea"
                  rows={3}
                  placeholder={language === "pt" ? "Cole os links úteis aqui, um por linha ou separados por vírgula\nEx: https://example.com, https://another-link.com" : "Paste useful links here, one per line or separated by comma\nEx: https://example.com, https://another-link.com"}
                />
                <small style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px", display: "block" }}>
                  {language === "pt" ? "Um link por linha ou separados por vírgula" : "One link per line or separated by comma"}
                </small>
              </label>

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="submit" className="button">
                  {editingSection
                    ? language === "pt" ? "Atualizar Aula" : "Update Lesson"
                    : language === "pt" ? "Criar Aula" : "Create Lesson"}
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={resetSectionForm}
                >
                  {language === "pt" ? "Cancelar" : "Cancel"}
                </button>
              </div>
            </form>
          )}

          {/* Lista de Aulas */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {sections.length === 0 ? (
              <div className="panel" style={{ textAlign: "center", padding: "48px" }}>
                <p style={{ color: "var(--text-muted)" }}>
                  {language === "pt" ? "Nenhuma aula criada ainda. Clique em 'Nova Aula' para começar." : "No lessons created yet. Click 'New Lesson' to start."}
                </p>
              </div>
            ) : (
              sections.map((section, index) => (
                <div key={section.id} className="panel">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <span
                          style={{
                            background: "var(--primary)",
                            color: "white",
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "bold",
                          }}
                        >
                          {index + 1}
                        </span>
                        <h3 style={{ margin: 0 }}>{section.title}</h3>
                      </div>
                      {section.description && (
                        <p style={{ color: "var(--text-muted)", marginTop: "8px", marginBottom: "12px" }}>
                          {section.description}
                        </p>
                      )}
                      {section.videoLesson && (
                        <div style={{ marginTop: "8px", padding: "8px", background: "var(--bg-tertiary)", borderRadius: "6px" }}>
                          <strong>🎥 {language === "pt" ? "Vídeo:" : "Video:"}</strong> {section.videoLesson.title}
                        </div>
                      )}
                      {section.materials && section.materials.length > 0 && (
                        <div style={{ marginTop: "8px" }}>
                          <strong>{language === "pt" ? "Materiais:" : "Materials:"}</strong>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                            {section.materials.map((material: any, idx: number) => (
                              <span
                                key={idx}
                                style={{
                                  padding: "4px 8px",
                                  background: "var(--bg-secondary)",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                }}
                              >
                                {material.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {section.usefulLinks && (
                        <div style={{ marginTop: "8px" }}>
                          <strong>{language === "pt" ? "Links Úteis:" : "Useful Links:"}</strong>
                          <div style={{ marginTop: "4px" }}>
                            {section.usefulLinks.split(/[,\n]/).filter((link: string) => link.trim()).map((link: string, idx: number) => (
                              <a
                                key={idx}
                                href={link.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "block",
                                  color: "var(--primary)",
                                  textDecoration: "none",
                                  fontSize: "14px",
                                  marginTop: "4px",
                                }}
                              >
                                🔗 {link.trim()}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="button button-secondary"
                        onClick={() => openEditSection(section)}
                      >
                        {language === "pt" ? "Editar" : "Edit"}
                      </button>
                      <button
                        className="button button-secondary"
                        onClick={() => handleDeleteSection(section.id)}
                      >
                        {language === "pt" ? "Excluir" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

