import { apiFetch } from "@/shared/api/client.ts";
import type { MartialArtClass } from "@/shared/api/types.ts";

export function fetchClasses(token?: string | null) {
  return apiFetch<MartialArtClass[]>("/api/classes", { token });
}

export function fetchModalities(token?: string | null) {
  return apiFetch<string[]>("/api/classes/modalities", { token });
}
