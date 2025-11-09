const PHOTO_CACHE_KEY = "omni-profile-photo-cache";

export type CachedPhoto = {
  base64: string;
  mimeType?: string;
  fileName?: string;
};

export function loadCachedPhoto(): CachedPhoto | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PHOTO_CACHE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CachedPhoto;
    if (!parsed || typeof parsed.base64 !== "string" || parsed.base64.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function storeCachedPhoto(photo: CachedPhoto | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!photo || !photo.base64) {
    window.localStorage.removeItem(PHOTO_CACHE_KEY);
    return;
  }

  const payload: CachedPhoto = {
    base64: photo.base64,
    mimeType: photo.mimeType,
    fileName: photo.fileName,
  };
  window.localStorage.setItem(PHOTO_CACHE_KEY, JSON.stringify(payload));
}
