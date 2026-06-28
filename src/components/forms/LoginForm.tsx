"use client";

/**
 * LoginForm — credential sign-in with:
 *  • Demo picker (showcase): portaled menu for test@user.com — on by default;
 *    set SHOW_DEMO_LOGIN=false on server to hide in production.
 *  • Full validation feedback inline (no page reload).
 *  • Clears TanStack Query cache before entering dashboard so stale book data
 *    from a previous session never leaks through.
 *
 * Stagger indices 0–1 live in login/page.tsx; form rows use explicit authStaggerRowProps.
 */
import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, ChevronDown } from "lucide-react";
import { appToast } from "@/lib/app-toast";
import { notifyJournalCacheUpdated } from "@/lib/journal-cache-notify";
import { authStaggerRowProps } from "@/lib/auth-stagger";
import {
  authControlClassName,
  authControlStyle,
  fieldLabelStyle,
  inputClassName,
  inputStyle,
  primaryCtaClassName,
  primaryCtaStyle,
} from "@/lib/auth-form-styles";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { AuthOAuthSection } from "@/components/auth/AuthOAuthSection";
import { DemoAccountMenuRow } from "@/components/auth/DemoAccountMenuRow";
import { RippleButton } from "@/components/ui/ripple-button";
import { AvatarRing } from "@/components/ui/AvatarRing";
import { TEST_ACCOUNT_EMAIL, TEST_ACCOUNT_PASSWORD } from "@/constants/auth";

const TEST_EMAIL = TEST_ACCOUNT_EMAIL;
const TEST_PASS = TEST_ACCOUNT_PASSWORD;

/** Stagger row indices when demo picker is visible (page headers use 0–1) */
const LOGIN_STAGGER_WITH_DEMO = {
  demoLabel: 2,
  demoButton: 3,
  emailLabel: 4,
  emailInput: 5,
  passwordLabel: 6,
  passwordInput: 7,
  error: 8,
  cta: 9,
  or: 10,
  google: 11,
} as const;

/** Stagger row indices when demo picker is hidden */
const LOGIN_STAGGER_NO_DEMO = {
  emailLabel: 2,
  emailInput: 3,
  passwordLabel: 4,
  passwordInput: 5,
  error: 6,
  cta: 7,
  or: 8,
  google: 9,
} as const;

type LoginFormProps = {
  googleEnabled?: boolean;
  demoLoginEnabled?: boolean;
};

export function LoginForm({ googleEnabled = false, demoLoginEnabled = false }: LoginFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showTestMenu, setShowTestMenu] = useState(false);
  const [menuBox, setMenuBox] = useState<{ top: number; left: number; width: number } | null>(null);
  const demoTriggerRef = useRef<HTMLButtonElement>(null);

  const stagger = demoLoginEnabled ? LOGIN_STAGGER_WITH_DEMO : LOGIN_STAGGER_NO_DEMO;

  const hasCredentials = Boolean(form.email.trim() || form.password.trim());

  const fillTestCredentials = () => {
    setForm({ email: TEST_EMAIL, password: TEST_PASS });
    setShowTestMenu(false);
    setMenuBox(null);
    setError("");
  };

  const clearCredentialFields = () => {
    if (!hasCredentials) return;
    setForm({ email: "", password: "" });
    setShowTestMenu(false);
    setMenuBox(null);
    setError("");
  };

  useLayoutEffect(() => {
    if (!showTestMenu || !demoTriggerRef.current) {
      setMenuBox(null);
      return;
    }
    const el = demoTriggerRef.current;
    const sync = () => {
      const r = el.getBoundingClientRect();
      setMenuBox({ top: r.bottom + 6, left: r.left, width: r.width });
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [showTestMenu]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password");
      } else {
        const displayName = form.email.split("@")[0] || "Reader";
        appToast.auth.welcomeBack(displayName);
        await notifyJournalCacheUpdated(queryClient);
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {demoLoginEnabled && (
        <>
          <p
            {...authStaggerRowProps(LOGIN_STAGGER_WITH_DEMO.demoLabel, {
              style: { ...fieldLabelStyle, margin: "0 0 8px" },
            })}
          >
            Test Account To Login With
          </p>
          <div
            {...authStaggerRowProps(LOGIN_STAGGER_WITH_DEMO.demoButton, {
              className: "auth-field-compact",
              style: { position: "relative", zIndex: 40, marginBottom: "12px" },
            })}
          >
            <RippleButton
              ref={demoTriggerRef}
              type="button"
              className={`w-full ${authControlClassName}`}
              onClick={() => setShowTestMenu((v) => !v)}
              style={authControlStyle}
            >
              <span>Select Demo Account</span>
              <ChevronDown size={14} aria-hidden className="shrink-0 opacity-60" />
            </RippleButton>
            {showTestMenu &&
              menuBox &&
              typeof document !== "undefined" &&
              createPortal(
                <div
                  role="listbox"
                  aria-label="Demo account actions"
                  className="leather-glass-panel overflow-hidden"
                  style={{
                    position: "fixed",
                    top: menuBox.top,
                    left: menuBox.left,
                    width: menuBox.width,
                    zIndex: 9999,
                    borderRadius: "4px",
                    boxSizing: "border-box",
                  }}
                >
                  <DemoAccountMenuRow onClick={fillTestCredentials} withBorderBottom>
                    <AvatarRing seed={TEST_EMAIL} size={28} unoptimized />
                    <span className="demo-menu-row__inline" style={{ fontSize: "12px" }}>
                      <strong>Test User</strong>
                      <span className="demo-menu-row__sep" aria-hidden>
                        ·
                      </span>
                      <span style={{ opacity: 0.65, fontSize: "11px" }}>{TEST_EMAIL}</span>
                    </span>
                  </DemoAccountMenuRow>
                  <DemoAccountMenuRow
                    disabled={!hasCredentials}
                    onClick={clearCredentialFields}
                    className="uppercase tracking-wide"
                    style={{ fontSize: "11px", letterSpacing: "1px", color: "rgba(100,55,20,.55)" }}
                  >
                    Clear Section
                  </DemoAccountMenuRow>
                </div>,
                document.body,
              )}
          </div>
        </>
      )}

      <AuthFormField label="Email" labelIndex={stagger.emailLabel} inputIndex={stagger.emailInput}>
        <input
          type="email"
          required
          className={inputClassName}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="you@example.com"
          style={inputStyle}
        />
      </AuthFormField>
      <AuthFormField
        label="Password"
        labelIndex={stagger.passwordLabel}
        inputIndex={stagger.passwordInput}
      >
        <input
          type="password"
          required
          className={inputClassName}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="••••••••"
          style={inputStyle}
        />
      </AuthFormField>

      {error && (
        <p
          {...authStaggerRowProps(stagger.error, {
            style: {
              fontFamily: "'Lora',serif",
              fontSize: "12px",
              color: "#c0392b",
              margin: "0 0 12px",
            },
          })}
        >
          {error}
        </p>
      )}

      <RippleButton
        {...authStaggerRowProps(stagger.cta, {
          className: `w-full ${primaryCtaClassName}`,
          style: {
            ...primaryCtaStyle,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          },
        })}
        type="submit"
        disabled={loading}
        icon={BookOpen}
        shine
        shineRadius={4}
      >
        {loading ? "Opening…" : "Open My Journal"}
      </RippleButton>

      <AuthOAuthSection
        googleEnabled={!!googleEnabled}
        disabled={loading}
        variant="login"
        orStaggerIndex={stagger.or}
        googleStaggerIndex={stagger.google}
      />
    </form>
  );
}
