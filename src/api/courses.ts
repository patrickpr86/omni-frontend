import { apiFetch } from "./client";

export interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  durationHours?: number;
  difficultyLevel?: string;
  published: boolean;
  featured: boolean;
  enrollmentCount: number;
  completionRate: number;
  price: number;
  discountPrice?: number;
  instructor?: {
    id: number;
    name: string;
    profilePhoto?: string;
  };
  totalLessons: number;
  totalMaterials: number;
  isEnrolled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseMetrics {
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  averageCompletionRate: number;
  totalRevenue: number;
  averageCourseRating: number;
  activeStudents: number;
  coursesCompletedThisMonth: number;
}

export interface CourseRequest {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  durationHours?: number;
  difficultyLevel?: string;
  published?: boolean;
  featured?: boolean;
  price?: number;
  discountPrice?: number;
}

export async function fetchCourses(token: string): Promise<Course[]> {
  return apiFetch<Course[]>("/api/courses", { token });
}

export async function fetchAllCoursesAdmin(token: string): Promise<Course[]> {
  return apiFetch<Course[]>("/api/courses/all", { token });
}

export async function fetchCourseById(token: string, id: number): Promise<Course> {
  return apiFetch<Course>(`/api/courses/${id}`, { token });
}

export async function createCourse(token: string, data: CourseRequest): Promise<Course> {
  return apiFetch<Course>("/api/courses", { 
    method: "POST",
    token, 
    json: data 
  });
}

export async function updateCourse(token: string, id: number, data: CourseRequest): Promise<Course> {
  return apiFetch<Course>(`/api/courses/${id}`, { 
    method: "PUT",
    token, 
    json: data 
  });
}

export async function deleteCourse(token: string, id: number): Promise<void> {
  return apiFetch<void>(`/api/courses/${id}`, { 
    method: "DELETE",
    token 
  });
}

export async function enrollInCourse(token: string, courseId: number): Promise<void> {
  return apiFetch<void>(`/api/courses/${courseId}/enroll`, { 
    method: "POST",
    token,
    json: {}
  });
}

export async function fetchCourseMetrics(token: string): Promise<CourseMetrics> {
  return apiFetch<CourseMetrics>("/api/courses/metrics", { token });
}

// ==================== COURSE DETAIL ====================

export interface CourseDetail {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  durationHours?: number;
  difficultyLevel?: string;
  targetAudience?: string;
  published: boolean;
  featured: boolean;
  enrollmentCount: number;
  completionRate: number;
  price: number;
  discountPrice?: number;
  instructor?: {
    id: number;
    name: string;
    profilePhoto?: string;
  };
  categories?: Array<{
    id: number;
    name: string;
  }>;
  sections: SectionDetail[];
  isEnrolled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SectionDetail {
  id: number;
  title: string;
  description?: string;
  usefulLinks?: string;
  orderIndex: number;
  videoLesson?: VideoLessonDetail;
  materials?: MaterialDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoLessonDetail {
  id: number;
  title: string;
  description?: string;
  videoUrl: string;
  durationMinutes?: number;
  thumbnailUrl?: string;
  isPreview?: boolean;
}

export interface MaterialDetail {
  id: number;
  title: string;
  description?: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
}

export async function fetchCourseDetail(token: string | null, courseId: number): Promise<CourseDetail> {
  return apiFetch<CourseDetail>(`/api/courses/${courseId}/detail`, { token });
}

// ==================== COMMENTS ====================

export interface CourseComment {
  id: number;
  content: string;
  sectionId?: number;
  user: {
    id: number;
    username: string;
    fullName?: string;
    profilePhoto?: string;
  };
  parentCommentId?: number;
  replies?: CourseComment[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseCommentRequest {
  content: string;
  sectionId?: number;
  parentCommentId?: number;
}

export interface CourseCommentsResponse {
  success: boolean;
  data: CourseComment[];
  total: number;
}

export async function fetchCourseComments(token: string | null, courseId: number): Promise<CourseComment[]> {
  const response = await apiFetch<CourseCommentsResponse>(`/api/courses/${courseId}/comments`, { token });
  return response.data;
}

export async function fetchSectionComments(token: string | null, courseId: number, sectionId: number): Promise<CourseComment[]> {
  const response = await apiFetch<CourseCommentsResponse>(`/api/courses/${courseId}/comments/sections/${sectionId}`, { token });
  return response.data;
}

export async function createComment(token: string, courseId: number, data: CourseCommentRequest): Promise<CourseComment> {
  const response = await apiFetch<{ success: boolean; data: CourseComment }>(`/api/courses/${courseId}/comments`, {
    method: "POST",
    token,
    json: data,
  });
  return response.data;
}

export async function updateComment(token: string, courseId: number, commentId: number, data: CourseCommentRequest): Promise<CourseComment> {
  const response = await apiFetch<{ success: boolean; data: CourseComment }>(`/api/courses/${courseId}/comments/${commentId}`, {
    method: "PUT",
    token,
    json: data,
  });
  return response.data;
}

export async function deleteComment(token: string, courseId: number, commentId: number): Promise<void> {
  await apiFetch(`/api/courses/${courseId}/comments/${commentId}`, {
    method: "DELETE",
    token,
  });
}

