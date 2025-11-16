import { apiFetch } from "./client";

// ==================== TYPES ====================

export interface TimelineEvent {
  id: number;
  title: string;
  description?: string;
  eventType: string;
  eventTypeDisplay: string;
  target: string;
  targetDisplay: string;
  eventDate: string; // ISO date string
  eventTime?: string; // HH:mm format
  location?: string;
  externalUrl?: string;
  imageUrl?: string;
  registrationPrice?: number; // Valor da inscrição em reais
  prizePool?: number; // Premiação total em reais
  registrationDetails?: string; // Detalhes completos de inscrição (JSON)
  prizeDetails?: string; // Detalhes completos de premiação (JSON)
  isActive: boolean;
  isExternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimelineEventRequest {
  title: string;
  description?: string;
  eventType: string;
  target: string;
  eventDate: string; // YYYY-MM-DD
  eventTime?: string; // HH:mm
  location?: string;
  externalUrl?: string;
  imageUrl?: string;
  registrationPrice?: number; // Valor da inscrição em reais
  prizePool?: number; // Premiação total em reais
}

// ==================== API FUNCTIONS ====================

/**
 * Get timeline events for current user
 */
export async function getTimelineEvents(
  token: string,
  year?: number,
  month?: number
): Promise<TimelineEvent[]> {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());

  const url = `/api/timeline${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await apiFetch<{ success: boolean; data: TimelineEvent[]; total: number }>(
    url,
    { token }
  );
  return response.data;
}

/**
 * Create a new timeline event (Admin only)
 */
export async function createTimelineEvent(
  token: string,
  data: CreateTimelineEventRequest
): Promise<TimelineEvent> {
  const response = await apiFetch<{ success: boolean; data: TimelineEvent }>("/api/timeline", {
    token,
    method: "POST",
    json: data,
  });
  return response.data;
}

/**
 * Get championships only
 */
export async function getChampionships(
  token: string,
  year?: number,
  month?: number
): Promise<TimelineEvent[]> {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());

  const url = `/api/timeline/championships${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await apiFetch<{ success: boolean; data: TimelineEvent[]; total: number }>(
    url,
    { token }
  );
  return response.data;
}

/**
 * Manually trigger championship sync (Admin only)
 */
export async function syncChampionships(token: string): Promise<{ synced: boolean; message: string }> {
  const response = await apiFetch<{ success: boolean; synced: boolean; message: string }>("/api/timeline/sync-championships", {
    token,
    method: "POST",
  });
  return { synced: response.synced, message: response.message };
}

/**
 * Confirm event registration (user registers for an event)
 */
export async function confirmEventRegistration(
  token: string,
  eventId: number
): Promise<void> {
  await apiFetch<{ success: boolean; message: string }>(
    `/api/timeline/events/${eventId}/register`,
    {
      token,
      method: "POST",
    }
  );
}

export interface AgendaItem {
  type: "EVENT" | "BOOKING";
  id: number;
  title: string;
  description?: string;
  date: string; // ISO date string
  time?: string; // HH:mm format
  location?: string;
  status: string;
  details?: any;
}

/**
 * Get user agenda (events + bookings for the month)
 */
export async function getUserAgenda(
  token: string,
  year?: number,
  month?: number
): Promise<AgendaItem[]> {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());

  const url = `/api/timeline/agenda${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await apiFetch<{ success: boolean; data: AgendaItem[]; total: number }>(
    url,
    { token }
  );
  return response.data;
}

// ==================== HELPERS ====================

export const EVENT_TYPE_LABELS: Record<string, string> = {
  CHAMPIONSHIP: "Campeonato",
  BELT_EXAM: "Exame de Faixa",
  TRAINING: "Treino",
  SEMINAR: "Seminário",
  WORKSHOP: "Workshop",
  COMPETITION: "Competição",
  MEETING: "Reunião",
  OTHER: "Outro",
};

export const EVENT_TYPE_ICONS: Record<string, string> = {
  CHAMPIONSHIP: "🏆",
  BELT_EXAM: "🥋",
  TRAINING: "💪",
  SEMINAR: "📚",
  WORKSHOP: "🔧",
  COMPETITION: "⚔️",
  MEETING: "👥",
  OTHER: "📅",
};

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(timeString?: string): string {
  if (!timeString) return "";
  return timeString.substring(0, 5); // HH:mm
}

export function getMonthName(month: number): string {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return months[month - 1] || "";
}

export function formatPrice(price?: number): string {
  if (!price) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

