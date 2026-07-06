"use client";

/**
 * @file hooks/useVoiceInput.ts
 *
 * WALKTHROUGH — Top-level voice input state machine
 * ──────────────────────────────────────────────────
 * Delegates to one of three sub-hooks based on the active SttProvider:
 *   Phase 1 → useWebSpeech (SpeechRecognition API)
 *   Phase 2 → useBrowserWhisper (Transformers.js WASM)
 *   Phase 3 → chunked POST to /api/voice/transcribe (Deepgram / AssemblyAI)
 *
 * State machine:
 *   idle → recording → (transcribing on Phase 2/3) → idle
 *             ↘ error ↗
 *
 * Calling `toggle()` starts or stops recording.
 * Each final transcript chunk fires `onTranscript(text)` — the parent
 * (RightPage) calls `editorRef.current?.insertTextAtCursor(text)`.
 *
 * Provider preference is persisted to localStorage via lib/voice-input.ts.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { SttProvider, UseVoiceInputReturn, VoiceInputStatus } from "@/types/voice";
import {
  detectPreferredProvider,
  getAvailableProviders,
  hasAnyVoiceSupport,
  saveProviderPreference,
  VOICE_CHUNK_INTERVAL_MS,
  VOICE_LISTENING_INTERIM,
  VOICE_PROCESSING_INTERIM,
  VOICE_TRANSCRIBE_PATH,
} from "@/lib/voice-input";
import { createVoiceProcessingQueue } from "@/lib/voice-recorder-drain";
import { mergeTranscriptDelta } from "@/lib/voice-transcript-merge";
import { useBrowserWhisper } from "@/hooks/useBrowserWhisper";
import { useWebSpeech } from "@/hooks/useWebSpeech";

interface UseVoiceInputOptions {
  onTranscript: (text: string) => void;
}

export function useVoiceInput({ onTranscript }: UseVoiceInputOptions): UseVoiceInputReturn {
  const [provider, setProviderState] = useState<SttProvider>(() =>
    typeof window === "undefined" ? "web-speech" : detectPreferredProvider(),
  );
  const [status, setStatus] = useState<VoiceInputStatus>("idle");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [modelProgress, setModelProgress] = useState<number | null>(null);
  const [phase3Draining, setPhase3Draining] = useState(false);
  const [phase3InFlight, setPhase3InFlight] = useState(false);
  const isVoiceProcessingRef = useRef(false);
  const whisperTranscriptTailRef = useRef("");

  // Phase 3 — chunked server upload
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const phase3ActiveRef = useRef(false);
  const phase3DrainingRef = useRef(false);
  const phase3QueueRef = useRef(createVoiceProcessingQueue());
  const phase3ProviderRef = useRef<"server-deepgram" | "server-assemblyai">("server-deepgram");
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  });

  const isSupported = typeof window !== "undefined" && hasAnyVoiceSupport();

  const handleFinal = useCallback(
    (text: string) => {
      setInterim("");
      if (text.trim()) onTranscript(text.trim());
    },
    [onTranscript],
  );

  const handleWhisperFinal = useCallback(
    (text: string) => {
      const delta = mergeTranscriptDelta(whisperTranscriptTailRef.current, text);
      if (delta.trim()) {
        whisperTranscriptTailRef.current = `${whisperTranscriptTailRef.current} ${delta}`.trim();
        onTranscript(delta.trim());
      }
    },
    [onTranscript],
  );

  const handleInterim = useCallback((text: string) => {
    setInterim(text);
  }, []);

  const handleError = useCallback((msg: string) => {
    setError(msg);
    setInterim("");
    setModelProgress(null);
  }, []);

  const handleStatusChange = useCallback((s: VoiceInputStatus) => {
    setStatus(s);
    if ((s === "idle" || s === "error") && !isVoiceProcessingRef.current) {
      setInterim("");
    }
  }, []);

  // Phase 1 sub-hook (always constructed, conditionally used)
  const webSpeech = useWebSpeech({
    onFinal: handleFinal,
    onInterim: handleInterim,
    onError: handleError,
    onStatusChange: handleStatusChange,
  });

  // Phase 2 sub-hook — enabled only when Private (On-Device) provider is active
  const browserWhisper = useBrowserWhisper({
    enabled: provider === "browser-whisper",
    onFinal: handleWhisperFinal,
    onInterim: handleInterim,
    onError: handleError,
    onStatusChange: handleStatusChange,
    onModelProgress: setModelProgress,
  });

  // ── Phase 3: chunked recording POST to server ───────────────────────────
  const processPhase3ChunkRef = useRef<(blob: Blob) => Promise<void>>(async () => {});
  const stopPhase3Ref = useRef<() => void>(() => {});

  useEffect(() => {
    processPhase3ChunkRef.current = async (blob: Blob) => {
      setPhase3InFlight(true);
      setStatus("transcribing");
      try {
        const formData = new FormData();
        formData.append("audio", blob, "chunk.webm");
        formData.append("provider", phase3ProviderRef.current);
        const res = await fetch(VOICE_TRANSCRIBE_PATH, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const json = (await res.json().catch(() => ({}))) as { error?: string };
          if (res.status === 503) {
            setError(json.error ?? "Server STT unavailable. Switching to browser mode.");
            setStatus("error");
            stopPhase3Ref.current();
          }
          return;
        }
        const json = (await res.json()) as { text?: string };
        if (json.text?.trim()) onTranscriptRef.current(json.text.trim());
        if (phase3DrainingRef.current) {
          setInterim(VOICE_PROCESSING_INTERIM);
        } else if (phase3ActiveRef.current) {
          setStatus("recording");
          setInterim(VOICE_LISTENING_INTERIM);
        }
      } catch {
        if (phase3DrainingRef.current) {
          setInterim(VOICE_PROCESSING_INTERIM);
        } else if (phase3ActiveRef.current) {
          setStatus("recording");
          setInterim(VOICE_LISTENING_INTERIM);
        }
      } finally {
        setPhase3InFlight(false);
      }
    };
  });

  const stopPhase3 = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    const needsDrain =
      phase3ActiveRef.current ||
      phase3DrainingRef.current ||
      recorder?.state === "recording" ||
      recorder?.state === "paused";

    phase3ActiveRef.current = false;

    const cleanup = () => {
      const stream = streamRef.current;
      stream?.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
      streamRef.current = null;
      phase3DrainingRef.current = false;
      setPhase3Draining(false);
      setPhase3InFlight(false);
      setStatus("idle");
      if (!isVoiceProcessingRef.current) setInterim("");
    };

    const drainAndCleanup = async () => {
      await phase3QueueRef.current.awaitIdle();
      cleanup();
    };

    if (!needsDrain) {
      void drainAndCleanup();
      return;
    }

    phase3DrainingRef.current = true;
    setPhase3Draining(true);
    setInterim(VOICE_PROCESSING_INTERIM);

    // Release mic immediately — in-flight chunk blobs still drain via queue
    const stream = streamRef.current;
    stream?.getTracks().forEach((t) => t.stop());

    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        void drainAndCleanup();
      };
      try {
        recorder.stop();
      } catch {
        void drainAndCleanup();
      }
      return;
    }

    void drainAndCleanup();
  }, []);

  useEffect(() => {
    stopPhase3Ref.current = stopPhase3;
  }, [stopPhase3]);

  const startPhase3 = useCallback(
    async (prov: "server-deepgram" | "server-assemblyai") => {
      setStatus("requesting-permission");
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setError("Microphone permission denied.");
        setStatus("error");
        return;
      }

      phase3QueueRef.current = createVoiceProcessingQueue();
      phase3ActiveRef.current = true;
      phase3DrainingRef.current = false;
      setPhase3Draining(false);
      setPhase3InFlight(false);
      phase3ProviderRef.current = prov;

      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (!e.data || e.data.size === 0) return;
        if (!phase3ActiveRef.current && !phase3DrainingRef.current) return;
        void phase3QueueRef.current.enqueue(() =>
          processPhase3ChunkRef.current(e.data),
        );
      };

      recorder.onstart = () => {
        setStatus("recording");
        setInterim(VOICE_LISTENING_INTERIM);
      };
      recorder.onstop = () => {
        if (phase3DrainingRef.current) return;
        setStatus("idle");
      };

      recorder.start(VOICE_CHUNK_INTERVAL_MS);
    },
    [],
  );

  // ── Unified stop (all providers) ───────────────────────────────────────
  const stopAll = useCallback(() => {
    webSpeech.stop();
    browserWhisper.stop();
    stopPhase3();
  }, [webSpeech, browserWhisper, stopPhase3]);

  // ── Toggle ─────────────────────────────────────────────────────────────
  const toggle = useCallback(() => {
    const isRecording =
      status === "recording" ||
      status === "transcribing" ||
      status === "requesting-permission" ||
      webSpeech.isActive ||
      browserWhisper.isActive ||
      browserWhisper.isDraining ||
      phase3Draining;

    if (isRecording) {
      stopAll();
      return;
    }

    setError(null);

    switch (provider) {
      case "web-speech":
        webSpeech.start();
        break;
      case "browser-whisper":
        void browserWhisper.start();
        break;
      case "server-deepgram":
      case "server-assemblyai":
        void startPhase3(provider);
        break;
    }
  }, [
    status,
    provider,
    stopAll,
    webSpeech,
    browserWhisper,
    startPhase3,
    phase3Draining,
  ]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setProvider = useCallback(
    (p: SttProvider) => {
      // Stop any active recording before switching providers
      stopAll();
      setProviderState(p);
      saveProviderPreference(p);
    },
    [stopAll],
  );

  // Inform caller about available providers for the picker
  const availableProviders =
    typeof window !== "undefined" ? getAvailableProviders() : (["web-speech"] as SttProvider[]);

  const isVoiceProcessing =
    browserWhisper.isVoiceProcessing || phase3InFlight || phase3Draining;
  const isVoiceDraining = browserWhisper.isDraining || phase3Draining;

  useEffect(() => {
    isVoiceProcessingRef.current = isVoiceProcessing;
  }, [isVoiceProcessing]);

  useEffect(() => {
    if (provider === "browser-whisper" && status === "idle") {
      whisperTranscriptTailRef.current = "";
    }
  }, [provider, status]);

  return {
    status,
    interim,
    error,
    modelProgress,
    isVoiceProcessing,
    isVoiceDraining,
    isMicActive:
      webSpeech.isActive ||
      browserWhisper.isActive ||
      status === "recording" ||
      status === "transcribing" ||
      status === "requesting-permission",
    provider,
    setProvider,
    isSupported: isSupported && availableProviders.length > 0,
    toggle,
  };
}
