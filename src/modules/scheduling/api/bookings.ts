import { apiFetch } from "@/shared/api/client.ts";

// ==================== TYPES ====================

export interface AvailableTeacher {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  modalities: string[];
  availableDays: string[];
  experienceYears?: number;
  certificationLevel?: string;
  isAvailable: boolean;
}

export interface Booking {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
  modality: string;
  requestedDate: string; // ISO date string
  requestedTime: string; // HH:mm format
  durationMinutes: number;
  status: BookingStatus;
  studentNotes?: string;
  teacherNotes?: string;
  location?: string;
  createdAt: string;
  confirmedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";

export interface CreateBookingRequest {
  teacherId: number;
  modality: string;
  requestedDate: string; // YYYY-MM-DD
  requestedTime: string; // HH:mm
  durationMinutes?: number;
  studentNotes?: string;
  location?: string;
}

export interface ConfirmBookingRequest {
  teacherNotes?: string;
}

export interface RejectBookingRequest {
  teacherNotes: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Get available teachers for private lessons
 */
export async function getAvailableTeachers(token: string): Promise<AvailableTeacher[]> {
  return await apiFetch<AvailableTeacher[]>("/api/bookings/teachers/available", { token });
}

/**
 * Create a new booking request
 */
export async function createBooking(
  token: string,
  data: CreateBookingRequest
): Promise<Booking> {
  return await apiFetch<Booking>("/api/bookings", {
    token,
    method: "POST",
    json: data,
  });
}

/**
 * Get my bookings (as student or teacher)
 */
export async function getMyBookings(token: string): Promise<Booking[]> {
  return await apiFetch<Booking[]>("/api/bookings/my-bookings", { token });
}

/**
 * Get pending bookings (teacher only)
 */
export async function getPendingBookings(token: string): Promise<Booking[]> {
  return await apiFetch<Booking[]>("/api/bookings/pending", { token });
}

/**
 * Get upcoming bookings
 */
export async function getUpcomingBookings(token: string): Promise<Booking[]> {
  return await apiFetch<Booking[]>("/api/bookings/upcoming", { token });
}

/**
 * Confirm a booking (teacher only)
 */
export async function confirmBooking(
  token: string,
  bookingId: number,
  data?: ConfirmBookingRequest
): Promise<Booking> {
  const url = data?.teacherNotes
    ? `/api/bookings/${bookingId}/confirm?notes=${encodeURIComponent(data.teacherNotes)}`
    : `/api/bookings/${bookingId}/confirm`;

  return await apiFetch<Booking>(url, {
    token,
    method: "POST",
  });
}

/**
 * Reject a booking (teacher only)
 */
export async function rejectBooking(
  token: string,
  bookingId: number,
  data: RejectBookingRequest
): Promise<Booking> {
  return await apiFetch<Booking>(
    `/api/bookings/${bookingId}/reject?reason=${encodeURIComponent(data.teacherNotes)}`,
    {
      token,
      method: "POST",
    }
  );
}

/**
 * Cancel a booking
 */
export async function cancelBooking(token: string, bookingId: number): Promise<Booking> {
  return await apiFetch<Booking>(`/api/bookings/${bookingId}/cancel`, {
    token,
    method: "POST",
  });
}

// ==================== HELPERS ====================

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  REJECTED: "Recusada",
  CANCELLED: "Cancelada",
  COMPLETED: "Concluída",
};

export const MODALITY_LABELS: Record<string, string> = {
  JIU_JITSU: "Jiu-Jitsu",
  MUAY_THAI: "Muay Thai",
  BOXING: "Boxe",
  KICKBOXING: "Kickboxing",
  MMA: "MMA",
  KARATE: "Karatê",
  TAEKWONDO: "Taekwondo",
  JUDO: "Judô",
  CAPOEIRA: "Capoeira",
};

export const DAY_LABELS: Record<string, string> = {
  MONDAY: "Segunda",
  TUESDAY: "Terça",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
}

export function formatTime(timeString: string): string {
  return timeString.substring(0, 5); // HH:mm
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR");
}
