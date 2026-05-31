/**
 * "or" divider with horizontal rules — matches StoryBook auth page typography.
 */
type AuthOrSeparatorProps = {
  label?: string;
  /** Tighter spacing when placed below the primary auth CTA */
  compact?: boolean;
};

export function AuthOrSeparator({ label = "or", compact = false }: AuthOrSeparatorProps) {
  return (
    <div
      role="separator"
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: compact ? "12px 0 10px" : "18px 0 16px",
      }}
    >
      <span
        style={{
          flex: 1,
          height: 1,
          background: "rgba(120,70,20,.18)",
        }}
      />
      <span
        style={{
          fontFamily: "'Lora',serif",
          fontSize: "10px",
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "rgba(100,55,20,.45)",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          flex: 1,
          height: 1,
          background: "rgba(120,70,20,.18)",
        }}
      />
    </div>
  );
}
