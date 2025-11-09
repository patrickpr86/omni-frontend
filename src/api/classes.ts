import { apiFetch } from "./client";
import type { MartialArtClass } from "./types";

export function fetchClasses(token?: string | null) {
  return apiFetch<MartialArtClass[]>("/api/classes", { token });
}

export function fetchModalities(token?: string | null) {
  return apiFetch<string[]>("/api/classes/modalities", { token });
}
