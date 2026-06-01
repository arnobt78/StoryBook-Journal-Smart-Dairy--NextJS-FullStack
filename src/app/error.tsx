"use client";

/**
 * @file error.tsx
 * @route Root error boundary — catches unhandled errors in this segment and below.
 *
 * **SSR vs client:** Must be a Client Component (`"use client"`). Next.js passes
 * `error` and `reset` props so the user can retry without a full page reload.
 *
 * **When it runs:** Runtime/render failures in pages or layouts that aren't caught
 * locally. Does not catch 404 (`not-found.tsx`) or auth redirects.
 */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 50% 30%, #2e160a 0%, #1a0c05 55%, #0e0603 100%)",
    }}>
      <div style={{ fontSize: "40px", marginBottom: "16px" }}>✒</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "24px", color: "rgba(255,205,130,.7)", margin: "0 0 8px" }}>
        Something went wrong
      </h2>
      <p style={{ fontFamily: "'Lora',serif", fontSize: "12px", color: "rgba(255,170,70,.3)", margin: "0 0 24px" }}>
        {error.message}
      </p>
      <button onClick={reset}
        // `reset()` re-renders the failed segment — softer recovery than location.reload()
        style={{ fontFamily: "'Lora',serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", background: "rgba(90,40,10,.82)", color: "rgba(255,215,150,.92)", border: "none", padding: "10px 22px", borderRadius: "3px", cursor: "pointer" }}>
        Try again
      </button>
    </div>
  );
}
