import { apiFetch } from "./client";
import type {
  AvailableTeacher,
  Booking,
  BookingActionPayload,
  BookingRequestPayload,
} from "./types";

export function fetchAvailableTeachers(token: string) {
  return apiFetch<AvailableTeacher[]>("/api/bookings/teachers/available", {
    token,
  });
}

export function createBooking(token: string, payload: BookingRequestPayload) {
  return apiFetch<Booking>("/api/bookings", {
    method: "POST",
    token,
    json: payload,
  });
}

export function fetchMyBookings(token: string, role?: "teacher" | "student") {
  const query = role ? `?role=${role}` : "";
  return apiFetch<Booking[]>(`/api/bookings/my-bookings${query}`, { token });
}

export function fetchUpcomingBookings(
  token: string,
  role?: "teacher" | "student"
) {
  const query = role ? `?role=${role}` : "";
  return apiFetch<Booking[]>(`/api/bookings/upcoming${query}`, { token });
}

export function fetchPendingBookings(token: string) {
  return apiFetch<Booking[]>("/api/bookings/pending", { token });
}

export function confirmBooking(
  token: string,
  bookingId: number,
  payload?: BookingActionPayload
) {
  return apiFetch<Booking>(`/api/bookings/${bookingId}/confirm`, {
    method: "POST",
    token,
    json: payload,
  });
}

export function rejectBooking(
  token: string,
  bookingId: number,
  payload?: BookingActionPayload
) {
  return apiFetch<Booking>(`/api/bookings/${bookingId}/reject`, {
    method: "POST",
    token,
    json: payload,
  });
}

export function cancelBooking(token: string, bookingId: number) {
  return apiFetch<Booking>(`/api/bookings/${bookingId}/cancel`, {
    method: "POST",
    token,
  });
}
