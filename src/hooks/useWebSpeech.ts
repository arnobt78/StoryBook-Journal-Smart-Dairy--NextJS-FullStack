"use client";

/**
 * @file hooks/useWebSpeech.ts
 *
 * WALKTHROUGH — Phase 1: Web Speech API wrapper
 * ──────────────────────────────────────────────
 * Wraps the browser's native SpeechRecognition in a typed React hook.
 * - `continuous: true` — keeps listening after each pause until `stop()` called
 * - `interimResults: true` — surfaces live interim text for instant feedback
 * - `lang: "en-US"` — default language; can be overridden via options
 *
 * Lifecycle:
 *   start() → browser requests mic permission → recording → onresult fires
 *             → final chunks build up in `transcript` state
 *             → stop() or `maxDurationMs` → "idle"
 *
 * On unmount or provider switch: stop() is called to release the mic.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceInputStatus } from "@/types/voice";

interface UseWebSpeechOptions {
  lang?: string;
  /** If set, automatically stops after this many ms (prevents accidental infinite recording) */
  maxDurationMs?: number;
  onFinal: (text: string) => void;
  onInterim: (text: string) => void;
  onError: (msg: string) => void;
  onStatusChange: (status: VoiceInputStatus) => void;
}

// SpeechRecognition is vendor-prefixed; TypeScript DOM lib may not include it.
// Using unknown + cast at call site is cleanest without `any`.
function getSpeechRecognitionConstructor(): (new () => unknown) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"] ?? null) as
    | (new () => unknown)
    | null;
}

export function useWebSpeech({
  lang = "en-US",
  maxDurationMs,
  onFinal,
  onInterim,
  onError,
  onStatusChange,
}: UseWebSpeechOptions) {
  const recognitionRef = useRef<unknown>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isActive, setIsActive] = useState(false);

  /** Release all resources */
  const stop = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (recognitionRef.current) {
      try {
        (recognitionRef.current as { stop: () => void }).stop();
      } catch {
        // ignore already-stopped errors
      }
      recognitionRef.current = null;
    }
    setIsActive(false);
    onStatusChange("idle");
  }, [onStatusChange]);

  const start = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor) {
      onError("Speech Recognition is not supported in this browser.");
      onStatusChange("error");
      return;
    }

    stop();
    onStatusChange("requesting-permission");

    const rec = new SpeechRecognitionCtor() as {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      maxAlternatives: number;
      onstart: () => void;
      onresult: (event: unknown) => void;
      onerror: (event: unknown) => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
    };
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsActive(true);
      onStatusChange("recording");
    };

    rec.onresult = (event: unknown) => {
      const e = event as { resultIndex: number; results: SpeechRecognitionResultList };
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          onFinal(transcript);
        } else {
          interim += transcript;
        }
      }
      if (interim) onInterim(interim);
    };

    rec.onerror = (event: unknown) => {
      const e = event as { error: string };
      const msg =
        e.error === "not-allowed"
          ? "Microphone permission denied."
          : `Speech recognition error: ${e.error}`;
      onError(msg);
      onStatusChange("error");
      setIsActive(false);
      recognitionRef.current = null;
    };

    rec.onend = () => {
      // When continuous recognition ends without an explicit stop (e.g. silence timeout),
      // restart to keep listening until the user presses stop.
      if (recognitionRef.current) {
        try {
          rec.start();
        } catch {
          setIsActive(false);
          onStatusChange("idle");
          recognitionRef.current = null;
        }
      }
    };

    recognitionRef.current = rec;
    rec.start();

    if (maxDurationMs) {
      timeoutRef.current = setTimeout(() => stop(), maxDurationMs);
    }
  }, [lang, maxDurationMs, onError, onFinal, onInterim, onStatusChange, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (recognitionRef.current) {
        try {
          (recognitionRef.current as { stop: () => void }).stop();
        } catch { /* ignore */ }
      }
    };
  }, []);

  return { start, stop, isActive };
}
