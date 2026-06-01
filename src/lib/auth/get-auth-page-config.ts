/**
 * Auth page configuration — SSR walkthrough
 * -----------------------------------------
 * Login and register are force-dynamic Server Components. They cannot read
 * process.env at build time, so feature flags must be resolved on each request.
 *
 * This module is the single aggregator for auth UI flags:
 *   - googleEnabled  → from isGoogleOAuthEnabled() (both Google env vars set)
 *   - demoLoginEnabled → from isDemoLoginEnabled() (SHOW_DEMO_LOGIN, default on)
 *
 * Consumers: src/app/(auth)/login/page.tsx, register/page.tsx
 * Pattern: call getAuthPageConfig() in the page server component, pass props to
 * client forms (AuthOAuthSection, demo picker) so UI matches runtime env.
 */
import { isDemoLoginEnabled } from "@/lib/auth/is-demo-login-enabled";
import { isGoogleOAuthEnabled } from "@/lib/auth/is-google-enabled";

export type AuthPageConfig = {
  googleEnabled: boolean;
  /** Demo picker on by default; set SHOW_DEMO_LOGIN=false to hide */
  demoLoginEnabled: boolean;
};

export function getAuthPageConfig(): AuthPageConfig {
  return {
    googleEnabled: isGoogleOAuthEnabled(),
    demoLoginEnabled: isDemoLoginEnabled(),
  };
}
