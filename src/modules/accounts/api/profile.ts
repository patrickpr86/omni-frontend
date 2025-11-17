import { apiFetch } from "@/shared/api/client.ts";
import type {
  PasswordUpdatePayload,
  ProfileResponse,
  ProfileUpdatePayload,
} from "@/shared/api/types.ts";

export function fetchProfile(token: string) {
  return apiFetch<ProfileResponse>("/api/profile", { token });
}

export function updateProfile(
  token: string,
  payload: ProfileUpdatePayload
) {
  return apiFetch<ProfileResponse>("/api/profile", {
    method: "PUT",
    token,
    json: payload,
  });
}

export function updatePassword(
  token: string,
  payload: PasswordUpdatePayload
) {
  return apiFetch<void>("/api/profile/password", {
    method: "PUT",
    token,
    json: payload,
  });
}
