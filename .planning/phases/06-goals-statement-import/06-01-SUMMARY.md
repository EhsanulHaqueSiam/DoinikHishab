---
phase: 06-goals-statement-import
plan: 01
subsystem: services
tags: [mmkv, goals, debt-payoff, amortization, budgeting, i18n, tdd]

# Dependency graph
requires:
  - phase: 05-recurring-subscriptions
    provides: MMKV storage patterns (getJSON/setJSON), recurring-storage CRUD template
provides:
  - GoalDataStore types (SaveUpGoal, PayDownGoal, GoalStatus, AmortizationRow, StrategyResult, GoalBudgetCategory)
  - Goal storage MMKV CRUD service (getGoals, saveSaveUpGoal, updateSaveUpGoal, deleteSaveUpGoal, savePayDownGoal, updatePayDownGoal, deletePayDownGoal)
  - Goal engine pure calculation functions (calculateMonthlyContribution, calculateGoalStatus, generateAmortization, compareStrategies, getGoalBudgetCategories)
  - Goals i18n keys (45 keys) in English and Bengali
affects: [06-03-goals-ui, 06-05-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [versioned MMKV goal store, amortization schedule generation, avalanche/snowball strategy simulation, time-proportional goal status with 5% tolerance band]

key-files:
  created:
    - src/services/goal-storage/types.ts
    - src/services/goal-storage/index.ts
    - src/services/goal-storage/index.test.ts
    - src/services/goal-engine/index.ts
    - src/services/goal-engine/index.test.ts
  modified:
    - src/services/storage/index.ts
    - src/lib/i18n/en.ts
    - src/lib/i18n/bn.ts

key-decisions:
  - "Reused recurring-storage versioned store pattern for goals MMKV persistence"
  - "5% tolerance band for goal status calculation (ahead/on_track/behind)"
  - "360-month cap on amortization to prevent infinite loops"
  - "Integer paisa math throughout (Math.round for interest, Math.ceil for contributions)"

patterns-established:
  - "Goal storage pattern: versioned GoalDataStore with goal_ and debt_ ID prefixes"
  - "Pure engine functions: no side effects, all paisa integers, testable without mocks"
  - "Strategy simulation: deep-copy balances, apply interest then min payments then extra to priority debt"

requirements-completed: [GOAL-01, GOAL-02, GOAL-03, GOAL-04, GOAL-05]

# Metrics
duration: 4min
completed: 2026-03-26
---

# Phase 06 Plan 01: Goals Foundation Summary

**MMKV goal-storage CRUD and goal-engine with amortization, avalanche/snowball strategy comparison, status tracking, and 45 i18n keys in English/Bengali**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-26T07:57:44Z
- **Completed:** 2026-03-26T08:02:15Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Goal storage service with full CRUD for save-up goals and pay-down debts, following recurring-storage MMKV pattern
- Goal engine with 5 pure calculation functions: monthly contribution, goal status, amortization schedule, avalanche/snowball strategy comparison, budget category generation
- 29 comprehensive tests passing (TDD approach: types first, tests second, implementation third)
- 45 goals-domain i18n keys in both English and Bengali with preserved interpolation placeholders

## Task Commits

Each task was committed atomically:

1. **Task 1: Goal types, storage service, and engine with tests** - `73aca03` (feat - TDD)
2. **Task 2: Goals i18n keys for English and Bengali** - `aa4f5db` (feat)

## Files Created/Modified
- `src/services/goal-storage/types.ts` - SaveUpGoal, PayDownGoal, GoalDataStore, GoalStatus, AmortizationRow, StrategyResult, GoalBudgetCategory interfaces
- `src/services/goal-storage/index.ts` - MMKV CRUD: getGoals, saveSaveUpGoal, updateSaveUpGoal, deleteSaveUpGoal, savePayDownGoal, updatePayDownGoal, deletePayDownGoal
- `src/services/goal-storage/index.test.ts` - 9 tests for storage CRUD operations
- `src/services/goal-engine/index.ts` - Pure functions: calculateMonthlyContribution, calculateGoalStatus, generateAmortization, compareStrategies, getGoalBudgetCategories
- `src/services/goal-engine/index.test.ts` - 20 tests for engine calculations
- `src/services/storage/index.ts` - Added getJSON/setJSON/deleteKey helpers (missing in worktree)
- `src/lib/i18n/en.ts` - Added 45-key goals namespace
- `src/lib/i18n/bn.ts` - Added 45-key goals namespace with Bengali translations

## Decisions Made
- Reused recurring-storage versioned store pattern (version: 1) for goals MMKV persistence
- 5% tolerance band for goal status: ahead > expected+5%, on_track within +/-5%, behind < expected-5%
- 360-month cap on amortization schedule to prevent infinite loops on low-payment/high-interest scenarios
- All monetary math uses integer paisa: Math.round for interest, Math.ceil for monthly contributions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added getJSON/setJSON/deleteKey to storage service**
- **Found during:** Task 1 (goal-storage implementation)
- **Issue:** The worktree's storage/index.ts was missing getJSON/setJSON/deleteKey functions that the main repo has -- goal-storage imports them
- **Fix:** Added the 3 functions (getJSON, setJSON, deleteKey) to the storage service, matching the main repo's implementation
- **Files modified:** src/services/storage/index.ts
- **Verification:** goal-storage tests pass, functions work correctly
- **Committed in:** 73aca03 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for goal-storage to function. No scope creep.

## Issues Encountered
- Full test suite shows failures from parallel agent worktrees (agent-a59c0069) -- unrelated to this plan's changes, all 29 goal tests pass

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Goal types and services ready for UI consumption (Plan 03: Goals UI)
- Engine functions exported for budget integration (Plan 05: Integration)
- i18n keys available for all goal-related screens and components

## Self-Check: PASSED

- All 8 created/modified files verified present
- Both task commits (73aca03, aa4f5db) verified in git log
- 29/29 tests passing

---
*Phase: 06-goals-statement-import*
*Completed: 2026-03-26*
