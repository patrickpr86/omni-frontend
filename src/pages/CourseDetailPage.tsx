import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { BackButton } from "../components/BackButton";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  fetchCourseDetail,
  fetchCourseComments,
  createComment,
  deleteComment,
  enrollInCourse,
  type CourseDetail,
  type CourseComment,
  type CourseCommentRequest,
} from "../api/courses";

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { token, user } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [comments, setComments] = useState<CourseComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (courseId) {
      loadCourseData();
      loadComments();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const data = await fetchCourseDetail(token, parseInt(courseId || "0"));
      setCourse(data);
      if (data.sections.length > 0) {
        setSelectedSection(data.sections[0].id);
        if (data.sections[0].videoLesson) {
          setSelectedLesson(data.sections[0].videoLesson.id);
        }
      }
    } catch (error) {
      console.error("Error loading course:", error);
      alert(language === "pt" ? "Erro ao carregar curso" : "Error loading course");
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!courseId) return;
    try {
      const data = await fetchCourseComments(token, parseInt(courseId));
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleEnroll = async () => {
    if (!token || !courseId) {
      alert(language === "pt" ? "Você precisa estar logado" : "You need to be logged in");
      return;
    }
    try {
      await enrollInCourse(token, parseInt(courseId));
      alert(language === "pt" ? "Inscrição realizada com sucesso!" : "Enrollment successful!");
      await loadCourseData();
    } catch (error) {
      console.error("Error enrolling:", error);
      alert(language === "pt" ? "Erro ao se inscrever" : "Error enrolling");
    }
  };

  const handleSubmitComment = async () => {
    if (!token || !courseId || !commentText.trim()) return;
    try {
      const data: CourseCommentRequest = {
        content: commentText.trim(),
        sectionId: selectedSection || undefined,
      };
      await createComment(token, parseInt(courseId), data);
      setCommentText("");
      await loadComments();
    } catch (error) {
      console.error("Error creating comment:", error);
      alert(language === "pt" ? "Erro ao criar comentário" : "Error creating comment");
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!token || !courseId || !replyText[parentId]?.trim()) return;
    try {
      const data: CourseCommentRequest = {
        content: replyText[parentId].trim(),
        parentCommentId: parentId,
        sectionId: selectedSection || undefined,
      };
      await createComment(token, parseInt(courseId), data);
      setReplyText({ ...replyText, [parentId]: "" });
      setReplyingTo(null);
      await loadComments();
    } catch (error) {
      console.error("Error creating reply:", error);
      alert(language === "pt" ? "Erro ao responder" : "Error replying");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token || !courseId) return;
    if (!confirm(language === "pt" ? "Tem certeza que deseja excluir este comentário?" : "Are you sure you want to delete this comment?")) return;
    try {
      await deleteComment(token, parseInt(courseId), commentId);
      await loadComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert(language === "pt" ? "Erro ao excluir comentário" : "Error deleting comment");
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const getCurrentVideo = () => {
    if (!course || !selectedSection) return null;
    const section = course.sections.find((s) => s.id === selectedSection);
    return section?.videoLesson || null;
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

  const currentVideo = getCurrentVideo();

  return (
    <AppLayout>
      <BackButton to="/conteudos" />
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px", marginTop: "24px" }}>
        {/* Main Content */}
        <div>
          {/* Course Header */}
          <div className="panel" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "24px" }}>
              {course.thumbnailUrl && (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  style={{ width: "200px", height: "150px", objectFit: "cover", borderRadius: "8px" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h1 style={{ marginTop: 0 }}>{course.title}</h1>
                <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
                  {course.description}
                </p>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {course.instructor && (
                    <div>
                      <strong>{language === "pt" ? "Instrutor:" : "Instructor:"}</strong> {course.instructor.name}
                    </div>
                  )}
                  {course.durationHours && (
                    <div>
                      <strong>{language === "pt" ? "Duração:" : "Duration:"}</strong> {course.durationHours}h
                    </div>
                  )}
                  {course.difficultyLevel && (
                    <div>
                      <strong>{language === "pt" ? "Nível:" : "Level:"}</strong> {course.difficultyLevel}
                    </div>
                  )}
                </div>
                {!course.isEnrolled ? (
                  <button
                    className="button"
                    onClick={handleEnroll}
                    style={{ marginTop: "16px", width: "100%" }}
                  >
                    {language === "pt" ? "Inscrever-se no Curso" : "Enroll in Course"}
                  </button>
                ) : (
                  <div style={{ 
                    marginTop: "16px", 
                    padding: "12px", 
                    backgroundColor: "var(--success)20", 
                    borderRadius: "8px",
                    textAlign: "center",
                    color: "var(--success)",
                    fontWeight: "bold"
                  }}>
                    ✓ {language === "pt" ? "Você está inscrito neste curso" : "You are enrolled in this course"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Player */}
          {currentVideo ? (
            <div className="panel" style={{ marginBottom: "24px" }}>
              <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", backgroundColor: "#000", borderRadius: "8px", overflow: "hidden" }}>
                {(() => {
                  // Converter URL para usar endpoint de streaming se necessário
                  const videoUrl = currentVideo.videoUrl;
                  console.log("Original video URL from backend:", videoUrl);
                  
                  // Verificar se é um arquivo local (uploads ou localhost)
                  const isLocalUpload = videoUrl && (
                    videoUrl.includes("/uploads/") || 
                    videoUrl.includes("localhost") ||
                    videoUrl.startsWith("http://localhost") ||
                    videoUrl.startsWith("/uploads/")
                  );
                  
                  console.log("Is local upload?", isLocalUpload);
                  
                  let finalVideoUrl = videoUrl;
                  
                  if (isLocalUpload) {
                    // Extrair o path relativo (ex: videos/filename.mp4 ou videos/filename.mkv)
                    let relativePath = "";
                    
                    // Tentar diferentes padrões de URL
                    const patterns = [
                      /\/uploads\/(.+)$/,  // http://localhost:8080/uploads/videos/file.mp4
                      /uploads\/(.+)$/,    // /uploads/videos/file.mp4
                      /localhost:8080\/uploads\/(.+)$/,  // http://localhost:8080/uploads/videos/file.mp4
                      /http:\/\/localhost:8080\/uploads\/(.+)$/,  // http://localhost:8080/uploads/videos/file.mp4 (completo)
                    ];
                    
                    for (const pattern of patterns) {
                      const match = videoUrl.match(pattern);
                      if (match && match[1]) {
                        relativePath = match[1];
                        console.log("Pattern matched:", pattern, "Relative path:", relativePath);
                        break;
                      }
                    }
                    
                    if (relativePath) {
                      finalVideoUrl = `/api/videos/stream?path=${encodeURIComponent(relativePath)}`;
                      console.log("Video URL converted for streaming:", { 
                        original: videoUrl, 
                        relativePath: relativePath,
                        converted: finalVideoUrl 
                      });
                    } else {
                      console.error("Could not extract relative path from video URL:", videoUrl);
                      console.error("Tried patterns:", patterns);
                    }
                  } else {
                    console.log("Not a local upload, using original URL:", videoUrl);
                  }
                  
                  // Verificar se é formato não suportado (apenas para aviso, pois já foi convertido)
                  const unsupportedFormats = ['.mkv', '.avi', '.wmv', '.flv'];
                  const isUnsupported = unsupportedFormats.some(format => 
                    videoUrl?.toLowerCase().endsWith(format)
                  );
                  
                  return (
                    <>
                      <video
                        key={finalVideoUrl} // Force re-render when URL changes
                        controls
                        style={{ 
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                        }}
                        src={finalVideoUrl}
                        poster={currentVideo.thumbnailUrl}
                        preload="metadata"
                        onLoadStart={() => {
                          console.log("Video loading started:", finalVideoUrl);
                        }}
                        onLoadedMetadata={() => {
                          console.log("Video metadata loaded:", finalVideoUrl);
                        }}
                        onCanPlay={() => {
                          console.log("Video can play:", finalVideoUrl);
                        }}
                        onError={(e) => {
                          console.error("Video playback error:", e);
                          const target = e.target as HTMLVideoElement;
                          if (target.error) {
                            console.error("Video error code:", target.error.code);
                            console.error("Video error message:", target.error.message);
                            console.error("Video src:", finalVideoUrl);
                            console.error("Original video URL:", videoUrl);
                            
                            // Se o streaming falhar, tentar usar a URL original
                            if (finalVideoUrl !== videoUrl && videoUrl) {
                              console.warn("Streaming failed, trying original URL:", videoUrl);
                              target.src = videoUrl;
                            }
                          }
                        }}
                      />
                      {isUnsupported && (
                        <div style={{
                          position: "absolute",
                          bottom: "20px",
                          left: "20px",
                          right: "20px",
                          padding: "12px",
                          backgroundColor: "rgba(255, 193, 7, 0.9)",
                          color: "#000",
                          borderRadius: "8px",
                          fontSize: "14px",
                          zIndex: 10,
                        }}>
                          ⚠️ {language === "pt" 
                            ? "Formato de vídeo pode não ser suportado pelo navegador. Recomendamos MP4 ou WebM para melhor compatibilidade." 
                            : "Video format may not be supported by browser. We recommend MP4 or WebM for better compatibility."}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              <h3 style={{ marginTop: "16px" }}>{currentVideo.title}</h3>
              {currentVideo.description && (
                <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>{currentVideo.description}</p>
              )}
              <div style={{ display: "flex", gap: "16px", marginTop: "12px", flexWrap: "wrap" }}>
                {currentVideo.durationMinutes && (
                  <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                    ⏱️ {formatDuration(currentVideo.durationMinutes)}
                  </span>
                )}
                {currentVideo.isPreview && (
                  <span style={{ 
                    padding: "4px 8px", 
                    borderRadius: "4px", 
                    fontSize: "12px",
                    backgroundColor: "var(--primary)20",
                    color: "var(--primary)"
                  }}>
                    {language === "pt" ? "Prévia" : "Preview"}
                  </span>
                )}
              </div>
              
              {/* Materials Section */}
              {course.sections.find(s => s.id === selectedSection)?.materials && 
               course.sections.find(s => s.id === selectedSection)!.materials!.length > 0 && (
                <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border-color)" }}>
                  <h4 style={{ marginBottom: "12px" }}>{language === "pt" ? "Materiais de Apoio" : "Support Materials"}</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {course.sections.find(s => s.id === selectedSection)!.materials!.map((material) => (
                      <a
                        key={material.id}
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px",
                          border: "1px solid var(--border-color)",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: "inherit",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--border-color)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <span style={{ fontSize: "24px" }}>
                          {material.fileType?.startsWith("image") ? "🖼️" :
                           material.fileType?.startsWith("video") ? "🎥" :
                           material.fileType?.startsWith("audio") ? "🎵" :
                           material.fileType?.includes("pdf") ? "📄" :
                           "📎"}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "bold" }}>{material.title}</div>
                          {material.description && (
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                              {material.description}
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: "20px" }}>⬇️</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="panel" style={{ marginBottom: "24px", textAlign: "center", padding: "48px" }}>
              <p style={{ color: "var(--text-muted)" }}>
                {language === "pt" ? "Selecione uma aula para assistir" : "Select a lesson to watch"}
              </p>
            </div>
          )}

          {/* Comments Section */}
          <div className="panel">
            <h2>{language === "pt" ? "Comentários" : "Comments"}</h2>
            
            {/* Comment Form */}
            {token && (
              <div style={{ marginBottom: "24px" }}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={language === "pt" ? "Adicione um comentário..." : "Add a comment..."}
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    marginBottom: "8px",
                    fontFamily: "inherit",
                  }}
                />
                <button className="button" onClick={handleSubmitComment}>
                  {language === "pt" ? "Comentar" : "Comment"}
                </button>
              </div>
            )}

            {/* Comments List */}
            <div>
              {comments.length === 0 ? (
                <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px" }}>
                  {language === "pt" ? "Nenhum comentário ainda. Seja o primeiro!" : "No comments yet. Be the first!"}
                </p>
              ) : (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    token={token}
                    userId={user?.id}
                    courseId={parseInt(courseId || "0")}
                    onDelete={handleDeleteComment}
                    onReply={(parentId) => setReplyingTo(parentId)}
                    replyingTo={replyingTo}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    onSubmitReply={handleSubmitReply}
                    language={language}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Sections */}
        <div>
          <div className="panel" style={{ position: "sticky", top: "20px" }}>
            <h2 style={{ marginTop: 0 }}>{language === "pt" ? "Conteúdo do Curso" : "Course Content"}</h2>
            <div style={{ marginBottom: "20px", fontSize: "14px", color: "var(--text-muted)" }}>
              {course.sections.length} {language === "pt" ? "módulos" : "modules"} • {" "}
              {course.sections.reduce((acc, s) => acc + (s.videoLesson ? 1 : 0), 0)} {language === "pt" ? "aulas" : "lessons"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "600px", overflowY: "auto", paddingRight: "4px" }}>
              {course.sections.map((section, index) => {
                const isSelected = selectedSection === section.id;
                const hasVideo = !!section.videoLesson;
                
                return (
                  <div
                    key={section.id}
                    className="course-section-card"
                    style={{
                      padding: "16px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      cursor: "pointer",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      transition: "all 0.2s ease",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                      minHeight: "120px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    data-selected={isSelected}
                    onClick={() => {
                      setSelectedSection(section.id);
                      if (section.videoLesson) {
                        setSelectedLesson(section.videoLesson.id);
                      }
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                      {/* Header com número do módulo e badge de vídeo */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "32px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "var(--border-color)",
                            color: "var(--text)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: "600",
                            flexShrink: 0,
                            transition: "all 0.2s ease",
                          }}>
                            {index + 1}
                          </div>
                          {hasVideo && (
                            <span style={{
                              fontSize: "11px",
                              padding: "5px 10px",
                              borderRadius: "12px",
                              backgroundColor: "rgba(34, 197, 94, 0.15)",
                              color: "#22c55e",
                              fontWeight: "600",
                              lineHeight: "1",
                            }}>
                              {language === "pt" ? "Vídeo" : "Video"}
                            </span>
                          )}
                        </div>
                        {hasVideo && (
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            backgroundColor: "var(--border-color)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 0.2s ease",
                          }}>
                            <span style={{ fontSize: "14px", color: "var(--primary)" }}>▶</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Título da seção */}
                      <h4 style={{ 
                        margin: 0, 
                        fontSize: "15px", 
                        fontWeight: "600",
                        color: "var(--text)",
                        lineHeight: "1.4",
                        minHeight: "21px",
                      }}>
                        {section.title}
                      </h4>
                      
                      {/* Descrição */}
                      {section.description ? (
                        <p style={{ 
                          fontSize: "13px", 
                          color: "var(--text-muted)", 
                          margin: 0,
                          lineHeight: "1.5",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: "39px",
                        }}>
                          {section.description}
                        </p>
                      ) : (
                        <div style={{ minHeight: "39px" }}></div>
                      )}
                      
                      {/* Footer com informações */}
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center",
                        gap: "16px", 
                        fontSize: "12px", 
                        color: "var(--text-muted)",
                        paddingTop: "10px",
                        borderTop: "1px solid var(--border-color)",
                        marginTop: "auto",
                        minHeight: "28px",
                      }}>
                        {section.videoLesson && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "14px" }}>⏱️</span>
                            <span>{formatDuration(section.videoLesson.durationMinutes)}</span>
                          </div>
                        )}
                        {section.materials && section.materials.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "14px" }}>📎</span>
                            <span>{section.materials.length} {language === "pt" ? "arquivos" : "files"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <style>{`
              .course-section-card {
                position: relative;
              }
              
              .course-section-card[data-selected="true"] {
                border: 2px solid var(--primary) !important;
                backgroundColor: rgba(59, 130, 246, 0.1) !important;
                boxShadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
              }
              
              .course-section-card[data-selected="true"] > div > div:first-child > div:first-child > div:first-child {
                backgroundColor: var(--primary) !important;
                color: white !important;
              }
              
              .course-section-card[data-selected="true"] > div > div:first-child > div:last-child {
                backgroundColor: rgba(59, 130, 246, 0.2) !important;
              }
              
              .course-section-card:hover {
                backgroundColor: rgba(59, 130, 246, 0.15) !important;
                boxShadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                transform: translateY(-2px);
                borderColor: var(--primary) !important;
              }
              
              .course-section-card:hover > div > div:first-child > div:first-child > div:first-child {
                backgroundColor: var(--primary) !important;
                color: white !important;
              }
              
              .course-section-card:hover > div > div:first-child > div:last-child {
                backgroundColor: rgba(59, 130, 246, 0.3) !important;
              }
            `}</style>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function CommentItem({
  comment,
  token,
  userId,
  courseId,
  onDelete,
  onReply,
  replyingTo,
  replyText,
  setReplyText,
  onSubmitReply,
  language,
}: {
  comment: CourseComment;
  token: string | null;
  userId?: number;
  courseId: number;
  onDelete: (id: number) => void;
  onReply: (id: number) => void;
  replyingTo: number | null;
  replyText: { [key: number]: string };
  setReplyText: (text: { [key: number]: string }) => void;
  onSubmitReply: (parentId: number) => void;
  language: string;
}) {
  const isOwner = userId === comment.user.id;

  return (
    <div style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--border-color)" }}>
      <div style={{ display: "flex", gap: "12px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            flexShrink: 0,
          }}
        >
          {comment.user.fullName?.[0] || comment.user.username[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
            <div>
              <strong>{comment.user.fullName || comment.user.username}</strong>
              <span style={{ color: "var(--text-muted)", fontSize: "12px", marginLeft: "8px" }}>
                {new Date(comment.createdAt).toLocaleDateString()}
                {comment.isEdited && ` (${language === "pt" ? "editado" : "edited"})`}
              </span>
            </div>
            {isOwner && token && (
              <button
                className="button button-secondary"
                style={{ padding: "4px 8px", fontSize: "12px" }}
                onClick={() => onDelete(comment.id)}
              >
                {language === "pt" ? "Excluir" : "Delete"}
              </button>
            )}
          </div>
          <p style={{ margin: "8px 0", whiteSpace: "pre-wrap" }}>{comment.content}</p>
          
          {token && (
            <button
              className="button button-secondary"
              style={{ padding: "4px 8px", fontSize: "12px", marginTop: "8px" }}
              onClick={() => onReply(comment.id)}
            >
              {language === "pt" ? "Responder" : "Reply"}
            </button>
          )}

          {replyingTo === comment.id && token && (
            <div style={{ marginTop: "12px" }}>
              <textarea
                value={replyText[comment.id] || ""}
                onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                placeholder={language === "pt" ? "Escreva uma resposta..." : "Write a reply..."}
                style={{
                  width: "100%",
                  minHeight: "80px",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid var(--border-color)",
                  marginBottom: "8px",
                  fontFamily: "inherit",
                }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="button"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                  onClick={() => onSubmitReply(comment.id)}
                >
                  {language === "pt" ? "Enviar" : "Send"}
                </button>
                <button
                  className="button button-secondary"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                  onClick={() => {
                    setReplyText({ ...replyText, [comment.id]: "" });
                    onReply(0);
                  }}
                >
                  {language === "pt" ? "Cancelar" : "Cancel"}
                </button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div style={{ marginTop: "16px", paddingLeft: "24px", borderLeft: "2px solid var(--border-color)" }}>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  token={token}
                  userId={userId}
                  courseId={courseId}
                  onDelete={onDelete}
                  onReply={onReply}
                  replyingTo={replyingTo}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onSubmitReply={onSubmitReply}
                  language={language}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

