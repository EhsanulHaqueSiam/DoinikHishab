---
phase: 2
slug: 3-tap-transaction-entry
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 2 — Validation Strategy

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
| 02-01-01 | 01 | 1 | TRAN-02 | unit + component | `bun run test -- AmountPad` | ✅ existing | ⬜ pending |
| 02-01-02 | 01 | 1 | TRAN-05 | component | `bun run test -- QuickAdd` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | TRAN-03 | unit + component | `bun run test -- CategoryGrid` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | TRAN-01, TRAN-04 | integration | `bun run test -- QuickAdd` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure from Phase 1 (jest.config.js, jest.setup.js, RNTL) covers all Phase 2 requirements. No new framework installation needed.

- [ ] Mock data module exists for categories/accounts (Phase 2 creates this)
- [ ] Convex mock in jest.setup.js already covers useQuery/useMutation
- [ ] MMKV mock in jest.setup.js already covers storage adapter

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Haptic feedback on save | TRAN-01 | Requires physical device | Tap category, feel vibration pulse |
| System keyboard suppressed | TRAN-02 | Emulator keyboard behavior varies | Tap amount field, verify no system keyboard appears |
| Live BDT formatting visible | TRAN-02 | Visual rendering | Type "450", see "৳450.00" update live |
| 300ms green flash animation | TRAN-01 | Visual animation timing | Tap category, see green flash on tile |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
