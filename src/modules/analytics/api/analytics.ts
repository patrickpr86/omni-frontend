import { apiFetch } from "@/shared/api/client.ts";
import type { DashboardMetrics } from "@/shared/api/types.ts";

export function fetchDashboardMetrics(
  token: string,
  params?: {
    startDate?: string;
    endDate?: string;
    modality?: string;
    minAge?: number;
    maxAge?: number;
  }
) {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    });
  }

  const query = searchParams.toString();
  const suffix = query ? `?${query}` : "";

  return apiFetch<DashboardMetrics>(`/api/analytics/dashboard${suffix}`, {
    token,
  });
}
