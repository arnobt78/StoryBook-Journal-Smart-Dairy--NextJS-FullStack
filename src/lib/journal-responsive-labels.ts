/**
 * Wave 35 — journal page footer labels with mobile icon-only variants.
 *
 * Read footer uses short "Page" label; write footer uses dual-span CSS
 * (`.auth-responsive-label--full/short`) for icon-only mobile actions.
 */

/** Read-mode delete action — shorter than "Remove page" for inline mobile row */
export const READ_PAGE_ACTION_LABEL = "Page";

/** Read-mode delete — full label on md+ (mobile uses Trash2 icon via dual-span CSS) */
export const READ_REMOVE_LABEL_FULL = "Remove page";

/** Write-mode AI assist — full label on md+ */
export const WRITE_AI_LABEL_FULL = "AI Assist";

/** Write-mode cancel — full label on md+ */
export const WRITE_CANCEL_LABEL_FULL = "Cancel";

/** Write-mode save — full label on md+ */
export const WRITE_SAVE_LABEL_FULL = "Save";

/** Write-mode save while persisting — full label on md+ */
export const WRITE_SAVING_LABEL_FULL = "Saving…";

/** Bottom nav — new page action (label matches Edit/Remove journal trio) */
export const NAV_NEW_JOURNAL_LABEL = "New journal";

/** Bottom nav — mobile tooltip for new journal pill */
export const NAV_NEW_JOURNAL_TOOLTIP = "New journal";
