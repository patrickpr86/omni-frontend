import { useMemo } from "react";
import type { Booking } from "@/shared/api/types.ts";

export type FetchState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
};

export const createEmptyState = <T,>(data: T): FetchState<T> => ({
  data,
  loading: false,
  error: null,
});

export const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  REJECTED: "Recusada",
  CANCELLED: "Cancelada",
};

export function formatDate(date?: string) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(time?: string) {
  if (!time) return "-";
  return time.substring(0, 5);
}

export function formatStatus(status: string) {
  return statusLabels[status] ?? status;
}

export function formatPercentage(value?: number | null) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0%";
  }

  if (value > 1) {
    return `${Math.round(value)}%`;
  }

  return `${Math.round(value * 100)}%`;
}

export type BookingFilter = {
  status: "ALL" | "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
  scope: "upcoming" | "past" | "all";
};

export const defaultBookingFilter: BookingFilter = {
  status: "ALL",
  scope: "upcoming",
};

export function useFilteredBookings(
  bookings: Booking[],
  filter: BookingFilter
) {
  const now = useMemo(() => new Date(), []);

  return useMemo(() => {
    return bookings.filter((booking) => {
      const bookingDate = booking.requestedDate
        ? new Date(`${booking.requestedDate}T${booking.requestedTime ?? "00:00"}`)
        : null;

      if (filter.status !== "ALL" && booking.status !== filter.status) {
        return false;
      }

      if (!bookingDate) {
        return filter.scope !== "upcoming";
      }

      if (filter.scope === "upcoming") {
        return bookingDate >= now;
      }

      if (filter.scope === "past") {
        return bookingDate < now;
      }

      return true;
    });
  }, [bookings, filter.scope, filter.status, now]);
}

export function toCsv(rows: string[][]): string {
  const escapeCell = (value: string) => {
    if (value.includes('"') || value.includes(",") || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  return rows.map((row) => row.map(escapeCell).join(",")).join("\n");
}

export function downloadCsv(filename: string, rows: string[][]): void {
  const csvContent = toCsv(rows);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.append(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
