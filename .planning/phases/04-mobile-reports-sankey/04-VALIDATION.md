---
phase: 04
slug: mobile-reports-sankey
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29 + jest-expo 55 |
| **Config file** | `jest.config.js` |
| **Quick run command** | `bun run test -- --testPathPattern="reports\|sankey\|report-data" --no-coverage` |
| **Full suite command** | `bun run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run test -- --testPathPattern="reports\|sankey\|report-data" --no-coverage`
- **After every plan wave:** Run `bun run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | RPRT-01 | unit | `bun run test -- --testPathPattern="SpendingBarChart" -x` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | RPRT-01 | unit | `bun run test -- --testPathPattern="IncomeExpenseBarChart" -x` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | RPRT-01 | unit | `bun run test -- --testPathPattern="NetWorthLineChart" -x` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 1 | RPRT-02 | unit | `bun run test -- --testPathPattern="TimeRangeSelector" -x` | ❌ W0 | ⬜ pending |
| 04-01-05 | 01 | 1 | RPRT-02 | unit | `bun run test -- --testPathPattern="SwipeableChart" -x` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | RPRT-03 | unit | `bun run test -- --testPathPattern="AoMTrendChart" -x` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | RPRT-04 | unit | `bun run test -- --testPathPattern="SankeyDiagram" -x` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 2 | RPRT-04 | unit | `bun run test -- --testPathPattern="sankey-layout" -x` | ❌ W0 | ⬜ pending |
| 04-03-03 | 03 | 2 | RPRT-05 | unit | `bun run test -- --testPathPattern="SankeyVertical" -x` | ❌ W0 | ⬜ pending |
| 04-03-04 | 03 | 2 | RPRT-06 | unit | `bun run test -- --testPathPattern="PrivacyToggle" -x` | ❌ W0 | ⬜ pending |
| 04-03-05 | 03 | 2 | RPRT-06 | unit | `bun run test -- --testPathPattern="Sankey" -x` | ❌ W0 | ⬜ pending |
| 04-00-01 | 00 | 0 | DATA | unit | `bun run test -- --testPathPattern="use-report-data" -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/hooks/use-report-data.test.ts` — covers DATA (mock data shape validation)
- [ ] `src/components/reports/SpendingBarChart.test.tsx` — covers RPRT-01
- [ ] `src/components/reports/TimeRangeSelector.test.tsx` — covers RPRT-02
- [ ] `src/components/reports/AoMTrendChart.test.tsx` — covers RPRT-03
- [ ] `src/components/reports/SankeyDiagram.test.tsx` — covers RPRT-04, RPRT-05
- [ ] `src/components/reports/PrivacyToggle.test.tsx` — covers RPRT-06
- [ ] Jest mock for `react-native-gifted-charts` in jest.setup.js
- [ ] Jest mock for `d3-sankey` in jest.setup.js or inline
- [ ] Add `d3-sankey|react-native-gifted-charts|expo-linear-gradient` to `transformIgnorePatterns` in jest.config.js

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Swipe gesture navigates months | RPRT-02 | Gesture simulation requires native driver | Swipe left/right on chart area, verify month label changes |
| Sankey vertical layout on mobile | RPRT-05 | Visual layout verification | Open reports on phone, view cash flow tab |
| Sankey horizontal layout on web | RPRT-05 | Platform-specific rendering | Open reports on web browser, compare layout |
| Chart animations render smoothly | RPRT-01 | Performance/visual check | Navigate between report tabs, verify smooth transitions |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
