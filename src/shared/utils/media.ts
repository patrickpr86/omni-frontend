const PDF_MAGIC = "JVBERi0x";
const PNG_MAGIC = "iVBORw0KGgo";
const JPG_MAGIC = "/9j/";
const GIF_MAGIC = "R0lGOD";
const WEBP_MAGIC = "UklGR";

export function guessMimeTypeFromBase64(base64: string | null | undefined): string {
  if (!base64) return "";
  const trimmed = base64.trim();

  if (trimmed.startsWith(PNG_MAGIC)) return "image/png";
  if (trimmed.startsWith(JPG_MAGIC)) return "image/jpeg";
  if (trimmed.startsWith(GIF_MAGIC)) return "image/gif";
  if (trimmed.startsWith(WEBP_MAGIC)) return "image/webp";
  if (trimmed.startsWith(PDF_MAGIC)) return "application/pdf";

  return "";
}

export function extractBase64Payload(
  input: string | null | undefined,
  fallbackMime = ""
): { base64: string; mimeType: string } {
  if (!input) {
    return { base64: "", mimeType: fallbackMime };
  }

  if (input.startsWith("data:")) {
    const [meta, base64Payload = ""] = input.split(",");
    const match = meta.match(/^data:(.*?);base64$/);
    const mimeType = match?.[1] ?? fallbackMime ?? "";
    return { base64: base64Payload, mimeType };
  }

  const inferred = guessMimeTypeFromBase64(input) || fallbackMime;
  return { base64: input, mimeType: inferred };
}

export function buildDataUrl(base64: string, mimeType?: string): string {
  if (!base64) return "";

  const inferred = mimeType || guessMimeTypeFromBase64(base64) || "image/png";
  return `data:${inferred};base64,${base64}`;
}
