---
phase: 05
slug: recurring-subscriptions
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29 + jest-expo |
| **Config file** | `jest.config.js` |
| **Quick run command** | `bun run test -- --testPathPattern=recurring --no-coverage` |
| **Full suite command** | `bun run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run test -- --testPathPattern=recurring --no-coverage`
- **After every plan wave:** Run `bun run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | RECR-01 | unit | `bun run test -- --testPathPattern="CalendarGrid" -x` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | RECR-02 | unit | `bun run test -- --testPathPattern="BillListView" -x` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 1 | RECR-03 | unit | `bun run test -- --testPathPattern="subscription-detector" -x` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 1 | RECR-04 | unit | `bun run test -- --testPathPattern="SubscriptionList" -x` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 2 | RECR-05 | unit | `bun run test -- --testPathPattern="ForecastChart" -x` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 2 | RECR-06 | unit | `bun run test -- --testPathPattern="ForecastChart" -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/services/subscription-detector/index.test.ts` — covers RECR-03
- [ ] `src/services/recurring-storage/index.test.ts` — covers RECR-04
- [ ] `src/components/recurring/CalendarGrid.test.tsx` — covers RECR-01
- [ ] `src/components/recurring/BillListView.test.tsx` — covers RECR-02
- [ ] `src/components/recurring/ForecastChart.test.tsx` — covers RECR-05, RECR-06
- [ ] `src/components/recurring/SubscriptionList.test.tsx` — covers RECR-04
- [ ] `src/hooks/use-recurring-data.test.ts` — covers mock data hook
- [ ] Jest mock for `LineChartBicolor` in `jest.setup.js`
- [ ] Jest mock for `Swipeable`/`ReanimatedSwipeable` in `jest.setup.js`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Calendar grid month navigation | RECR-01 | Touch gesture interaction | Tap left/right arrows, verify month changes |
| Swipe-to-delete subscription | RECR-04 | Gesture simulation requires native driver | Swipe left on a subscription row, verify removal |
| Forecast chart danger zone rendering | RECR-06 | Visual verification of red fill area | View forecast chart with negative balance projection |
| Bottom sheet bill detail | RECR-01 | Touch interaction + layout | Tap a calendar day with bills, verify bottom sheet content |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
