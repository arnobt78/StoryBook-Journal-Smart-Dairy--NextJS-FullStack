# Decision Log (append-only)

<!-- Principle #9 — never overwrite; cycle-tag entries -->

| Timestamp | ID | Cycle | Agent | Decision | Rationale | Linked REQ |
|-----------|-----|-------|-------|----------|-----------|------------|
| 2026-03-16T00:00:00Z | DEC-0001 | C1 | bootstrap-agent | Initialize `.agile-v/` C1 living AQMS | User requested Agile V Infinity Loop bootstrap with REQ traceability | REQ-0024 |
| 2026-03-16T00:00:01Z | DEC-0002 | C1 | bootstrap-agent | Tag REQs 0001–0012 as `implemented` retroactive baseline | Codebase already contains auth, shelf, spread, nav, query invalidation | REQ-0001–0012 |
| 2026-03-16T00:00:03Z | DEC-0004 | C1 | bootstrap-agent | Use TanStack `journalSubtree()` as standard CRUD invalidation | Matches src/lib/query-keys.ts; POLICY.yaml enforces | REQ-0007 |
| 2026-03-16T00:00:05Z | DEC-0006 | C1 | bootstrap-agent | Gitignore Hetzner migration guide | Ops doc stays local only | REQ-0026 |
| 2026-03-16T12:00:00Z | DEC-0007 | C1 | logic-gatekeeper | Stage 2 PASS with 4 FLAGS | GATE-0001 approved blueprint | REQ-0024 |
| 2026-03-16T12:00:01Z | DEC-0008 | C1 | red-team-verifier | Stage 4 static PASS; e2e NOT RUN | REQ-0021 blocks Gate 2 | REQ-0021 |
| 2026-06-01T12:00:00Z | DEC-0009 | C1 | bootstrap-agent | C1 re-baseline after PostgreSQL + fresh GitHub | Prisma postgresql; remote DB; user deleted old repo for clean history | REQ-0025, REQ-0026 |
| 2026-06-01T12:00:01Z | DEC-0010 | C1 | bootstrap-agent | Vercel-native deploy; remove app Dockerfile | No Docker app image; docker-compose Postgres-only optional | REQ-0020, REQ-0027 |
| 2026-06-01T12:00:02Z | DEC-0011 | C1 | bootstrap-agent | Add REQ-0025–0027; amend GATE-0003 | Infrastructure traceability for Gate 2 readiness | REQ-0025–0027 |
| 2026-06-01T12:00:03Z | DEC-0012 | C1 | bootstrap-agent | Demo credentials flagged for prod disable | test@user.com in UI acceptable dev-only; CR before Vercel prod | REQ-0009, RISK-0006 |
| 2026-06-01T18:00:00Z | DEC-0013 | C1 | agile-v-bootstrap | C1 r2 Infinity Loop re-baseline | Align AQMS with commits 22fa6ef+72bb670; activate Cursor rule | REQ-0024 |
| 2026-06-01T18:00:01Z | DEC-0014 | C1 | agile-v-bootstrap | REQ-0015 promoted implemented via CR-0002 | Offline MVP complete: IndexedDB, queue, optimistic cache | REQ-0015 |
| 2026-06-01T18:00:02Z | DEC-0015 | C1 | agile-v-bootstrap | REQ-0028 registered (guardrails+SafeImage) | Security headers, robots, slug PATCH, force-dynamic | REQ-0028 |
| 2026-06-01T18:00:03Z | DEC-0016 | C1 | red-team-verifier | Static verify PASS +5 TC (0017,0028–0030) | Stage 3 synthesis complete; Gate 2 still blocked on e2e | REQ-0021 |
| 2026-06-01T20:00:00Z | DEC-0017 | C3 | build-agent-js | Single invalidation via journal-cache-notify.ts | Prevents scattered journalSubtree invalidates | REQ-0007 |
| 2026-06-01T22:00:00Z | DEC-0018 | C4 | ux-spec-author | Leather glass amber variant not sky-blue | Maps UI_STYLING_GUIDE to journal palette | REQ-0030 |
| 2026-06-01T22:00:01Z | DEC-0019 | C4 | build-agent-js | RippleButton skips default borderRadius unless shine | Preserves rounded-full nav avatar | REQ-0030 |
| 2026-06-01T22:00:02Z | DEC-0020 | C4 | build-agent-js | Auth OAuth uses buttonOutlinePaper not landing outline | Dark text on cream paper readability | REQ-0030 |
| 2026-06-07T00:30:00Z | DEC-0021 | C4 | red-team-verifier | DB audit: Midnight Thoughts tags `[]` while mood saved | Root cause pending-tag input not in PATCH payload | REQ-0031 |
| 2026-06-07T00:35:00Z | DEC-0022 | C4 | build-agent-js | mergePendingTag on blur/save before PATCH | Fixes tag persistence without requiring Enter | REQ-0031 |
| 2026-06-07T00:40:00Z | DEC-0023 | C4 | build-agent-js | Read body minHeight:0 — tags clipped on long entries | Flex overflow fix separate from DB issue | REQ-0031 |
| 2026-06-07T00:42:00Z | DEC-0024 | C4 | build-agent-js | JournalEntryTagsEditor with × remove in write mode | Tags editable like mood/weather pickers | REQ-0031 |
| 2026-06-07T00:45:00Z | DEC-0025 | C4 | agile-v-bootstrap | C4 AQMS re-baseline REQ-0029–0031 | Full traceability for UI+tags work; cursor rule alwaysApply | REQ-0024 |
| 2026-06-28T12:00:00Z | DEC-0026 | C4 | agile-v-core | Session activation — resume C4 Stage 4 from STATE | No pending CHECKPOINTS; 16 Vitest + lint + typecheck PASS; PLAYBOOK.md added | REQ-0024 |
| 2026-06-28T12:30:00Z | DEC-0027 | C4 | build-agent-js | Self-host fonts via public/fonts/ + @font-face instead of Google @import | Eliminates FOUT; offline-capable; 15 WOFF2 files (Playfair, Lora, IM Fell, Dancing Script) | REQ-0005 |
| 2026-06-28T12:30:01Z | DEC-0028 | C4 | build-agent-js | Landing cover: Dancing Script for "Journal", 📖 ornament, subtitle, spotlight + CTA splash glow | More interesting signature style; spotlight uses radial gradient + blur behind typewriter hint | REQ-0005 |
| 2026-06-28T12:30:02Z | DEC-0029 | C4 | build-agent-js | Auth: radial spotlight glow + .auth-book-glow box-shadow around open book spread | Adds depth and leather ambient light effect without affecting preserve-3d or pointer events | REQ-0004 |
| 2026-06-28T12:30:03Z | DEC-0030 | C4 | build-agent-js | Dashboard: brighter text, cover-color reactive glow on BookSpine, shelf-stagger animation, .leather-glass-action-btn glow | All opacity values bumped +0.25–0.4; glow uses book.coverColor hex with alpha appended | REQ-0002, REQ-0006 |
| 2026-06-28T12:33:00Z | DEC-0031 | C4 | red-team-verifier | Wave 3 audit PASS: fix marginTop on spotlight wrapper (gap lost), replace rotateY in shelfItemIn with translateY+scale (no perspective ctx) | 2 micro-fixes; all 5 CSS classes verified defined+consumed; 15 fonts cross-checked; lint/typecheck/16 Vitest/build PASS | REQ-0024 |
| 2026-06-29T12:00:00Z | DEC-0032 | C4 | build-agent-js | Wave 17: Radix Dialog journal paper modal; Lucide cover icons via slug in coverEmoji column | Replaces inline modal; ConfirmDialog shares dialog shell; @radix-ui/react-dialog | REQ-0029–0030 |
| 2026-06-29T12:01:00Z | DEC-0033 | C4 | build-agent-js | resolveCoverIconId maps legacy emoji → Lucide slug | Backward compatible seed + existing books | REQ-0029–0030 |
| 2026-06-29T13:00:00Z | DEC-0034 | C4 | build-agent-js | BookSpineMark shared spine ornament (shelf + editor preview) | Icon beside vertical Dancing Script title; centered on spine | REQ-0029–0030 |
| 2026-06-29T13:30:00Z | DEC-0035 | C4 | build-agent-js | Wave 17c: writing-mode vertical-rl inline axis on .journal-spine-mark | Icon+title same row along spine; responsive clamp sizes | REQ-0029–0030 |
| 2026-06-29T13:31:00Z | DEC-0036 | C4 | build-agent-js | Wave 17c: single scroll on .journal-dialog-body; remove form-col overflow | Fixes box-shadow/outline clip on picker rows | REQ-0029–0030 |
| 2026-06-29T13:32:00Z | DEC-0037 | C4 | build-agent-js | Wave 17c: dashboard-spine-slot overflow visible + .dashboard-spine-slot-inner | Hover glow no longer clipped top/bottom | REQ-0029–0030 |
| 2026-06-29T13:35:00Z | DEC-0038 | C4 | agile-v-core | Session activation — AQMS sync to fe8f261; 31 Vitest PASS; resume C4 Stage 4 | No pending CHECKPOINTS; Gate 2 still CONDITIONAL (REQ-0021 e2e) | REQ-0024 |
| 2026-06-29T13:45:00Z | DEC-0039 | C4 | build-agent-js | Wave 18: sessionStorage landing handoff + CSS authSpotlightEnter/authBookGlowEnter | Landing CTAs only; 750ms enter window; login↔register flip unchanged | REQ-0005, REQ-0029 |
| 2026-06-29T14:30:00Z | DEC-0040 | C4 | build-agent-js | Wave 18b: phased stagger tiers (brand/left/right) + CSS vars from auth-landing-handoff | Shell enter 1s alone; left at +1000ms; form at +1540ms; direct /login unchanged | REQ-0005, REQ-0029 |
| 2026-06-29T15:00:00Z | DEC-0041 | C4 | build-agent-js | Wave 18c: revert 18b phases → unified parallel stagger riding shell enter | Same index left/right animate together; start +100ms; no opacity lock; shell 0.9s | REQ-0005, REQ-0029 |
| 2026-06-29T14:25:00Z | DEC-0042 | C4 | build-agent-js | Wave 18d: landing greeting hold + delayed nav (1650ms) before auth mount | Exit fade at 1250ms; handoff at router.push only | REQ-0005, REQ-0029 |
