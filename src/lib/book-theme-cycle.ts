/**
 * Cycle book page themes in BOOK_THEMES order — used by ⌘K palette quick action.
 */
import { BOOK_THEMES, type BookThemeId } from "@/constants/themes";

/** Return the next theme id after `current` (wraps to first). */
export function getNextBookThemeId(current: string): BookThemeId {
  const ids = BOOK_THEMES.map((t) => t.id);
  const idx = ids.indexOf(current as BookThemeId);
  const next = idx < 0 ? 0 : (idx + 1) % ids.length;
  return ids[next]!;
}

/** Human label for a theme id (falls back to id string). */
export function getBookThemeLabel(themeId: string): string {
  return BOOK_THEMES.find((t) => t.id === themeId)?.label ?? themeId;
}
