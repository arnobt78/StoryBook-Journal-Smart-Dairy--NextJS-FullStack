"use client";

/**
 * @file hooks/useBrowserWhisper.ts
 *
 * WALKTHROUGH — Phase 2: In-browser Whisper via @huggingface/transformers
 * ────────────────────────────────────────────────────────────────────────
 * MediaRecorder timeslice blobs are merged per session before decode.
 * Only new PCM samples (since last offset) are sent to Whisper.
 * Jobs run on a serialized queue so Stop flush never races in-flight work.
 * AnalyserNode VAD skips silent timeslices.
 *
 * Banner UX: Listening… while mic is on; WASM runs silently in background.
 * Processing… only after Stop while drain queue finishes.
 * Quick (Web Speech) streams interimResults; final text inserts via onFinal.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceInputStatus } from "@/types/voice";
import {
  getPreferredRecorderMimeType,
  hasMediaRecorder,
  VOICE_LISTENING_INTERIM,
  VOICE_MIN_MERGED_BYTES,
  VOICE_PROCESSING_INTERIM,
  WHISPER_CHUNK_INTERVAL_MS,
  WHISPER_MIN_NEW_SAMPLES,
} from "@/lib/voice-input";
import { createVoiceProcessingQueue } from "@/lib/voice-recorder-drain";
import { createSpeechMonitor, type SpeechMonitor } from "@/lib/voice-speech-detection";
import { trimSessionChunksIfNeeded } from "@/lib/voice-session-trim";
import {
  isSoftDecodeError,
  loadWhisperPipeline,
  mergeRecorderChunks,
  resetWhisperPipeline,
  sanitizeWhisperChunkError,
  sanitizeWhisperLoadError,
  transcribeIncrementalSession,
} from "@/lib/whisper-browser";

const MAX_CONSECUTIVE_FAILURES = 3;

interface UseBrowserWhisperOptions {
  enabled?: boolean;
  onFinal: (text: string) => void;
  onInterim: (text: string) => void;
  onError: (msg: string) => void;
  onStatusChange: (status: VoiceInputStatus) => void;
  onModelProgress: (pct: number | null) => void;
}

export function useBrowserWhisper({
  enabled = true,
  onFinal,
  onInterim,
  onError,
  onStatusChange,
  onModelProgress,
}: UseBrowserWhisperOptions) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const speechMonitorRef = useRef<SpeechMonitor | null>(null);
  const sessionChunksRef = useRef<Blob[]>([]);
  const processedSamplesRef = useRef(0);
  const lastProcessedChunkCountRef = useRef(0);
  const mimeTypeRef = useRef("");
  const consecutiveFailuresRef = useRef(0);
  const pipelineReadyRef = useRef(false);
  const enabledRef = useRef(enabled);
  const queueRef = useRef(createVoiceProcessingQueue());
  const isDrainingRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const [isChunkProcessing, setIsChunkProcessing] = useState(false);
  const [isDraining, setIsDraining] = useState(false);

  const cbRef = useRef({ onFinal, onInterim, onError, onStatusChange, onModelProgress });
  useEffect(() => {
    cbRef.current = { onFinal, onInterim, onError, onStatusChange, onModelProgress };
  });

  useEffect(() => {
    enabledRef.current = enabled;
    if (!enabled) {
      pipelineReadyRef.current = false;
    }
  }, [enabled]);

  const releaseMediaRef = useRef<
    (opts?: { flush?: boolean; fatalError?: string }) => void
  >(() => {});

  const enqueueProcessRef = useRef<(flush?: boolean) => Promise<void>>(null!);

  useEffect(() => {
    const clearBanner = () => {
      cbRef.current.onInterim("");
    };

    const resetSessionState = () => {
      speechMonitorRef.current?.dispose();
      speechMonitorRef.current = null;
      sessionChunksRef.current = [];
      processedSamplesRef.current = 0;
      lastProcessedChunkCountRef.current = 0;
      consecutiveFailuresRef.current = 0;
      setIsChunkProcessing(false);
      setIsDraining(false);
      isDrainingRef.current = false;
      setIsActive(false);
      mediaRecorderRef.current = null;
      streamRef.current = null;
      clearBanner();
    };

    const restoreListeningIfRecording = () => {
      if (
        !isDrainingRef.current &&
        mediaRecorderRef.current?.state === "recording"
      ) {
        cbRef.current.onInterim(VOICE_LISTENING_INTERIM);
      }
    };

    const runProcess = async (flush = false): Promise<void> => {
      if (!enabledRef.current || !pipelineReadyRef.current) return;
      if (sessionChunksRef.current.length === 0) return;

      const chunkCount = sessionChunksRef.current.length;
      if (!flush && chunkCount <= lastProcessedChunkCountRef.current) return;

      lastProcessedChunkCountRef.current = chunkCount;
      setIsChunkProcessing(true);
      if (isDrainingRef.current) {
        cbRef.current.onInterim(VOICE_PROCESSING_INTERIM);
      }

      const chunks = [...sessionChunksRef.current];
      const mimeType = mimeTypeRef.current;
      const priorOffset = processedSamplesRef.current;
      const minSamples = flush ? 1 : WHISPER_MIN_NEW_SAMPLES;

      try {
        const { text, processedSamples } = await transcribeIncrementalSession(
          chunks,
          mimeType,
          priorOffset,
          minSamples,
          flush,
        );
        processedSamplesRef.current = processedSamples;
        consecutiveFailuresRef.current = 0;

        const trimmed = trimSessionChunksIfNeeded(
          sessionChunksRef.current,
          processedSamplesRef.current,
        );
        if (trimmed.chunks.length !== sessionChunksRef.current.length) {
          sessionChunksRef.current = trimmed.chunks;
          processedSamplesRef.current = trimmed.processedSamples;
          lastProcessedChunkCountRef.current = 0;
        }

        if (text) cbRef.current.onFinal(text);

        if (!flush && !isDrainingRef.current) {
          restoreListeningIfRecording();
        }
      } catch (err) {
        if (isSoftDecodeError(err)) {
          console.warn("[useBrowserWhisper] decode skipped:", err);
          if (!flush && !isDrainingRef.current) {
            restoreListeningIfRecording();
          }
        } else {
          console.error("[useBrowserWhisper] chunk failed:", err);
          consecutiveFailuresRef.current += 1;
          if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
            releaseMediaRef.current({
              flush: false,
              fatalError: sanitizeWhisperChunkError(err),
            });
            return;
          }
        }
      } finally {
        setIsChunkProcessing(false);
      }
    };

    enqueueProcessRef.current = (flush = false) =>
      queueRef.current.enqueue(() => runProcess(flush));

    releaseMediaRef.current = (opts = {}) => {
      const { flush = true, fatalError } = opts;
      const recorder = mediaRecorderRef.current;
      const stream = streamRef.current;

      speechMonitorRef.current?.dispose();
      speechMonitorRef.current = null;

      if (flush && !fatalError) {
        isDrainingRef.current = true;
        setIsDraining(true);
        cbRef.current.onInterim(VOICE_PROCESSING_INTERIM);
      }

      const finish = () => {
        stream?.getTracks().forEach((t) => t.stop());
        resetSessionState();
        if (fatalError) {
          cbRef.current.onError(fatalError);
          cbRef.current.onStatusChange("error");
        } else {
          cbRef.current.onStatusChange("idle");
        }
      };

      const drainAndFinish = async () => {
        if (flush && sessionChunksRef.current.length > 0) {
          await enqueueProcessRef.current(true);
        }
        await queueRef.current.awaitIdle();
        finish();
      };

      // Release mic immediately on user stop — queued blobs still drain in memory
      if (flush && !fatalError && stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = () => {
          void drainAndFinish();
        };
        try {
          recorder.stop();
        } catch {
          void drainAndFinish();
        }
        return;
      }

      void drainAndFinish();
    };
  });

  const stop = useCallback(() => {
    releaseMediaRef.current({ flush: true });
  }, []);

  const startAsyncRef = useRef<() => Promise<void>>(null!);

  useEffect(() => {
    startAsyncRef.current = async function startAsync() {
      if (!enabledRef.current) return;

      if (!hasMediaRecorder()) {
        cbRef.current.onError("MediaRecorder is not supported in this browser.");
        cbRef.current.onStatusChange("error");
        return;
      }

      queueRef.current = createVoiceProcessingQueue();
      sessionChunksRef.current = [];
      processedSamplesRef.current = 0;
      lastProcessedChunkCountRef.current = 0;
      consecutiveFailuresRef.current = 0;
      isDrainingRef.current = false;
      setIsDraining(false);

      cbRef.current.onStatusChange("requesting-permission");

      try {
        await loadWhisperPipeline((pct) => {
          cbRef.current.onModelProgress(pct);
          if (pct < 100) cbRef.current.onStatusChange("transcribing");
        });
        pipelineReadyRef.current = true;
        cbRef.current.onModelProgress(null);
      } catch (err) {
        pipelineReadyRef.current = false;
        resetWhisperPipeline();
        cbRef.current.onModelProgress(null);
        cbRef.current.onError(sanitizeWhisperLoadError(err));
        cbRef.current.onStatusChange("error");
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        cbRef.current.onError("Microphone permission denied.");
        cbRef.current.onStatusChange("error");
        return;
      }

      streamRef.current = stream;
      speechMonitorRef.current = createSpeechMonitor(stream);

      const mimeType = getPreferredRecorderMimeType();
      mimeTypeRef.current = mimeType;
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      if (recorder.mimeType) {
        mimeTypeRef.current = recorder.mimeType;
      }

      recorder.ondataavailable = (e) => {
        if (!e.data || e.data.size === 0) return;

        const hadSpeech = speechMonitorRef.current?.hadSpeechInInterval() ?? false;
        const merged = mergeRecorderChunks(
          [...sessionChunksRef.current, e.data],
          mimeTypeRef.current,
        );
        const blobLargeEnough = merged.size >= VOICE_MIN_MERGED_BYTES;

        sessionChunksRef.current.push(e.data);

        if (!hadSpeech && !blobLargeEnough && !isDrainingRef.current) {
          return;
        }

        void enqueueProcessRef.current(false);
      };

      recorder.onstart = () => {
        setIsActive(true);
        cbRef.current.onInterim(VOICE_LISTENING_INTERIM);
        cbRef.current.onStatusChange("recording");
      };
      recorder.onerror = () => {
        releaseMediaRef.current({
          flush: false,
          fatalError: "Recording error occurred.",
        });
      };

      recorder.start(WHISPER_CHUNK_INTERVAL_MS);
    };
  });

  const start = useCallback(() => {
    if (!enabled) return;
    void startAsyncRef.current();
  }, [enabled]);

  const isVoiceProcessing = isChunkProcessing || isDraining;

  return { start, stop, isActive, isChunkProcessing, isDraining, isVoiceProcessing };
}
