const DEFAULT_BASE_URL = "http://localhost:8080";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_BASE_URL;

type RequestOptions = RequestInit & {
  token?: string | null;
  json?: unknown;
};

export async function apiFetch<T>(
  path: string,
  { token, json, headers, ...init }: RequestOptions = {}
): Promise<T> {
  const finalHeaders = new Headers(headers ?? {});

  // Não definir Content-Type para FormData - o browser define automaticamente com boundary
  const isFormData = init.body instanceof FormData;
  
  if (json !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
  } else if (!isFormData) {
    // Se não for FormData e não tiver Content-Type definido, manter o padrão
  }

  if (token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: finalHeaders,
    body: json !== undefined ? JSON.stringify(json) : init.body,
  });

  if (!response.ok) {
    let message = response.statusText;

    try {
      const data = await response.json();
      message =
        (data?.error as string) ??
        (data?.message as string) ??
        JSON.stringify(data, null, 2);
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(message || "Erro na requisição");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
