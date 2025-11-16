import { apiFetch } from "./client";

// ==================== TYPES ====================

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  roles: string[];
  isActive?: boolean;
}

export interface UpdateUserRolesRequest {
  userId: number;
  roles: string[];
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  dateOfBirth?: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface UpdateCourseRequest {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  durationHours?: number;
  difficultyLevel?: string;
  published?: boolean;
  featured?: boolean;
  price?: number;
  discountPrice?: number;
  instructorId?: number;
  targetAudience?: string;
}

export interface CourseResponse {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  durationHours?: number;
  difficultyLevel?: string;
  published: boolean;
  featured: boolean;
  price: number;
  discountPrice?: number;
  enrollmentCount: number;
  completionRate: number;
  instructor?: {
    id: number;
    fullName: string;
    profilePhoto?: string;
  };
  totalLessons?: number;
  totalMaterials?: number;
  isEnrolled?: boolean;
  targetAudience?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== USER MANAGEMENT ====================

/**
 * Get all users (Admin only)
 */
export async function getAllUsers(token: string): Promise<UserResponse[]> {
  const response = await apiFetch<{ success: boolean; data: UserResponse[]; total: number }>(
    "/api/admin/users",
    { token }
  );
  return response.data;
}

/**
 * Create a new user with specific roles (Admin only)
 */
export async function createUser(
  token: string,
  request: CreateUserRequest
): Promise<UserResponse> {
  const response = await apiFetch<{ success: boolean; data: UserResponse }>(
    "/api/admin/users",
    {
      method: "POST",
      token,
      json: request,
    }
  );
  return response.data;
}

/**
 * Update user roles (Admin only)
 */
export async function updateUserRoles(
  token: string,
  userId: number,
  roles: string[]
): Promise<UserResponse> {
  const response = await apiFetch<{ success: boolean; data: UserResponse }>(
    `/api/admin/users/${userId}/roles`,
    {
      method: "PUT",
      token,
      json: { userId, roles },
    }
  );
  return response.data;
}

/**
 * Delete (deactivate) a user (Admin only)
 */
export async function deleteUser(token: string, userId: number): Promise<void> {
  await apiFetch<{ success: boolean; message: string }>(
    `/api/admin/users/${userId}`,
    {
      method: "DELETE",
      token,
    }
  );
}

/**
 * Import users from CSV file (Admin only)
 */
export interface CsvImportResponse {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: Array<{
    rowNumber: number;
    field: string;
    message: string;
  }>;
}

export async function importUsersFromCsv(
  token: string,
  file: File
): Promise<CsvImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch<{ success: boolean; message: string; data: CsvImportResponse }>(
    "/api/admin/users/import-csv",
    {
      method: "POST",
      token,
      body: formData,
    }
  );
  return response.data;
}

// ==================== COURSE MANAGEMENT ====================

/**
 * Get all courses (Admin only)
 */
export async function getAllCoursesAdmin(token: string): Promise<CourseResponse[]> {
  const response = await apiFetch<{ success: boolean; data: CourseResponse[]; total: number }>(
    "/api/admin/courses",
    { token }
  );
  return response.data;
}

/**
 * Create a new course (Admin only)
 */
export async function createCourseAdmin(
  token: string,
  request: UpdateCourseRequest
): Promise<CourseResponse> {
  const response = await apiFetch<{ success: boolean; data: CourseResponse }>(
    "/api/admin/courses",
    {
      method: "POST",
      token,
      json: request,
    }
  );
  return response.data;
}

/**
 * Update a course (Admin only)
 */
export async function updateCourseAdmin(
  token: string,
  courseId: number,
  request: UpdateCourseRequest
): Promise<CourseResponse> {
  const response = await apiFetch<{ success: boolean; data: CourseResponse }>(
    `/api/admin/courses/${courseId}`,
    {
      method: "PUT",
      token,
      json: request,
    }
  );
  return response.data;
}

/**
 * Delete a course (Admin only)
 */
export async function deleteCourseAdmin(token: string, courseId: number): Promise<void> {
  await apiFetch<{ success: boolean; message: string }>(
    `/api/admin/courses/${courseId}`,
    {
      method: "DELETE",
      token,
    }
  );
}

// ==================== FILE UPLOAD ====================

export interface FileUploadResponse {
  success: boolean;
  url: string;
  type: string;
  filename: string;
  size: number;
}

export async function uploadVideo(token: string, file: File): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await apiFetch<FileUploadResponse>("/api/admin/files/video", {
    method: "POST",
    token,
    body: formData,
  });
  return response;
}

export async function uploadAudio(token: string, file: File): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await apiFetch<FileUploadResponse>("/api/admin/files/audio", {
    method: "POST",
    token,
    body: formData,
  });
  return response;
}

export async function uploadImage(token: string, file: File): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await apiFetch<FileUploadResponse>("/api/admin/files/image", {
    method: "POST",
    token,
    body: formData,
  });
  return response;
}

export async function uploadDocument(token: string, file: File): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await apiFetch<FileUploadResponse>("/api/admin/files/document", {
    method: "POST",
    token,
    body: formData,
  });
  return response;
}

