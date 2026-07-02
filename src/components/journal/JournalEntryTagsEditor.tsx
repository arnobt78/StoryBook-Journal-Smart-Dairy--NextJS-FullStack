"use client";

/**
 * Editable tag pills — click × to remove; pairs with "+ tag" input in write mode.
 */
import { X } from "lucide-react";
import { JOURNAL_INK_BODY, JOURNAL_INK_TAG, JOURNAL_INK_TAG_BORDER } from "@/lib/journal-page-styles";
import { RippleButton } from "@/components/ui/ripple-button";

type JournalEntryTagsEditorProps = {
  tags: string[];
  onRemove: (tag: string) => void;
};

export function JournalEntryTagsEditor({ tags, onRemove }: JournalEntryTagsEditorProps) {
  if (!tags.length) return null;

  return (
    <>
      {tags.map((t) => (
        <span
          key={t}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontFamily: "'Lora',serif",
            fontSize: "10px",
            color: JOURNAL_INK_TAG,
            background: "rgba(120,70,20,.09)",
            padding: "2px 6px 2px 8px",
            borderRadius: "20px",
            border: `1px solid ${JOURNAL_INK_TAG_BORDER}`,
            flexShrink: 0,
          }}
        >
          #{t}
          <RippleButton
            type="button"
            aria-label={`Remove tag ${t}`}
            onClick={() => onRemove(t)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              margin: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: JOURNAL_INK_BODY,
              lineHeight: 1,
              minWidth: 14,
              minHeight: 14,
            }}
          >
            <X size={11} strokeWidth={2.5} aria-hidden />
          </RippleButton>
        </span>
      ))}
    </>
  );
}
