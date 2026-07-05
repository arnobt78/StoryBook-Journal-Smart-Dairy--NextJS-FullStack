/**
 * Demo account selection helpers — login picker trigger reads filled credential state.
 */
import {
  TEST_ACCOUNT_EMAIL,
  TEST_ACCOUNT_PASSWORD,
} from "@/constants/auth";

/** True when both fields match the seeded demo account (strict — partial manual entry excluded). */
export function isDemoAccountSelected(email: string, password: string): boolean {
  return email === TEST_ACCOUNT_EMAIL && password === TEST_ACCOUNT_PASSWORD;
}
