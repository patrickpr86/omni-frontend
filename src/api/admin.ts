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