export async function uploadCourseThumbnail(token: string, file: File): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await apiFetch<FileUploadResponse>("/api/admin/files/course-thumbnail", {
    method: "POST",
    token,
    body: formData,
  });
  return response;
}

// ==================== COURSE SECTIONS ====================

export interface CourseSectionRequest {
  title: string;
  description?: string;
  usefulLinks?: string;
  orderIndex?: number;
  videoLesson?: {
    title: string;
    description?: string;
    videoUrl: string;
    durationMinutes?: number;
    orderIndex?: number;
  };
  materials?: Array<{
    title: string;
    description?: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
    orderIndex?: number;
  }>;
}

export async function createCourseSection(
  token: string,
  courseId: number,
  request: CourseSectionRequest
): Promise<any> {
  const response = await apiFetch<{ success: boolean; data: any }>(
    `/api/admin/courses/${courseId}/sections`,
    {
      method: "POST",
      token,
      json: request,
    }
  );
  return response.data;
}

export async function updateCourseSection(
  token: string,
  courseId: number,
  sectionId: number,
  request: CourseSectionRequest
): Promise<any> {
  const response = await apiFetch<{ success: boolean; data: any }>(
    `/api/admin/courses/${courseId}/sections/${sectionId}`,
    {
      method: "PUT",
      token,
      json: request,
    }
  );
  return response.data;
}

export async function deleteCourseSection(
  token: string,
  courseId: number,
  sectionId: number
): Promise<void> {
  await apiFetch<{ success: boolean }>(
    `/api/admin/courses/${courseId}/sections/${sectionId}`,
    {
      method: "DELETE",
      token,
    }
  );
}

export async function getCourseSections(token: string, courseId: number): Promise<any[]> {
  const response = await apiFetch<{ success: boolean; data: any[] }>(
    `/api/admin/courses/${courseId}/sections`,
    { token }
  );
  return response.data;
}

// ==================== COURSE QUIZZES ====================

export async function createCourseQuiz(
  token: string,
  courseId: number,
  request: CourseQuizRequest
): Promise<any> {
  const response = await apiFetch<{ success: boolean; data: any }>(
    `/api/admin/courses/${courseId}/quizzes`,
    {
      method: "POST",
      token,
      json: request,
    }
  );
  return response.data;
}

export async function updateCourseQuiz(
  token: string,
  courseId: number,
  quizId: number,
  request: CourseQuizRequest
): Promise<any> {
  const response = await apiFetch<{ success: boolean; data: any }>(
    `/api/admin/courses/${courseId}/quizzes/${quizId}`,
    {
      method: "PUT",
      token,
      json: request,
    }
  );
  return response.data;
}

export async function deleteCourseQuiz(
  token: string,
  courseId: number,
  quizId: number
): Promise<void> {
  await apiFetch<{ success: boolean }>(
    `/api/admin/courses/${courseId}/quizzes/${quizId}`,
    {
      method: "DELETE",
      token,
    }
  );
}

export async function getCourseQuizzes(token: string, courseId: number): Promise<any[]> {
  const response = await apiFetch<{ success: boolean; data: any[] }>(
    `/api/admin/courses/${courseId}/quizzes`,
    { token }
  );
  return response.data;
}

/**
 * Get detailed user information with metrics
 */
export async function getUserDetails(token: string, userId: number): Promise<UserDetailResponse> {
  const response = await apiFetch<{ success: boolean; data: UserDetailResponse }>(
    `/api/admin/users/${userId}/details`,
    { token }
  );
  return response.data;
}

export interface UserDetailResponse {
  // Basic Information
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  dateOfBirth?: string;
  isActive: boolean;
  roles: string[];
  authProvider?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  
  // Account Status
  isAccountNonExpired: boolean;
  isAccountNonLocked: boolean;
  isCredentialsNonExpired: boolean;
  
  // Metrics - Courses
  totalCoursesEnrolled: number;
  completedCourses: number;
  averageCourseProgress: number;
  totalSpentOnCourses: number;
  
  // Metrics - Bookings (if STUDENT)
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  
  // Metrics - Teaching (if INSTRUCTOR)
  totalCoursesCreated?: number;
  totalStudentsEnrolled?: number;
  averageCourseRating?: number;
  totalBookingsAsInstructor?: number;
  
  // Modalities
  enrolledModalities: ModalityInfo[];
  teachingModalities: ModalityInfo[];
  
  // Additional Metadata
  planType: string;
  observations?: string;
  planExpiryDate?: string;
}

export interface ModalityInfo {
  modality: string;
  displayName: string;
  enrolledAt: string;
  active: boolean;
  experienceYears?: number;
  certificationLevel?: string;
}

// ==================== AVAILABLE ROLES ====================
export const AVAILABLE_ROLES = [
  { value: "USER", label: "Usuário Básico" },
  { value: "STUDENT", label: "Estudante" },
  { value: "INSTRUCTOR", label: "Instrutor" },
  { value: "ADMIN", label: "Administrador" },
];

