---
phase: 03-budget-ideology-onboarding
plan: 01
subsystem: services, hooks, i18n
tags: [budget-engine, sinking-funds, onboarding, mmkv, i18n, bengali, ynab, tdd]

requires:
  - phase: 01-tooling-foundation
    provides: Jest test infrastructure, i18n setup, MMKV storage adapter
  - phase: 02-transaction-entry
    provides: Mock data pattern, budget engine core functions
provides:
  - calculateDaysOfBuffering and calculateSinkingFundSuggest budget engine functions
  - 5 sinking fund templates (Eid, School, Wedding, Medical, Custom) with Bengali i18n
  - 4 category template sets (Student, Professional, Freelancer, Family)
  - Onboarding state machine with MMKV persistence
  - YNAB 4 Rules data constant with i18n keys
  - useMetrics hook (Age of Money, Days of Buffering, trend)
  - useOnboarding hook (state + navigation actions)
  - ~80 new i18n keys in English and Bengali (sinkingFunds, metrics, readyToAssign, tips, onboarding, templates)
affects: [03-02, 03-03, 03-04, budget-screen, dashboard, onboarding-flow, settings]

tech-stack:
  added: [jest@29.7.0, jest-expo@55.0.11, "@testing-library/react-native@13.3.3", "@types/jest@29.5.14"]
  patterns: [TDD red-green for pure functions, MMKV JSON persistence via getJSON/setJSON, onboarding state machine]

key-files:
  created:
    - src/services/budget-engine/index.test.ts
    - src/services/mock-data/index.ts
    - src/services/onboarding/index.ts
    - src/services/onboarding/rules.ts
    - src/hooks/use-metrics.ts
    - src/hooks/use-onboarding.ts
    - jest.config.js
    - jest.setup.js
  modified:
    - src/services/budget-engine/index.ts
    - src/services/storage/index.ts
    - src/lib/i18n/en.ts
    - src/lib/i18n/bn.ts
    - package.json

key-decisions:
  - "Jest test infrastructure bootstrapped in worktree (jest-expo preset, co-located .test.ts)"
  - "getJSON/setJSON added to storage service for structured MMKV data"
  - "Mock data created in worktree (was missing from this git state)"
  - "i18n files are .ts not .json -- adapted plan accordingly"

patterns-established:
  - "MMKV JSON persistence: getJSON<T>/setJSON<T> for structured data like onboarding state"
  - "Onboarding state machine: read-modify-persist pattern with validation on read"
  - "TDD for pure budget engine functions: red (failing tests) then green (implementation)"
  - "Sinking fund templates: id + i18n nameKey + icon + color + defaults pattern"

requirements-completed: [BUDG-01, BUDG-04, BUDG-05]

duration: 7min
completed: 2026-03-26
---

# Phase 3 Plan 1: Data Foundation Summary

**Budget engine extensions (Days of Buffering, sinking fund suggest), onboarding state machine with MMKV, YNAB rules data, metrics/onboarding hooks, and ~80 Bengali/English i18n keys for the entire phase**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-26T00:47:32Z
- **Completed:** 2026-03-26T00:54:49Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Budget engine extended with calculateDaysOfBuffering (balance/avg daily outflow) and calculateSinkingFundSuggest (ceil-rounded monthly amounts) -- 11 unit tests all passing
- Mock data service created with 5 sinking fund templates (4 Bangladeshi defaults pre-selected) and 4 category template sets mapped to existing mock category IDs
- Onboarding state machine with full MMKV persistence: 5-step state tracking, skip/complete/reset, tip dismissal, configurable lookback period
- YNAB 4 Rules data constant with i18n keys and Obsidian Finance color scheme
- useMetrics and useOnboarding hooks ready for UI consumption
- Complete Phase 3 i18n coverage in both English and Bengali

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED):** TDD failing tests - `fb31248` (test)
2. **Task 1 (GREEN):** Budget engine + mock data + onboarding + YNAB rules - `a5b01cc` (feat)
3. **Task 2:** Hooks + i18n translations - `a81f9bb` (feat)
4. **Lockfile:** Test dependency lockfile - `d242848` (chore)

