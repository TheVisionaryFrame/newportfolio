const STORAGE_KEY = "tvf-admin-session";

export type AdminSession = {
  accessToken: string;
  email: string;
};

export function readAdminSession(): AdminSession | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed.accessToken || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAdminSession(session: AdminSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
