---
phase: 3
slug: budget-ideology-onboarding
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x + @testing-library/react-native |
| **Config file** | `jest.config.js` |
| **Quick run command** | `bun run test` |
| **Full suite command** | `bun run test -- --coverage` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run test`
- **After every plan wave:** Run `bun run test -- --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | BUDG-04, BUDG-05 | unit | `bun run test -- budget-engine` | ✅ existing | ⬜ pending |
| 03-01-02 | 01 | 1 | BUDG-01, BUDG-02, BUDG-03 | unit + component | `bun run test -- sinking-fund\|ReadyToAssign` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | ONBD-01, ONBD-04 | component | `bun run test -- onboarding` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | ONBD-02, ONBD-03 | integration | `bun run test -- onboarding` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing jest infrastructure from Phase 1 covers all Phase 3 needs. No new framework installation.

- [ ] Budget engine tests already exist (`src/services/budget-engine/index.test.ts`) — extend for new functions
- [ ] Convex/MMKV mocks already in jest.setup.js — no changes needed
- [ ] i18n mock already in jest.setup.js — no changes needed

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Onboarding carousel swipe | ONBD-01 | Gesture interaction | Swipe through 4 rule cards, verify BN/EN toggle |
| Bengali text rendering | BUDG-01 | Visual rendering | Switch to Bengali, verify sinking fund names display correctly |
| Progress bar animation | BUDG-02 | Visual animation | View sinking fund with partial progress, verify teal fill |
| Rule tip appearance timing | ONBD-03 | Contextual trigger | Overspend a category, verify Rule 3 tip appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