## Files Created/Modified
- `src/services/budget-engine/index.ts` - Added calculateDaysOfBuffering and calculateSinkingFundSuggest
- `src/services/budget-engine/index.test.ts` - 11 unit tests for new functions
- `src/services/mock-data/index.ts` - Full mock data + SINKING_FUND_TEMPLATES + CATEGORY_TEMPLATE_SETS
- `src/services/onboarding/index.ts` - Onboarding state machine with MMKV persistence
- `src/services/onboarding/rules.ts` - YNAB_RULES constant + ONBOARDING_STEPS
- `src/services/storage/index.ts` - Added getJSON, setJSON, deleteKey helpers
- `src/hooks/use-metrics.ts` - useMetrics hook (AoM, DoB, trend)
- `src/hooks/use-onboarding.ts` - useOnboarding hook (state + actions)
- `src/lib/i18n/en.ts` - Added 6 new sections with ~80 keys
- `src/lib/i18n/bn.ts` - Bengali translations for all new keys
- `jest.config.js` - Jest configuration with jest-expo preset
- `jest.setup.js` - Global mocks (MMKV, Haptics, Convex, i18n, platform)
- `package.json` - Added test script and Jest dev dependencies

## Decisions Made
- Bootstrapped Jest test infrastructure in this worktree (was missing) to enable TDD flow
- Added getJSON/setJSON to storage service -- onboarding state machine requires structured data persistence beyond string key-value
- Created mock-data service from scratch in worktree (existed in main repo but not in this git state)
- Adapted i18n approach: plan referenced .json files but project uses .ts exports with `as const` typing

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing test infrastructure**
- **Found during:** Task 1 (TDD RED phase)
- **Issue:** No Jest/testing framework installed in worktree. Plan requires `bun run test` which had no test script.
- **Fix:** Installed jest@29, jest-expo@55, @testing-library/react-native, @types/jest. Created jest.config.js and jest.setup.js. Added "test" script to package.json.
- **Files modified:** package.json, jest.config.js, jest.setup.js
- **Verification:** `bun run test` runs successfully, 11 tests pass
- **Committed in:** fb31248 (test commit)

**2. [Rule 3 - Blocking] Missing getJSON/setJSON in storage service**
- **Found during:** Task 1 (Onboarding service creation)
- **Issue:** Plan references `getJSON`/`setJSON` imports from storage service but they didn't exist
- **Fix:** Added getJSON<T>, setJSON<T>, and deleteKey helpers to storage/index.ts
- **Files modified:** src/services/storage/index.ts
- **Verification:** Onboarding service compiles and functions correctly
- **Committed in:** a5b01cc (task 1 commit)

**3. [Rule 3 - Blocking] Missing mock-data service**
- **Found during:** Task 1 (Mock data extensions)
- **Issue:** src/services/mock-data/index.ts didn't exist in this worktree (existed in main repo)
- **Fix:** Created full mock-data service with base data + new sinking fund/template extensions
- **Files modified:** src/services/mock-data/index.ts (created)
- **Verification:** All mock data exports accessible, template counts match plan
- **Committed in:** a5b01cc (task 1 commit)

**4. [Rule 3 - Blocking] i18n files are .ts not .json**
- **Found during:** Task 2 (i18n translations)
- **Issue:** Plan referenced en.json/bn.json but project uses en.ts/bn.ts with TypeScript const assertions
- **Fix:** Added new sections to .ts files maintaining existing export pattern
- **Files modified:** src/lib/i18n/en.ts, src/lib/i18n/bn.ts
- **Verification:** All 6 new sections present in both files
- **Committed in:** a81f9bb (task 2 commit)

---

**Total deviations:** 4 auto-fixed (4 blocking issues)
**Impact on plan:** All auto-fixes necessary to unblock plan execution. No scope creep. The core deliverables match the plan exactly.

## Issues Encountered
- Pre-existing TypeScript type error in bn.ts (TranslationKeys uses literal string types from `as const`, Bengali strings don't match English literals). This is a design issue from Phase 1 that doesn't affect runtime behavior. Out of scope for this plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All services, hooks, and i18n keys are ready for UI consumption in plans 03-02 through 03-04
- Budget engine functions tested and exported
- Onboarding state machine persists across app restarts via MMKV
- 5 sinking fund templates and 4 category template sets ready for picker UI
- YNAB 4 Rules data ready for carousel component
- useMetrics and useOnboarding hooks ready to wire into dashboard and onboarding screens

## Self-Check: PASSED

All 12 created/modified files verified on disk. All 4 commits verified in git log.

---
*Phase: 03-budget-ideology-onboarding*
*Completed: 2026-03-26*
