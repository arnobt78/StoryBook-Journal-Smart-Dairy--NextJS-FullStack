# Cycle C4 — UI Polish + Entry Tags (active)

**Status:** Stage 4 Verification — static PASS

| Field | Value |
|-------|-------|
| CR | CR-0005 |
| REQs | REQ-0029, REQ-0030, REQ-0031 |
| Commits | `91bea2a` … `fe8f261` |
| ARTs | ART-0068–0086 |

## Deliverables

- **REQ-0029:** UI polish wave 1 (cover, typewriter, footers, auth heights)
- **REQ-0030:** Leather glass wave 2 (tokens, AvatarRing, OAuth paper btn)
- **REQ-0031:** Tags persist/display/edit (mergePendingTag, TagsEditor)

## Key decisions

DEC-0021–0024 — DB tag audit, mergePendingTag, flex clip fix, editable pills  
DEC-0032–0037 — Journal dialog, Lucide icons, BookSpineMark, glow unclip (Waves 17–17c)

## Wave 15 (2026-06-29)

- **REQ-0029/0030:** Dashboard nav/shelf/stat glows; Dancing Script; typewriter greeting; responsive spines

## Wave 16 (2026-06-29)

- **REQ-0029/0030:** New journal plus visibility; shelf hover spotlight; stat text-only glow

## Wave 17 (2026-06-29)

- **REQ-0029/0030:** Radix `dialog.tsx` journal paper modal; Lucide `cover-icons.ts`; `BookThemePreview`; `ConfirmDialog` shared shell

## Wave 17b (2026-06-29)

- **REQ-0029/0030:** `BookSpineMark`; true 90vw×90vh; `.journal-picker-pad`; auth-style input glow; +10 icons

## Wave 17c (2026-06-29)

- **REQ-0029/0030:** Spine `writing-mode` inline axis; single dialog scroll; footer phantom line fix; `.dashboard-spine-slot-inner` hover glow

## Verification

31 Vitest · lint · typecheck · build PASS · TC-0031–0040 static PASS
