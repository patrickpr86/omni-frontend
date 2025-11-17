import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/shared/components/AppLayout";
import { useAuth } from "@/core/context/AuthContext.tsx";
import { useLanguage } from "@/core/context/LanguageContext.tsx";
import { BackButton } from "@/shared/components/BackButton";
import {
  getAllCoursesAdmin,
  createCourseAdmin,
  updateCourseAdmin,
  deleteCourseAdmin,
  getAllUsers,
  uploadCourseThumbnail,
  uploadVideo,
  uploadAudio,
  uploadImage,
  uploadDocument,
  createCourseSection,
  deleteCourseSection,
  getCourseSections,
  createCourseQuiz,
  deleteCourseQuiz,
  getCourseQuizzes,
  type CourseResponse,
  type UpdateCourseRequest,
  type CourseSectionRequest,
  type CourseQuizRequest,
  type UserResponse,
} from "@/modules/admin/api/admin.ts";

export function CourseManagementPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { language } = useLanguage();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseResponse | null>(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

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

  const [quizFormData, setQuizFormData] = useState<CourseQuizRequest>({
    title: "",
    description: "",
    passingScore: 70,
    timeLimitMinutes: 0,
    maxAttempts: 3,
    published: false,
    questions: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadCourseDetails(selectedCourse.id);
    }
  }, [selectedCourse]);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [coursesData, usersData] = await Promise.all([
        getAllCoursesAdmin(token),
        getAllUsers(token),
      ]);
      setCourses(coursesData);
      setUsers(usersData.filter((u) => u.roles.includes("INSTRUCTOR") || u.roles.includes("ADMIN")));
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Erro ao carregar dados: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseDetails = async (courseId: number) => {
    if (!token) return;
    try {
      const [sectionsData, quizzesData] = await Promise.all([
        getCourseSections(token, courseId),
        getCourseQuizzes(token, courseId),
      ]);
      setSections(sectionsData);
      setQuizzes(quizzesData);
    } catch (error) {
      console.error("Error loading course details:", error);
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
          // Validar formato e informar sobre padronização
          const videoExt = file.name.toLowerCase();
          const acceptedFormats = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
          const isValidFormat = acceptedFormats.some(ext => videoExt.endsWith(ext));
          
          if (!isValidFormat) {
            setUploading(null);
            throw new Error(
              language === "pt"
                ? "Formato de vídeo não suportado. Formatos aceitos: MP4, MOV, AVI, MKV, WebM, M4V"
                : "Video format not supported. Accepted formats: MP4, MOV, AVI, MKV, WebM, M4V"
            );
          }

          // Informar sobre padronização automática
          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
          const proceed = confirm(
            language === "pt"
              ? `O vídeo será padronizado automaticamente para alta qualidade (1080p, H.264, MP4).\n\n` +
                `Tamanho do arquivo: ${fileSizeMB} MB\n` +
                `Isso pode levar alguns minutos dependendo do tamanho. Deseja continuar?`
              : `The video will be automatically standardized to high quality (1080p, H.264, MP4).\n\n` +
                `File size: ${fileSizeMB} MB\n` +
                `This may take a few minutes depending on size. Continue?`
          );
          
          if (!proceed) {
            setUploading(null);
            throw new Error("Upload cancelado");
          }
          
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
        default:
          throw new Error("Tipo de arquivo não suportado");
      }
      
      if (response.success && response.url) {
        return response.url;
      } else {
        throw new Error(response.error || "Erro ao fazer upload");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = (error as Error).message;
      
      // Mensagens de erro mais amigáveis
      if (errorMessage.includes("FFmpeg") || errorMessage.includes("não suportado") || errorMessage.includes("Formato")) {
        throw new Error(
          language === "pt"
            ? "Formato de vídeo não suportado. Por favor, converta para MP4 antes do upload ou instale FFmpeg no servidor."
            : "Video format not supported. Please convert to MP4 before upload or install FFmpeg on the server."
        );
      }
      
      throw error;
    } finally {
      setUploading(null);
    }
  };

  const handleCourseSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingCourse) {
        await updateCourseAdmin(token, editingCourse.id, courseFormData);
        alert(language === "pt" ? "Curso atualizado com sucesso!" : "Course updated successfully!");
      } else {
        await createCourseAdmin(token, courseFormData);
        alert(language === "pt" ? "Curso criado com sucesso!" : "Course created successfully!");
      }
      await loadData();
      resetCourseForm();
    } catch (error) {
      console.error("Error saving course:", error);
      alert(`Erro ao ${editingCourse ? "atualizar" : "criar"} curso: ` + (error as Error).message);
    }
  };

  const handleSectionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !selectedCourse) return;

    try {
      await createCourseSection(token, selectedCourse.id, sectionFormData);
      alert(language === "pt" ? "Seção criada com sucesso!" : "Section created successfully!");
      await loadCourseDetails(selectedCourse.id);
      resetSectionForm();
    } catch (error) {
      console.error("Error saving section:", error);
      alert("Erro ao criar seção: " + (error as Error).message);
    }
  };

  const handleQuizSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !selectedCourse) return;

    try {
      await createCourseQuiz(token, selectedCourse.id, quizFormData);
      alert(language === "pt" ? "Questionário criado com sucesso!" : "Quiz created successfully!");
      await loadCourseDetails(selectedCourse.id);
      resetQuizForm();
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Erro ao criar questionário: " + (error as Error).message);
    }
  };

  const handleDeleteCourse = async (id: number, title: string) => {
    if (!token) return;
    if (!confirm(`Tem certeza que deseja excluir o curso "${title}"?`)) return;

    try {
      await deleteCourseAdmin(token, id);
      await loadData();
      if (selectedCourse?.id === id) {
        setSelectedCourse(null);
      }
      alert(language === "pt" ? "Curso excluído com sucesso!" : "Course deleted successfully!");
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Erro ao excluir curso: " + (error as Error).message);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!token || !selectedCourse) return;
    if (!confirm(language === "pt" ? "Tem certeza que deseja excluir esta seção?" : "Are you sure you want to delete this section?")) return;

    try {
      await deleteCourseSection(token, selectedCourse.id, sectionId);
      await loadCourseDetails(selectedCourse.id);
      alert(language === "pt" ? "Seção excluída com sucesso!" : "Section deleted successfully!");
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("Erro ao excluir seção: " + (error as Error).message);
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!token || !selectedCourse) return;
    if (!confirm(language === "pt" ? "Tem certeza que deseja excluir este questionário?" : "Are you sure you want to delete this quiz?")) return;

    try {
      await deleteCourseQuiz(token, selectedCourse.id, quizId);
      await loadCourseDetails(selectedCourse.id);
      alert(language === "pt" ? "Questionário excluído com sucesso!" : "Quiz deleted successfully!");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("Erro ao excluir questionário: " + (error as Error).message);
    }
  };

  const resetCourseForm = () => {
    setShowCourseForm(false);
    setEditingCourse(null);
    setCourseFormData({
      title: "",
      description: "",
      price: 0,
      published: false,
      featured: false,
      durationHours: 0,
      difficultyLevel: "BEGINNER",
      targetAudience: "",
    });
  };

  const resetSectionForm = () => {
    setShowSectionForm(false);
    setSectionFormData({
      title: "",
      description: "",
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

  const resetQuizForm = () => {
    setShowQuizForm(false);
    setQuizFormData({
      title: "",
      description: "",
      passingScore: 70,
      timeLimitMinutes: 0,
      maxAttempts: 3,
      published: false,
      questions: [],
    });
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
              ? "Crie e gerencie cursos completos com seções, vídeos, materiais e questionários"
              : "Create and manage complete courses with sections, videos, materials and quizzes"}
          </p>
        </div>
        <button
          className="button"
          onClick={() => {
            if (showCourseForm) {
              resetCourseForm();
            } else {
              setShowCourseForm(true);
              setEditingCourse(null);
            }
          }}
        >
          {showCourseForm
            ? language === "pt" ? "Cancelar" : "Cancel"
            : language === "pt" ? "Novo Curso" : "New Course"}
        </button>
      </div>

      {showCourseForm && (
        <form onSubmit={handleCourseSubmit} className="panel" style={{ marginBottom: "24px" }}>
          <h2>
            {editingCourse
              ? language === "pt" ? "Editar Curso" : "Edit Course"
              : language === "pt" ? "Novo Curso" : "New Course"}
          </h2>
          
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
              <span>{language === "pt" ? "Professor" : "Instructor"}</span>
              <select
                value={courseFormData.instructorId || ""}
                onChange={(e) =>
                  setCourseFormData({
                    ...courseFormData,
                    instructorId: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="form-input"
              >
                <option value="">{language === "pt" ? "Selecione..." : "Select..."}</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.username}
                  </option>
                ))}
              </select>
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
          </div>

          <label className="form-field">
            <span>{language === "pt" ? "Capa do Curso" : "Course Thumbnail"}</span>
            <input
              type="file"
              accept="image/*"
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
            {uploading === "thumbnail" && (
              <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                {language === "pt" ? "Enviando..." : "Uploading..."}
              </span>
            )}
            {courseFormData.thumbnailUrl && (
              <img
                src={courseFormData.thumbnailUrl}
                alt="Thumbnail"
                style={{ width: "200px", height: "120px", objectFit: "cover", marginTop: "8px", borderRadius: "6px" }}
              />
            )}
          </label>

          <div className="form-grid">
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
            {editingCourse
              ? language === "pt" ? "Atualizar Curso" : "Update Course"
              : language === "pt" ? "Criar Curso" : "Create Course"}
          </button>
        </form>
      )}

      {loading ? (
        <p>{language === "pt" ? "Carregando..." : "Loading..."}</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: selectedCourse ? "1fr 2fr" : "1fr", gap: "24px" }}>
          <div>
            <h2 style={{ marginBottom: "16px" }}>
              {language === "pt" ? "Cursos" : "Courses"} ({courses.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="panel"
                  style={{
                    cursor: "pointer",
                    border: selectedCourse?.id === course.id ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                  }}
                  onClick={() => setSelectedCourse(course)}
                >
                  <h3>{course.title}</h3>
                  <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                    {course.description?.substring(0, 100)}...
                  </p>
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button
                      className="button button-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/cursos/${course.id}/editar`);
                      }}
                    >
                      {language === "pt" ? "Gerenciar" : "Manage"}
                    </button>
                    <button
                      className="button button-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCourse(course.id, course.title);
                      }}
                    >
                      {language === "pt" ? "Excluir" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedCourse && (
            <div>
              <div className="panel" style={{ marginBottom: "24px" }}>
                <h2>{selectedCourse.title}</h2>
                <p>{selectedCourse.description}</p>
                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  <button
                    className="button"
                    onClick={() => setShowSectionForm(!showSectionForm)}
                  >
                    {language === "pt" ? "Adicionar Seção" : "Add Section"}
                  </button>
                  <button
                    className="button"
                    onClick={() => setShowQuizForm(!showQuizForm)}
                  >
                    {language === "pt" ? "Adicionar Questionário" : "Add Quiz"}
                  </button>
                </div>
              </div>

              {showSectionForm && (
                <form onSubmit={handleSectionSubmit} className="panel" style={{ marginBottom: "24px" }}>
                  <h3>{language === "pt" ? "Nova Seção" : "New Section"}</h3>
                  <label className="form-field">
                    <span>{language === "pt" ? "Título da Seção" : "Section Title"} *</span>
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
                      rows={3}
                    />
                  </label>
                  <div className="form-grid">
                    <label className="form-field">
                      <span>{language === "pt" ? "Vídeo (qualquer formato)" : "Video (any format)"}</span>
                      <input
                        type="file"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const url = await handleFileUpload(file, "video");
                              setSectionFormData({
                                ...sectionFormData,
                                videoLesson: {
                                  ...sectionFormData.videoLesson!,
                                  videoUrl: url,
                                  title: file.name,
                                },
                              });
                              alert(language === "pt" ? "Vídeo enviado com sucesso!" : "Video uploaded successfully!");
                            } catch (error) {
                              const errorMsg = (error as Error).message;
                              alert(
                                language === "pt" 
                                  ? `Erro ao fazer upload do vídeo: ${errorMsg}\n\nDica: Use formatos MP4 ou WebM para melhor compatibilidade.`
                                  : `Error uploading video: ${errorMsg}\n\nTip: Use MP4 or WebM formats for better compatibility.`
                              );
                            }
                          }
                        }}
                        disabled={uploading === "video"}
                      />
                    </label>
                    <label className="form-field">
                      <span>{language === "pt" ? "Material de Apoio" : "Support Material"}</span>
                      <input
                        type="file"
                        accept="*/*"
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
                    </label>
                  </div>
                  <button type="submit" className="button">
                    {language === "pt" ? "Criar Seção" : "Create Section"}
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={resetSectionForm}
                  >
                    {language === "pt" ? "Cancelar" : "Cancel"}
                  </button>
                </form>
              )}

              {showQuizForm && (
                <form onSubmit={handleQuizSubmit} className="panel" style={{ marginBottom: "24px" }}>
                  <h3>{language === "pt" ? "Novo Questionário" : "New Quiz"}</h3>
                  <label className="form-field">
                    <span>{language === "pt" ? "Título" : "Title"} *</span>
                    <input
                      type="text"
                      value={quizFormData.title}
                      onChange={(e) =>
                        setQuizFormData({ ...quizFormData, title: e.target.value })
                      }
                      required
                      className="form-input"
                    />
                  </label>
                  <label className="form-field">
                    <span>{language === "pt" ? "Descrição" : "Description"}</span>
                    <textarea
                      value={quizFormData.description}
                      onChange={(e) =>
                        setQuizFormData({ ...quizFormData, description: e.target.value })
                      }
                      className="form-textarea"
                      rows={3}
                    />
                  </label>
                  <div className="form-grid">
                    <label className="form-field">
                      <span>{language === "pt" ? "Nota Mínima (%)" : "Passing Score (%)"}</span>
                      <input
                        type="number"
                        value={quizFormData.passingScore}
                        onChange={(e) =>
                          setQuizFormData({
                            ...quizFormData,
                            passingScore: parseInt(e.target.value) || 70,
                          })
                        }
                        className="form-input"
                      />
                    </label>
                    <label className="form-field">
                      <span>{language === "pt" ? "Tempo Limite (min)" : "Time Limit (min)"}</span>
                      <input
                        type="number"
                        value={quizFormData.timeLimitMinutes || ""}
                        onChange={(e) =>
                          setQuizFormData({
                            ...quizFormData,
                            timeLimitMinutes: parseInt(e.target.value) || undefined,
                          })
                        }
                        className="form-input"
                      />
                    </label>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      checked={quizFormData.published}
                      onChange={(e) =>
                        setQuizFormData({ ...quizFormData, published: e.target.checked })
                      }
                    />
                    <span>{language === "pt" ? "Publicado" : "Published"}</span>
                  </label>
                  <button type="submit" className="button">
                    {language === "pt" ? "Criar Questionário" : "Create Quiz"}
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={resetQuizForm}
                  >
                    {language === "pt" ? "Cancelar" : "Cancel"}
                  </button>
                </form>
              )}

              <div className="panel">
                <h3>{language === "pt" ? "Seções" : "Sections"} ({sections.length})</h3>
                {sections.map((section) => (
                  <div key={section.id} style={{ marginBottom: "16px", padding: "12px", background: "var(--bg-tertiary)", borderRadius: "6px" }}>
                    <h4>{section.title}</h4>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                      {section.description}
                    </p>
                    {section.videoLesson && (
                      <div style={{ marginTop: "8px" }}>
                        <strong>{language === "pt" ? "Vídeo:" : "Video:"}</strong> {section.videoLesson.title}
                      </div>
                    )}
                    <button
                      className="button button-secondary"
                      onClick={() => handleDeleteSection(section.id)}
                      style={{ marginTop: "8px" }}
                    >
                      {language === "pt" ? "Excluir" : "Delete"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="panel" style={{ marginTop: "24px" }}>
                <h3>{language === "pt" ? "Questionários" : "Quizzes"} ({quizzes.length})</h3>
                {quizzes.map((quiz) => (
                  <div key={quiz.id} style={{ marginBottom: "16px", padding: "12px", background: "var(--bg-tertiary)", borderRadius: "6px" }}>
                    <h4>{quiz.title}</h4>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                      {quiz.description}
                    </p>
                    <div style={{ marginTop: "8px", fontSize: "14px" }}>
                      <strong>{language === "pt" ? "Nota Mínima:" : "Passing Score:"}</strong> {quiz.passingScore}%
                    </div>
                    <button
                      className="button button-secondary"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      style={{ marginTop: "8px" }}
                    >
                      {language === "pt" ? "Excluir" : "Delete"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
