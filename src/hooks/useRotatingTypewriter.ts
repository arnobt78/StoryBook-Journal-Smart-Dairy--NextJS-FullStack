"use client";

/**
 * useRotatingTypewriter — cycles through an array of phrases with a
 * type → hold → erase → [next phrase] state machine.
 *
 * State machine transitions:
 *   typing   — append one char every typeSpeedMs; on complete → holding
 *   holding  — idle for holdMs; on timeout → erasing
 *   erasing  — remove one char every eraseSpeedMs; on empty → gap → typing (next phrase)
 *
 * Respects `prefers-reduced-motion`: returns texts[0] fully shown, phase="holding".
 */
import { useEffect, useReducer } from "react";

export type RotatingPhase = "typing" | "holding" | "erasing";

export interface RotatingTypewriterState {
  display: string;
  phraseIndex: number;
  phase: RotatingPhase;
}

interface Options {
  /** ms per character while typing (default 55) */
  typeSpeedMs?: number;
  /** ms per character while erasing (default 30) */
  eraseSpeedMs?: number;
  /** ms to pause after a phrase is fully typed (default 1800) */
  holdMs?: number;
  /** ms gap before starting next phrase (default 220) */
  gapMs?: number;
  /** disable animations (returns texts[0] static) */
  enabled?: boolean;
}

type Action =
  | { type: "TYPE_CHAR"; target: string }
  | { type: "START_HOLD" }
  | { type: "ERASE_CHAR" }
  | { type: "NEXT_PHRASE"; texts: string[] };

interface State {
  phraseIndex: number;
  displayLength: number;
  phase: RotatingPhase;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "TYPE_CHAR":
      return {
        ...state,
        displayLength: Math.min(
          state.displayLength + 1,
          action.target.length,
        ),
      };
    case "START_HOLD":
      return { ...state, phase: "holding" };
    case "ERASE_CHAR":
      return {
        ...state,
        phase: "erasing",
        displayLength: Math.max(0, state.displayLength - 1),
      };
    case "NEXT_PHRASE":
      return {
        phraseIndex: (state.phraseIndex + 1) % action.texts.length,
        displayLength: 0,
        phase: "typing",
      };
    default:
      return state;
  }
}

export function useRotatingTypewriter(
  texts: string[],
  options?: Options,
): RotatingTypewriterState {
  const typeSpeedMs = options?.typeSpeedMs ?? 55;
  const eraseSpeedMs = options?.eraseSpeedMs ?? 30;
  const holdMs = options?.holdMs ?? 1800;
  const gapMs = options?.gapMs ?? 220;
  const enabled = options?.enabled ?? true;

  const [state, dispatch] = useReducer(reducer, {
    phraseIndex: 0,
    displayLength: 0,
    phase: "typing" as RotatingPhase,
  });

  useEffect(() => {
    if (!enabled || texts.length === 0) return;

    /* Honour reduced-motion preference: show full first phrase statically. */
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const currentText = texts[state.phraseIndex] ?? "";

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    if (state.phase === "typing") {
      if (state.displayLength < currentText.length) {
        /* Type next character */
        timer = setTimeout(() => {
          if (!cancelled) dispatch({ type: "TYPE_CHAR", target: currentText });
        }, typeSpeedMs);
      } else {
        /* Phrase complete — enter hold phase */
        timer = setTimeout(() => {
          if (!cancelled) dispatch({ type: "START_HOLD" });
        }, typeSpeedMs);
      }
    } else if (state.phase === "holding") {
      /* Wait, then begin erasing */
      timer = setTimeout(() => {
        if (!cancelled) dispatch({ type: "ERASE_CHAR" });
      }, holdMs);
    } else {
      /* phase === "erasing" */
      if (state.displayLength > 0) {
        /* Erase next character */
        timer = setTimeout(() => {
          if (!cancelled) dispatch({ type: "ERASE_CHAR" });
        }, eraseSpeedMs);
      } else {
        /* Fully erased — brief gap then advance to next phrase */
        timer = setTimeout(() => {
          if (!cancelled) dispatch({ type: "NEXT_PHRASE", texts });
        }, gapMs);
      }
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    state.phraseIndex,
    state.displayLength,
    state.phase,
    texts,
    typeSpeedMs,
    eraseSpeedMs,
    holdMs,
    gapMs,
    enabled,
  ]);

  /* Reduced-motion / disabled: return first phrase fully shown */
  if (!enabled || texts.length === 0) {
    return { display: texts[0] ?? "", phraseIndex: 0, phase: "holding" };
  }

  const mq =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
  if (mq?.matches) {
    return { display: texts[0] ?? "", phraseIndex: 0, phase: "holding" };
  }

  const currentPhrase = texts[state.phraseIndex] ?? "";
  return {
    display: currentPhrase.slice(0, state.displayLength),
    phraseIndex: state.phraseIndex,
    phase: state.phase,
  };
}
