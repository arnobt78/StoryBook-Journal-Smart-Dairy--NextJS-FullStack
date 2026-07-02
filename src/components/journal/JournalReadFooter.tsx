"use client";

/**
 * Read-mode footer — mood, weather, word count, remove page, edit.
 * Responsive flex-wrap; Lucide icons on destructive and edit actions.
 */
import { AlignLeft, PencilLine, Trash2 } from "lucide-react";
import type { JournalEntry } from "@/types";
import { JOURNAL_INK_BODY } from "@/lib/journal-page-styles";
import { JOURNAL_INTERACTION_CLASS as C } from "@/lib/journal-interaction-styles";
import { RippleButton } from "@/components/ui/ripple-button";

type JournalReadFooterProps = {
  entry: JournalEntry;
  onStartWriting: () => void;
  onDeleteEntry?: () => void;
  canDeleteEntry?: boolean;
};

export function JournalReadFooter({
  entry,
  onStartWriting,
  onDeleteEntry,
  canDeleteEntry = true,
}: JournalReadFooterProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "8px",
        paddingTop: "10px",
        marginTop: "8px",
        borderTop: "1px solid rgba(120,70,20,.1)",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: "15px", flexShrink: 0 }}>{entry.mood}</span>
      <span style={{ fontSize: "15px", flexShrink: 0 }}>{entry.weather}</span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontFamily: "'Lora',serif",
          fontSize: "10px",
          color: JOURNAL_INK_BODY,
          marginRight: "auto",
          flexShrink: 0,
        }}
      >
        <AlignLeft size={13} strokeWidth={2} aria-hidden />
        {entry.wordCount} words
      </span>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "6px",
          marginLeft: "auto",
        }}
      >
        {onDeleteEntry && canDeleteEntry && (
          <RippleButton
            type="button"
            icon={Trash2}
            iconSize={13}
            onClick={onDeleteEntry}
            className={`${C.paperAction} ${C.paperActionDestructive}`}
            style={{ fontSize: "9px", padding: "4px 10px" }}
          >
            Remove page
          </RippleButton>
        )}
        <RippleButton
          type="button"
          icon={PencilLine}
          iconSize={13}
          onClick={onStartWriting}
          className={C.paperAction}
          style={{ fontSize: "9.5px", padding: "4px 11px" }}
        >
          Edit
        </RippleButton>
      </div>
    </div>
  );
}
