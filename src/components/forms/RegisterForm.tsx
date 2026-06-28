"use client";

/**
 * RegisterForm — email/password sign-up with optional Google OAuth.
 * Stagger indices 0–1 live in register/page.tsx; form rows use explicit authStaggerRowProps.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { BookPlus } from "lucide-react";
import { appToast } from "@/lib/app-toast";
import { notifyJournalCacheUpdated } from "@/lib/journal-cache-notify";
import { authStaggerRowProps } from "@/lib/auth-stagger";
import {
  inputClassName,
  inputStyle,
  primaryCtaClassName,
  primaryCtaStyle,
} from "@/lib/auth-form-styles";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { AuthOAuthSection } from "@/components/auth/AuthOAuthSection";
import { RippleButton } from "@/components/ui/ripple-button";

/** Stagger row indices (page headers use 0–1) */
const REGISTER_STAGGER = {
  nameLabel: 2,
  nameInput: 3,
  emailLabel: 4,
  emailInput: 5,
  passwordLabel: 6,
  passwordInput: 7,
  error: 8,
  cta: 9,
  or: 10,
  google: 11,
} as const;

type RegisterFormProps = {
  googleEnabled?: boolean;
};

export function RegisterForm({ googleEnabled = false }: RegisterFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", displayName: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message ?? "Registration failed");
        return;
      }
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      const name = form.displayName.trim() || form.email.split("@")[0] || "Writer";
      appToast.auth.registered(name);
      await notifyJournalCacheUpdated(queryClient);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <AuthFormField
        label="Your Name"
        labelIndex={REGISTER_STAGGER.nameLabel}
        inputIndex={REGISTER_STAGGER.nameInput}
      >
        <input
          type="text"
          required
          className={inputClassName}
          value={form.displayName}
          onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          placeholder="Jane Doe"
          style={inputStyle}
        />
      </AuthFormField>
      <AuthFormField
        label="Email"
        labelIndex={REGISTER_STAGGER.emailLabel}
        inputIndex={REGISTER_STAGGER.emailInput}
      >
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
        labelIndex={REGISTER_STAGGER.passwordLabel}
        inputIndex={REGISTER_STAGGER.passwordInput}
      >
        <input
          type="password"
          required
          minLength={8}
          className={inputClassName}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="At least 8 characters"
          style={inputStyle}
        />
      </AuthFormField>
      {error && (
        <p
          {...authStaggerRowProps(REGISTER_STAGGER.error, {
            style: {
              fontFamily: "'Lora',serif",
              fontSize: "12px",
              color: "#c0392b",
              marginBottom: "12px",
            },
          })}
        >
          {error}
        </p>
      )}
      <RippleButton
        {...authStaggerRowProps(REGISTER_STAGGER.cta, {
          className: `w-full ${primaryCtaClassName}`,
          style: {
            ...primaryCtaStyle,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          },
        })}
        type="submit"
        disabled={loading}
        icon={BookPlus}
        shine
        shineRadius={4}
      >
        {loading ? "Creating your journal…" : "Begin My Story"}
      </RippleButton>

      <AuthOAuthSection
        googleEnabled={!!googleEnabled}
        disabled={loading}
        variant="register"
        orStaggerIndex={REGISTER_STAGGER.or}
        googleStaggerIndex={REGISTER_STAGGER.google}
      />
    </form>
  );
}
