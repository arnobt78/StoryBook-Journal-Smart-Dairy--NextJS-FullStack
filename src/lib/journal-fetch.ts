/**
 * @file lib/journal-fetch.ts
 *
 * Shared client fetch for journal API routes — credentials, envelope errors, 401 recovery.
 */
import { appToast } from "@/lib/app-toast";

export class JournalApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "JournalApiError";
    this.status = status;
  }
}

let sessionExpiredHandled = false;

export function isUnauthorizedError(err: unknown): boolean {
  return err instanceof JournalApiError && err.status === 401;
}

/** Toast + redirect to login with return path (once per page load). */
export function handleSessionExpired(): void {
  if (sessionExpiredHandled || typeof window === "undefined") return;
  sessionExpiredHandled = true;
  appToast.auth.sessionExpired();
  const callbackUrl = encodeURIComponent(
    `${window.location.pathname}${window.location.search}`,
  );
  window.location.assign(`/login?callbackUrl=${callbackUrl}`);
}

type Envelope = { success?: boolean; message?: string };

/** Same-origin fetch with session cookies; throws JournalApiError on HTTP errors. */
export async function journalFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers,
  });

  if (res.ok) return res;

  let message = `Request failed (${res.status})`;
  try {
    const json = (await res.json()) as Envelope;
    if (json.message) message = json.message;
  } catch {
    // non-JSON body
  }

  throw new JournalApiError(res.status, message);
}
