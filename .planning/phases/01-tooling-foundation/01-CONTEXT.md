# Phase 1: Tooling Foundation - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up developer infrastructure that accelerates all subsequent phases: Biome for linting/formatting with strict enforcement, Jest + RNTL test harness with full sample suite and 80% coverage threshold, and i18next internationalization replacing the custom i18n system. No feature work — tooling only.

</domain>

<decisions>
## Implementation Decisions

### Biome Linting & Formatting
- **D-01:** Strict from day one — enable all recommended Biome rules immediately and fix every existing violation in one cleanup commit. No incremental enablement.
- **D-02:** Enforcement via both CI check AND pre-commit hook — belt and suspenders approach. `bun run lint` in CI, lefthook for pre-commit auto-formatting.
- **D-03:** Use lefthook (Go binary, zero npm deps, YAML config) for pre-commit hooks — not husky/lint-staged.

### Test Infrastructure (Jest + RNTL)
- **D-04:** Co-located test files — `Button.test.tsx` next to `Button.tsx`, `currency.test.ts` next to `currency.ts`. No `__tests__/` directories.
- **D-05:** Exclude test file patterns from Metro bundler to prevent test code in production bundles.
- **D-06:** Full sample test suite covering all patterns: utility function unit tests (currency, date, budget-engine), component tests with RNTL, hook tests, Zustand store tests, and Convex function tests with mocking.
- **D-07:** Both `bun run test` (single run for CI) and `bun run test:watch` (re-runs on file changes for dev) scripts.
- **D-08:** Coverage reporting enabled with 80% threshold across src/ AND convex/ directories. No separate thresholds — one high bar for all code.
- **D-09:** Coverage scope includes src/lib/, src/services/, src/hooks/, src/components/, src/stores/, and convex/ functions.

### i18n Migration (i18next + expo-localization)
- **D-10:** Full migration — replace custom `useTranslation()` hook entirely with i18next + react-i18next. Clean break, no adapter pattern, no coexistence of two systems.
- **D-11:** One JSON file per language (en.json, bn.json) with nested keys. No namespace splitting — current ~80 strings don't warrant it. Add namespaces when translations exceed ~200 keys.
- **D-12:** Instant language switching — no app restart required. react-i18next's useTranslation re-renders all text on locale change.
- **D-13:** Device locale detection on first launch via expo-localization, with fallback to English if Bengali not detected.

### Claude's Discretion
- Jest configuration details (transform, moduleNameMapper, setup files)
- Convex test mocking strategy (mock useQuery/useMutation or use Convex test harness)
- Bengali pluralization polyfill approach (intl-pluralrules)
- Biome rule selection (which specific rules from recommended set)
- lefthook configuration specifics

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, key decisions (Jest over Vitest, Biome over ESLint)
- `.planning/REQUIREMENTS.md` — TOOL-01 (Biome), TOOL-02 (Jest + RNTL), TOOL-05 (i18next + expo-localization) specifications
- `.planning/ROADMAP.md` §Phase 1 — Success criteria (4 conditions that must be TRUE)

### Codebase Analysis
- `.planning/codebase/TESTING.md` — Current testing state (zero tests), testable patterns, mock opportunities, recommended test examples
- `.planning/codebase/CONCERNS.md` — Known issues (type safety, error handling) that tests should cover
- `.planning/codebase/CONVENTIONS.md` — Naming patterns, import organization, code style that Biome config must respect

### Existing i18n System (to be replaced)
- `src/lib/i18n/index.ts` — Custom useTranslation() hook, nested key resolution, Zustand locale binding
- `src/lib/i18n/en.ts` — English translations (~80 strings, nested structure)
- `src/lib/i18n/bn.ts` — Bengali translations (mirror of en.ts)

### State Flags
- `.planning/STATE.md` — "Biome will report many errors on first run" (accepted: fix all upfront), "Bengali pluralization needs intl-pluralrules polyfill"

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/currency.ts` — Pure utility functions (paisaToTaka, formatCurrency, toBengaliNumerals) — ideal first unit tests
- `src/lib/date.ts` — Date formatting functions — ideal first unit tests
- `src/services/budget-engine/index.ts` — Pure budget calculation functions (calculateReadyToAssign, calculateAvailable, calculateAgeOfMoney) — critical to test
- `src/stores/app-store.ts` — Zustand store with create/read/update actions — testable with store.getState()
- `src/stores/ui-store.ts` — UI state store — simple state toggle tests
- `src/components/ui/Button.tsx` — Component with variants — good first RNTL test target
- `src/hooks/use-transactions.ts` — Hook with filter logic — requires renderHook from RNTL

### Established Patterns
- Zustand for state management — stores are pure and testable without providers
- Convex hooks (useQuery, useMutation) used in components and custom hooks — need mock patterns
- NativeWind className-based styling — RNTL tests need NativeWind test setup or style assertion approach
- Path aliases (@lib/*, @components/*, etc.) — Jest moduleNameMapper must mirror tsconfig paths

### Integration Points
- `package.json` scripts — add `lint`, `lint:fix`, `test`, `test:watch`, `format` commands
- `metro.config.js` — add test file exclusion patterns
- `tsconfig.json` — path aliases must be mirrored in Jest config
- `.github/workflows/build.yml` — add lint and test steps to CI pipeline
- `src/stores/app-store.ts` — locale state currently drives custom i18n, will need to integrate with i18next

</code_context>

<specifics>
## Specific Ideas

- User wants high test coverage (80%) from day one across both frontend and backend code — this is an ambitious but intentional choice
- Strict Biome enforcement with no exceptions — fix all violations immediately rather than incremental cleanup
- lefthook chosen specifically for zero npm dependency footprint and Bun compatibility
- Full i18n migration preferred over adapter/wrapper — clean break from custom system

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-tooling-foundation*
*Context gathered: 2026-03-26*
