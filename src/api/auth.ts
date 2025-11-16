import { apiFetch } from "./client";
import type {
  JwtResponse,
  PasswordResetPayload,
  PasswordResetRequestPayload,
  ProfileResponse,
} from "./types";

export async function loginRequest(params: {
  usernameOrEmail: string;
  password: string;
}): Promise<JwtResponse> {
  return apiFetch<JwtResponse>("/api/auth/login", {
    method: "POST",
    json: params,
  });
}

export async function fetchProfile(token: string) {
  return apiFetch<ProfileResponse>("/api/profile", { token });
}

export function requestPasswordReset(payload: PasswordResetRequestPayload) {
  return apiFetch<void>("/api/auth/password/reset-request", {
    method: "POST",
    json: payload,
  });
}

export function resetPassword(payload: PasswordResetPayload) {
  return apiFetch<void>("/api/auth/password/reset", {
    method: "POST",
    json: payload,
  });
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
}

export interface RegisterResponse {
  message: string;
  username: string;
  email: string;
  roles: string[];
}

export async function registerUser(params: RegisterRequest): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/api/auth/register", {
    method: "POST",
    json: params,
  });
}
