"use client";

/**
 * Tag pills — shared between read and write modes on the right journal page.
 */
type JournalEntryTagsProps = {
  tags: string[];
  className?: string;
};

export function JournalEntryTags({ tags, className }: JournalEntryTagsProps) {
  if (!tags.length) return null;

  return (
    <>
      {tags.map((t) => (
        <span
          key={t}
          className={className}
          style={{
            fontFamily: "'Lora',serif",
            fontSize: "10px",
            color: "rgba(110,60,22,.6)",
            background: "rgba(120,70,20,.09)",
            padding: "2px 8px",
            borderRadius: "20px",
            border: "1px solid rgba(120,70,20,.14)",
            flexShrink: 0,
          }}
        >
          #{t}
        </span>
      ))}
    </>
  );
}
