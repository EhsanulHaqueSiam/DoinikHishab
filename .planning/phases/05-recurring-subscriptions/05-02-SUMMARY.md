---
phase: 05-recurring-subscriptions
plan: 02
subsystem: ui
tags: [calendar-grid, bill-list, view-toggle, bottom-sheet, nativewind, flashlist, accessibility]

requires:
  - phase: 05-recurring-subscriptions
    provides: BillItem and BillStatus types, recurring-types.ts, jest mocks for bottom-sheet

provides:
  - BillSummaryCard component following BalanceCard pattern with upcoming/paid totals
  - ViewToggle component for Calendar/List pill toggle with accessibility roles
  - BillCalendarGrid component with 7-column grid, colored status dots, month navigation
  - BillDaySheet bottom sheet component for day-tap bill details
  - BillListView component with grouped sections (This Week/Next Week/This Month) and status badges
  - FlashList mock in jest.setup.js for list component testing
  - Fixed useTranslation mock in jest.setup.js for component tests

affects: [05-04]

tech-stack:
  added: []
  patterns:
    - "Calendar grid: 7-column View layout with day cells, status dots (teal/saffron/red), month navigation via state"
    - "Status badge pattern: Record<BillStatus, {container, text}> mapping for consistent badge styling"
    - "Bill grouping: chronological grouping by This Week / Next Week / This Month using end-of-week calculation"
    - "FlashList mock: React.forwardRef wrapping FlatList for test environment compatibility"

key-files:
  created:
    - src/components/recurring/BillSummaryCard.tsx
    - src/components/recurring/ViewToggle.tsx
    - src/components/recurring/BillCalendarGrid.tsx
    - src/components/recurring/BillCalendarGrid.test.tsx
    - src/components/recurring/BillDaySheet.tsx
    - src/components/recurring/BillListView.tsx
    - src/components/recurring/BillListView.test.tsx
  modified:
    - jest.setup.js

key-decisions:
  - "STATUS_STYLES record pattern for reusable badge styling across BillDaySheet and BillListView"
  - "FlashList mock using React.forwardRef wrapping FlatList for test compatibility"
  - "Fixed useTranslation named export in jest.setup.js i18n mock for component test support"

patterns-established:
  - "Calendar grid layout: nested View rows with 7 Pressable cells per row, 44px min touch target"
  - "Status dot indicators: w-1.5 h-1.5 rounded-full with bg-primary-500/bg-accent/bg-danger"
  - "Status badge record: Record<BillStatus, {container, text}> for DRY badge styling"

requirements-completed: [RECR-01, RECR-02]

duration: 7min
completed: 2026-03-26
---

# Phase 5 Plan 2: Calendar & Bill Views Summary

**5 UI components for recurring bill tracking: calendar grid with teal/saffron/red status dots, grouped list view with FlashList, summary card, view toggle, and day-detail bottom sheet**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-26T04:32:11Z
- **Completed:** 2026-03-26T04:39:45Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- BillSummaryCard follows BalanceCard pattern with upcoming/paid totals and bill count
- BillCalendarGrid renders 7-column grid with colored status dots (teal=paid, saffron=upcoming, red=overdue), month navigation, and today highlighting
- BillListView groups bills chronologically by This Week / Next Week / This Month with status badges and FlashList for performance
- ViewToggle provides Calendar/List pill toggle with accessibility roles (accessibilityRole="tab")
- BillDaySheet opens as @gorhom/bottom-sheet showing bill details for a tapped day
- 10 tests pass across 2 test suites (5 CalendarGrid + 5 ListView)

## Task Commits

Each task was committed atomically:

1. **Task 1: BillSummaryCard, ViewToggle, BillCalendarGrid, BillDaySheet, and tests** - `6c47ffb` (feat)
2. **Task 2: BillListView with grouped sections and status badges** - `dd72505` (feat)

## Files Created/Modified
- `src/components/recurring/BillSummaryCard.tsx` - Summary card with upcoming/paid totals following BalanceCard pattern
- `src/components/recurring/ViewToggle.tsx` - Calendar/List pill toggle with accessibility roles
- `src/components/recurring/BillCalendarGrid.tsx` - 7-column calendar grid with colored status dots and month navigation
- `src/components/recurring/BillCalendarGrid.test.tsx` - 5 tests: weekday headers, day numbers, dots, press/no-press
- `src/components/recurring/BillDaySheet.tsx` - Bottom sheet showing bills for a selected day
- `src/components/recurring/BillListView.tsx` - Grouped bill list with status badges using FlashList
- `src/components/recurring/BillListView.test.tsx` - 5 tests: section headers, payee names, badges, empty state, grouping
- `jest.setup.js` - Added FlashList mock and fixed useTranslation named export in i18n mock

## Decisions Made
- Used STATUS_STYLES record pattern mapping BillStatus to NativeWind class strings for consistent badge styling across BillDaySheet and BillListView
- Added FlashList mock using React.forwardRef wrapping FlatList for jest test compatibility
- Fixed useTranslation named export in jest.setup.js i18n mock to support component-level tests that import useTranslation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed jest.setup.js i18n mock missing useTranslation export**
- **Found during:** Task 2 (BillListView tests)
- **Issue:** jest.setup.js mocked `./src/lib/i18n` with only a default export, missing the `useTranslation` named export used by components
- **Fix:** Added `useTranslation: () => ({ t: (key) => key, locale: "en" })` to the i18n mock
- **Files modified:** jest.setup.js
- **Verification:** All 10 tests pass
- **Committed in:** dd72505 (Task 2 commit)

**2. [Rule 3 - Blocking] Added FlashList mock to jest.setup.js**
- **Found during:** Task 2 (BillListView tests)
- **Issue:** No FlashList mock existed in jest.setup.js, @shopify/flash-list requires native RecyclerView
- **Fix:** Added mock using React.forwardRef wrapping FlatList
- **Files modified:** jest.setup.js
- **Verification:** BillListView tests pass with FlashList rendering
- **Committed in:** dd72505 (Task 2 commit)

**3. [Rule 3 - Blocking] Added jest.config.js and test script to worktree**
- **Found during:** Task 1 (test setup)
- **Issue:** Worktree was missing jest.config.js and test script from package.json (from Phase 01 tooling)
- **Fix:** Copied jest.config.js and added "test": "jest" script
- **Files modified:** jest.config.js, package.json
- **Verification:** All tests run successfully
- **Committed in:** 6c47ffb (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** All auto-fixes were necessary to enable test execution in the worktree. No scope creep.

## Issues Encountered
- Cherry-picking Plan 01 commits into worktree required conflict resolution for i18n files (en.ts, bn.ts) due to worktree being based on an older commit without Phase 03/04 changes

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 5 UI components ready for assembly into the recurring bills screen in Plan 04
- ViewToggle can switch between BillCalendarGrid and BillListView
- BillSummaryCard can be placed at the top of the recurring screen
- BillDaySheet can be triggered by BillCalendarGrid's onDayPress callback
- All components consume BillItem[] from useRecurringData hook (Plan 01)

## Self-Check: PASSED

- All 7 created files verified on disk
- All 2 commit hashes (6c47ffb, dd72505) found in git log
- All 10 tests passing across 2 suites
- All 22 acceptance criteria verified via grep

---
*Phase: 05-recurring-subscriptions*
*Completed: 2026-03-26*
