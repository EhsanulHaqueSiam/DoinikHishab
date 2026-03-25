---
phase: 01-tooling-foundation
plan: 01
subsystem: infra
tags: [biome, linting, formatting, lefthook, pre-commit, ci, github-actions]

# Dependency graph
requires: []
provides:
  - Biome 2.4.9 linting and formatting with strict recommended rules
  - Pre-commit auto-formatting via lefthook
  - CI lint job gating all builds
  - lint, lint:fix, and format package.json scripts
affects: [01-02, 01-03, all-future-phases]

# Tech tracking
tech-stack:
  added: ["@biomejs/biome 2.4.9", "lefthook 2.1.4"]
  patterns: ["Biome check in CI pipeline", "lefthook pre-commit auto-format", "organized imports via Biome assist"]

key-files:
  created: ["biome.json", "lefthook.yml"]
  modified: ["package.json", ".github/workflows/build.yml", "60+ source files formatted"]

key-decisions:
  - "Used Biome 2.4.9 (latest stable) with schema-validated configuration"
  - "Biome 2.x files.ignore replaced with negation pattern in includes (!convex/_generated/**)"
  - "37 noExplicitAny warnings left as non-blocking (Expo Router typed routes and Convex untyped results)"
  - "lefthook installed as npm dev dep (system binary not available on Arch)"

patterns-established:
  - "Biome check --write on staged files before every commit"
  - "CI lint gate: all build jobs require lint to pass first"
  - "Import organization enforced by Biome assist/source/organizeImports"

requirements-completed: [TOOL-01]

# Metrics
duration: 8min
completed: 2026-03-25
---

# Phase 01 Plan 01: Biome Linting & Formatting Summary

**Biome 2.4.9 with strict recommended rules, lefthook pre-commit auto-formatting, and CI lint gate on all builds**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-25T20:09:14Z
- **Completed:** 2026-03-25T20:17:42Z
- **Tasks:** 2
- **Files modified:** 68

## Accomplishments
- Biome 2.4.9 installed with strict recommended rules matching project conventions (2-space indent, double quotes, semicolons, 100-char line width)
- All auto-fixable violations resolved in one pass: 60+ files reformatted, imports organized, lint errors fixed
- lefthook pre-commit hook auto-formats staged files before every commit
- CI pipeline lint job gates typecheck, web, and android builds (belt-and-suspenders per D-02)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Biome and create configuration with strict rules** - `c6bc4cd` (feat)
2. **Task 2: Set up lefthook pre-commit hook and add CI lint/test jobs** - `f241268` (chore)

## Files Created/Modified
- `biome.json` - Biome configuration with strict recommended rules, scoped to app/src/convex
- `lefthook.yml` - Pre-commit hook running Biome check --write on staged files
- `package.json` - Added lint, lint:fix, format scripts and @biomejs/biome + lefthook dev dependencies
- `.github/workflows/build.yml` - Added lint job, all builds depend on it
- `app/**/*.tsx` - Reformatted and imports organized (20 files)
- `src/**/*.ts(x)` - Reformatted and imports organized (25 files)
- `convex/**/*.ts` - Reformatted and imports organized (13 files)

## Decisions Made
- Used Biome 2.4.9 (latest) instead of 2.4.8 (plan specified). The schema URL matches the installed version.
- Biome 2.x removed `files.ignore` key. Used negation pattern `!convex/_generated/**` in `includes` array instead.
- Left 37 `noExplicitAny` warnings as non-blocking (exit code 0). These are intentional patterns: Expo Router typed routes (`as any` on route strings), Convex query results without proper types, and platform CSS workaround. Fixing them requires deep type refactoring beyond this plan's scope.
- Installed lefthook as npm dev dependency since system binary was not available on Arch Linux.
- Enabled VCS integration in Biome config (uses .gitignore for file exclusion).
- Enabled Biome assist with organizeImports to auto-sort imports.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed array index keys in React components**
- **Found during:** Task 1 (fixing lint errors)
- **Issue:** 4 components used array index as React key prop (noArrayIndexKey error)
- **Fix:** AmountPad uses row.join("-"), SpendingCharts use category.name, QuickChips uses chip.label
- **Files modified:** src/components/transaction/AmountPad.tsx, src/components/dashboard/QuickChips.tsx, src/components/dashboard/SpendingChart.tsx, src/components/reports/SpendingChart.tsx
- **Verification:** bun run lint exits 0 with no noArrayIndexKey errors
- **Committed in:** c6bc4cd (Task 1 commit)

**2. [Rule 1 - Bug] Replaced non-null assertions with safe fallbacks**
- **Found during:** Task 1 (fixing lint errors)
- **Issue:** Non-null assertions (!) used where null checks were more appropriate
- **Fix:** Replaced `PROVIDERS.find(...)!` with `?? PROVIDERS[0]` and `txn.payeeId!` with `?? ""`
- **Files modified:** app/ai/settings.tsx, convex/reports.ts
- **Verification:** No noNonNullAssertion warnings remain
- **Committed in:** c6bc4cd (Task 1 commit)

**3. [Rule 1 - Bug] Removed unused interface and prefixed unused parameter**
- **Found during:** Task 1 (fixing lint errors)
- **Issue:** Unused `UncategorizedTransaction` interface and unused `available` parameter
- **Fix:** Removed interface from convex/ai/categorize.ts, prefixed param as `_available` in AssignMoney.tsx
- **Files modified:** convex/ai/categorize.ts, src/components/budget/AssignMoney.tsx
- **Verification:** No unused variable/parameter warnings remain
- **Committed in:** c6bc4cd (Task 1 commit)

**4. [Rule 3 - Blocking] Adapted biome.json for Biome 2.x schema**
- **Found during:** Task 1 (creating biome.json)
- **Issue:** Plan's biome.json used `files.ignore` key which doesn't exist in Biome 2.x
- **Fix:** Used `!convex/_generated/**` negation pattern in `includes` array, added VCS integration for .gitignore support
- **Files modified:** biome.json
- **Verification:** Biome parses config without errors, lint runs successfully
- **Committed in:** c6bc4cd (Task 1 commit)

---

**Total deviations:** 4 auto-fixed (3 bug fixes, 1 blocking schema issue)
**Impact on plan:** All auto-fixes necessary for correctness and Biome 2.x compatibility. No scope creep.

## Issues Encountered
- Biome 2.x schema differs from plan's assumed configuration (no `files.ignore` key). Resolved by using negation patterns and VCS integration.
- lefthook install required `--force` flag due to existing `core.hooksPath` git config pointing to the repo's hooks directory.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Biome linting foundation complete. All subsequent commits will be auto-formatted.
- CI pipeline enforces lint on every push to main/master.
- Ready for 01-02 (test infrastructure) and 01-03 (i18n migration).

## Self-Check: PASSED

All files exist: biome.json, lefthook.yml, package.json, .github/workflows/build.yml, 01-01-SUMMARY.md
All commits exist: c6bc4cd (Task 1), f241268 (Task 2)

---
*Phase: 01-tooling-foundation*
*Completed: 2026-03-25*
