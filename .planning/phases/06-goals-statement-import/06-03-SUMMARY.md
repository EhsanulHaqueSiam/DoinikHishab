---
phase: 06-goals-statement-import
plan: 03
subsystem: ui
tags: [goals, debt-payoff, reanimated, bottom-sheet, mmkv, progress-bar, amortization, strategy-comparison]

# Dependency graph
requires:
  - phase: 06-goals-statement-import
    provides: Goal storage MMKV CRUD service, goal engine pure calculation functions, goals i18n keys
provides:
  - GoalProgress animated progress bar component
  - GoalCard save-up goal card with status badge and monthly contribution
  - GoalForm bottom sheet form for goal creation/editing
  - DebtCard pay-down goal card with expandable amortization
  - DebtForm bottom sheet form for debt creation/editing
  - AmortizationTable expandable table with first-6-rows + show-more
  - StrategyComparison avalanche vs snowball side-by-side cards
  - GoalDetailView full goal detail with edit/delete actions
  - useGoals hook with MMKV-backed CRUD and refreshKey pattern
  - Goals list screen route (app/goals/index.tsx)
  - Goal detail screen route (app/goals/[id].tsx)
affects: [06-05-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [statusConfig Record pattern for goal status colors, refreshKey counter for MMKV re-renders, bottom sheet form pattern for goals and debts]

key-files:
  created:
    - src/components/goals/GoalProgress.tsx
    - src/components/goals/GoalCard.tsx
    - src/components/goals/GoalForm.tsx
    - src/components/goals/DebtCard.tsx
    - src/components/goals/DebtForm.tsx
    - src/components/goals/AmortizationTable.tsx
    - src/components/goals/StrategyComparison.tsx
    - src/components/goals/GoalDetailView.tsx
    - src/hooks/use-goals.ts
    - app/goals/index.tsx
    - app/goals/[id].tsx
  modified: []

key-decisions:
  - "statusConfig Record pattern for status-based styling (reused from SinkingFundRow)"
  - "Mock contribution history in GoalDetailView (real data deferred to backend re-enable)"
  - "Mock accounts in GoalForm (Savings/Cash/Bank pills, will connect to real accounts later)"

patterns-established:
  - "GoalProgress reusable animated bar: status-to-color Record, withTiming 600ms, accessibilityRole=progressbar"
  - "Bottom sheet form pattern: validate, convert taka to paisa, haptic feedback, reset, close"
  - "useGoals refreshKey counter: increment after MMKV write to trigger useMemo re-read"

requirements-completed: [GOAL-01, GOAL-02, GOAL-03, GOAL-04, GOAL-05]

# Metrics
duration: 4min
completed: 2026-03-26
---

# Phase 06 Plan 03: Goals UI Summary

**8 goal components, useGoals hook, and 2 screen routes delivering save-up/pay-down goal tracking with animated progress, amortization tables, and avalanche vs snowball strategy comparison**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-26T08:13:57Z
- **Completed:** 2026-03-26T08:18:31Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments
- 8 goal components: GoalProgress, GoalCard, GoalForm, DebtCard, DebtForm, AmortizationTable, StrategyComparison, GoalDetailView
- useGoals hook with MMKV-backed CRUD operations and refreshKey pattern for reactive updates
- Goals list screen with save-up section, debt payoff section, strategy comparison (2+ debts), and empty states
- Goal detail screen with large progress display, info rows, contribution history, edit/delete actions

## Task Commits

Each task was committed atomically:

1. **Task 1: GoalProgress, GoalCard, GoalForm, and useGoals hook** - `5830079` (feat)
2. **Task 2: DebtCard, DebtForm, AmortizationTable, and StrategyComparison** - `7aeff1b` (feat)
3. **Task 3: GoalDetailView and screen routes** - `bf522a6` (feat)

## Files Created/Modified
- `src/components/goals/GoalProgress.tsx` - Animated progress bar with status-based colors
- `src/components/goals/GoalCard.tsx` - Save-up goal card with progress, status badge, monthly contribution
- `src/components/goals/GoalForm.tsx` - Bottom sheet form for goal creation/editing with validation
- `src/components/goals/DebtCard.tsx` - Pay-down card with expandable amortization table
- `src/components/goals/DebtForm.tsx` - Bottom sheet form for debt creation/editing
- `src/components/goals/AmortizationTable.tsx` - Expandable table showing first 6 rows with show-more
- `src/components/goals/StrategyComparison.tsx` - Avalanche vs snowball side-by-side with recommended teal border
- `src/components/goals/GoalDetailView.tsx` - Full goal detail with edit/delete and contribution history
- `src/hooks/use-goals.ts` - MMKV-backed hook with CRUD and goalBudgetCategories for budget integration
- `app/goals/index.tsx` - Goals list screen with sections, empty states, bottom sheet forms
- `app/goals/[id].tsx` - Goal detail screen with edit form and delete confirmation

## Decisions Made
- Reused statusConfig Record pattern from SinkingFundRow for goal status styling (consistent across codebase)
- Mock contribution history in GoalDetailView (3 hardcoded entries for display; real data requires backend)
- Mock accounts in GoalForm pill selector (Savings/Cash/Bank; will connect to real account data when Convex re-enabled)
- All amounts converted taka-to-paisa via takaToPaisa before storage (matching codebase convention)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs
- `src/components/goals/GoalDetailView.tsx:35-39` - MOCK_CONTRIBUTIONS array with hardcoded contribution history data. Intentional: real contribution tracking requires Convex backend (currently offline). Will be resolved when backend is re-enabled.
- `src/components/goals/GoalForm.tsx:22-26` - MOCK_ACCOUNTS array for linked account selection. Intentional: real accounts come from Convex. Will be wired when backend is re-enabled.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 8 goal components ready for integration into dashboard and tab navigation (Plan 05)
- useGoals hook provides goalBudgetCategories for budget view integration
- Screen routes ready for navigation wiring

## Self-Check: PASSED

- All 11 created files verified present
- All 3 task commits (5830079, 7aeff1b, bf522a6) verified in git log
