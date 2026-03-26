---
phase: 06
slug: goals-statement-import
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29 + jest-expo |
| **Config file** | `jest.config.js` |
| **Quick run command** | `bun run test -- --testPathPattern="goal\|import\|amortization\|debt\|statement" --no-coverage` |
| **Full suite command** | `bun run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick test command
- **After every plan wave:** Run `bun run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Goal progress bar colors | GOAL-01 | Visual verification | Create goals at different progress levels, verify green/saffron/teal |
| Amortization table expand/collapse | GOAL-02 | Animation/gesture | Tap Show schedule, verify table expands smoothly |
| Strategy comparison visual | GOAL-03 | Layout verification | Add 2+ debts, compare Avalanche vs Snowball side-by-side |
| File picker opens correctly | IMPT-01 | Native API | Tap Import, verify file picker filters PDF/XLS/TXT |
| Parsed transactions checklist | IMPT-03 | Interactive list | Import a test file, verify rows render with checkboxes |

---

## Validation Sign-Off

- [ ] All tasks have automated verify
- [ ] Sampling continuity maintained
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
