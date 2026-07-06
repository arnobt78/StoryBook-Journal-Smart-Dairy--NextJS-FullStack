/**
 * @file hooks/useJournalRealtime.ts
 *
 * WALKTHROUGH — Client SSE subscription for cross-tab sync
 * ──────────────────────────────────────────────────────
 * Opens EventSource to `/api/journal/events?since=` when session is authenticated.
 * On each event → `notifyJournalCacheUpdated` so shelf + reader refetch without refresh.
 * Pauses when tab hidden; exponential backoff on disconnect. Debounced toast for remote edits.
 */
"use client";

/**
 * SSE subscription — invalidates journalSubtree when another tab/device mutates data.
 * Reconnect passes ?since=lastEventAt for dedupe; pauses when tab is hidden.
 */
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { notifyJournalCacheUpdated } from "@/lib/journal-cache-notify";
import { appToast } from "@/lib/app-toast";

const RECONNECT_MS = 3000;
const MAX_RECONNECT_MS = 30000;

export function useJournalRealtime() {
  const queryClient = useQueryClient();
  const { status } = useSession();
  const esRef = useRef<EventSource | null>(null);
  const backoffRef = useRef(RECONNECT_MS);
  const lastToastRef = useRef(0);
  const lastEventAtRef = useRef(0);

  useEffect(() => {
    if (status !== "authenticated") return;

    if (lastEventAtRef.current === 0) {
      lastEventAtRef.current = Date.now();
    }

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const buildUrl = () => {
      const since = lastEventAtRef.current;
      return `/api/journal/events?since=${since}`;
    };

    const connect = () => {
      if (cancelled || document.visibilityState === "hidden") return;
      esRef.current?.close();

      const es = new EventSource(buildUrl());
      esRef.current = es;

      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as {
            type?: string;
            heartbeat?: boolean;
            connected?: boolean;
            at?: number;
          };
          if (data.at) lastEventAtRef.current = Math.max(lastEventAtRef.current, data.at);
          if (data.heartbeat || data.connected) return;
          void notifyJournalCacheUpdated(queryClient);
          const now = Date.now();
          if (now - lastToastRef.current > 4000) {
            lastToastRef.current = now;
            appToast.sync.refreshed();
          }
        } catch {
          /* ignore malformed events */
        }
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        if (cancelled) return;
        reconnectTimer = setTimeout(() => {
          backoffRef.current = Math.min(backoffRef.current * 1.5, MAX_RECONNECT_MS);
          connect();
        }, backoffRef.current);
      };

      es.onopen = () => {
        backoffRef.current = RECONNECT_MS;
      };
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        connect();
      } else {
        esRef.current?.close();
        esRef.current = null;
      }
    };

    connect();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      esRef.current?.close();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [status, queryClient]);
}
