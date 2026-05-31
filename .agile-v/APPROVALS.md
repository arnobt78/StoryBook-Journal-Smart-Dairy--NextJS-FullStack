# Human Gate Approvals (append-only)

<!-- GATE-XXXX — 21 CFR Part 11 / Annex 11 aligned records -->

| GATE-ID | Type | Cycle | Scope | Decision | Conditions | Approver | Role | Timestamp | Signature | Evidence | resume_token |
|---------|------|-------|-------|----------|------------|----------|------|-----------|-----------|----------|--------------|
| GATE-0001 | Gate 1 | C1 | REQ-0001–0024 blueprint (implemented baseline + planned backlog) | **Approved** | Planned REQs 0013–0021 deferred to CR | Project Owner | Product Owner | 2026-03-16T12:00:00Z | APPROVALS.md | REQUIREMENTS.md @ C1-bootstrap | — |
| GATE-0003 | Gate 1 amendment | C1 | REQ-0025–0027 infra + REQ-0020 Vercel pivot | **Approved** | CR-0001; fresh public repo; secrets rotated recommended | Project Owner | Product Owner | 2026-06-01T12:00:00Z | chat bootstrap authorization | REQUIREMENTS.md @ C1-bootstrap-2026-06-01 | — |
| — | Gate 2 | C1 | C1 release | PENDING | Requires e2e TC-0001–0014 + TC-0025–0027 live checks (REQ-0021) | — | — | — | — | VALIDATION_SUMMARY.md | — |

## GATE-0003 rationale (infra amendment)

- **Scope:** PostgreSQL Prisma layer, sanitized public repo, Vercel deploy path, optional local docker-compose.
- **Traceability:** ART-0029–0036 registered; TC-0025–0027 added.
- **Conditions:** Gate 2 still blocked on REQ-0021 automated suite; demo account prod gate (REQ-0009).
