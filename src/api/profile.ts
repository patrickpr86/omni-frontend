import { apiFetch } from "./client";
import type {
  PasswordUpdatePayload,
  ProfileResponse,
  ProfileUpdatePayload,
} from "./types";

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
