/**
 * Demo login feature flag — env walkthrough
 * -----------------------------------------
 * Env: SHOW_DEMO_LOGIN (optional)
 *   - unset / any value except "false" → demo picker visible
 *   - "false" (case-insensitive)       → hide demo account shortcuts
 *
 * Why default-on: lets reviewers and Vercel previews try the app without
 * creating accounts. Production teams hide it with SHOW_DEMO_LOGIN=false.
 *
 * Server-only — never import in Client Components (process.env not exposed).
 */
export function isDemoLoginEnabled(): boolean {
  const flag = process.env.SHOW_DEMO_LOGIN?.trim().toLowerCase();
  if (flag === "false") return false;
  return true;
}
