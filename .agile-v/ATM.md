# Audit Traceability Matrix (ATM)

<!-- REQ ↔ ART ↔ TC ↔ Verification result | C1 r2 -->

| REQ | ART | TC | Verification (C1) | Owner |
|-----|-----|-----|---------------------|-------|
| REQ-0001 | ART-0001–0004, ART-0024 | TC-0001, TC-0002 | NOT RUN (e2e) | Red Team |
| REQ-0002 | ART-0005–0006 | TC-0003 | NOT RUN (e2e) | Red Team |
| REQ-0003 | ART-0007–0010, ART-0027 | TC-0004, TC-0005 | NOT RUN (e2e) | Red Team |
| REQ-0004 | ART-0007, ART-0011–0012, ART-0026 | TC-0006 | NOT RUN (e2e) | Red Team |
| REQ-0005 | ART-0013–0014 | TC-0007 | NOT RUN (e2e) | Red Team |
| REQ-0006 | ART-0015–0017 | TC-0008 | NOT RUN (e2e) | Red Team |
| REQ-0007 | ART-0018–0019, ART-0043 | TC-0009 | **PASS** (static) | Red Team |
| REQ-0008 | ART-0006–0007 | TC-0010 | **PASS** (static) | Red Team |
| REQ-0009 | ART-0002, ART-0020 | TC-0011 | **FLAG** prod | Red Team |
| REQ-0010 | ART-0021, ART-0037–0038 | TC-0012, TC-0028 | TC-0028 PASS; TC-0012 NOT RUN | Red Team |
| REQ-0011 | ART-0022 | TC-0013 | NOT RUN | Red Team |
| REQ-0012 | ART-0023–0024, ART-0032 | TC-0014 | **PASS** (static) | Red Team |
| REQ-0015 | ART-0039–0045 | TC-0017 | **PASS** static; live NOT RUN | Red Team |
| REQ-0019 | ART-0017 | TC-0021 | **PASS** (static) | Red Team |
| REQ-0020 | ART-0033–0034 | TC-0022 | **PASS** (build) | Red Team |
| REQ-0022 | ART-0025 | TC-0023 | **FLAG** (axe NOT RUN) | Red Team |
| REQ-0023 | ART-0025, ART-0046–0047 | TC-0024, TC-0029 | **PASS** (static) | Red Team |
| REQ-0024 | ART-0028 | — | **PASS** (bootstrap) | Compliance |
| REQ-0025 | ART-0029–0030, ART-0020 | TC-0025 | **PASS** (static) | Red Team |
| REQ-0026 | ART-0031, ART-0035 | TC-0026 | **PASS** (static) | Red Team |
| REQ-0027 | ART-0036 | TC-0027 | **PASS** (static) | Red Team |
| REQ-0028 | ART-0048, ART-0033, ART-0042, ART-0047 | TC-0030 | **PASS** (static) | Red Team |

## C2–C3 extension

| REQ | ART | TC | Verification |
|-----|-----|-----|--------------|
| REQ-0013 | ART-0055 | TC-0015 | PASS static |
| REQ-0014 | ART-0056–0058, ART-0065 | TC-0016 | PASS static |
| REQ-0016 | ART-0059 | TC-0018 | PASS static |
| REQ-0017 | ART-0060–0061, ART-0064 | TC-0019 | PASS e2e local |
| REQ-0018 | ART-0062, ART-0064 | TC-0020 | PASS e2e local |
| REQ-0021 | ART-0066–0067 | TC-0001–0014 | 16 unit PASS; e2e partial |

## C4 extension (2026-06-07)

| REQ | ART | TC | Verification |
|-----|-----|-----|--------------|
| REQ-0029 | ART-0072–0074 | TC-0031 | **PASS** static |
| REQ-0030 | ART-0068–0071, ART-0078 | TC-0032, TC-0033 | **PASS** static |
| REQ-0031 | ART-0075–0077, ART-0009 | TC-0034, TC-0035 | **PASS** static+db |

## Coverage (C4)

- **Implemented REQs with ART:** 26 / 31
- **Backlog:** REQ-0021 CI e2e, REQ-0019 observability, REQ-0022 axe, REQ-0009 prod demo
