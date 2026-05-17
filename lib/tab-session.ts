/**
 * Per-tab session storage (isolated per browser tab; not shared like cookies/localStorage).
 * Each tab maintains its own JWT and user snapshot.
 */

import type { User } from "@/types";

const TOKEN_KEY = "it-support:token";
const USER_KEY = "it-support:user";

function assertBrowser() {
  if (typeof window === "undefined") {
    throw new Error("tab-session can only be used in the browser");
  }
}

export function getTabToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setTabSession(token: string, user: User) {
  assertBrowser();
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getTabUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearTabSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch {
    // ignore quota / privacy errors
  }
}

export function hasTabSession(): boolean {
  return !!getTabToken();
}

/**
 * Authenticated GET download (e.g. PDF export) — uses this tab's Bearer token.
 */
export async function downloadAuthenticatedFile(
  url: string,
  filename: string
): Promise<void> {
  const token = getTabToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Download failed");

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

/**
 * SSE URLs cannot send Authorization headers; append token for stream routes only.
 */
export function withAccessTokenQuery(url: string): string {
  const token = getTabToken();
  if (!token) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}access_token=${encodeURIComponent(token)}`;
}
