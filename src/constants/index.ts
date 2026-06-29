/**
 * Product constants — mood/weather pickers, book cover palette, autosave timing.
 * Re-export auth keys from ./auth for a single import path in UI code.
 */
export const MOODS = [
  "😊", "😔", "😤", "✨", "☕", "🌙", "🔥", "💭",
  "🌿", "❤️", "😌", "🥹", "😴", "🤔", "🎶", "🎉",
  "😅", "🤗", "😶", "💪",
];

export const WEATHERS = [
  "☀️", "🌤️", "⛅", "🌧️", "⛈️", "❄️",
  "🌫️", "🌈", "🌙", "🌊", "🌬️", "🌡️",
];

export const COVER_COLORS = [
  { label: "Chestnut",    value: "#8b4513" },
  { label: "Midnight",    value: "#1a1a2e" },
  { label: "Forest",      value: "#2d5016" },
  { label: "Burgundy",    value: "#6b1a2e" },
  { label: "Navy",        value: "#1a3a5c" },
  { label: "Plum",        value: "#4a1a5c" },
  { label: "Terracotta",  value: "#8b3a2a" },
  { label: "Sage",        value: "#3d5a47" },
];

/** Debounce before PATCH /api/entries — balances UX vs server load */
export const AUTOSAVE_DELAY = 2000;

export const WORD_COUNT_DEBOUNCE = 300;

export {
  AUTH_STATE_KEY,
  OAUTH_PENDING_KEY,
  OAUTH_CALLBACK_URL,
  TEST_ACCOUNT_EMAIL,
  TEST_ACCOUNT_PASSWORD,
} from "./auth";
