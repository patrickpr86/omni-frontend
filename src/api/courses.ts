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

