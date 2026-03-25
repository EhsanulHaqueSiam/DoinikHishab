---
phase: 01-tooling-foundation
plan: 03
subsystem: i18n
tags: [i18next, react-i18next, expo-localization, intl-pluralrules, bengali, internationalization]

# Dependency graph
requires: []
provides:
  - i18next internationalization system with en/bn JSON translations
  - Device locale detection via expo-localization
  - Instant language switching via i18n.changeLanguage()
  - Bengali pluralization via @formatjs/intl-pluralrules polyfill
  - useTranslation hook from react-i18next available in all tab screens
affects: [all-future-phases, ui-components, settings, dashboard]

# Tech tracking
tech-stack:
  added: [i18next, react-i18next, expo-localization, "@formatjs/intl-pluralrules"]
  patterns: [i18next-json-translations, useTranslation-hook, synchronous-init, polyfill-force-for-hermes]

key-files:
  created:
    - src/lib/i18n/en.json
    - src/lib/i18n/bn.json
  modified:
    - src/lib/i18n/index.ts
    - src/lib/i18n/en.ts
    - src/lib/i18n/bn.ts
    - app/_layout.tsx
    - app/(tabs)/_layout.tsx
    - app/(tabs)/settings.tsx
    - app/(tabs)/index.tsx
    - app/(tabs)/accounts.tsx
    - app/(tabs)/budget.tsx
    - app/(tabs)/reports.tsx
    - app/(tabs)/transactions.tsx
    - src/stores/app-store.ts
    - package.json

key-decisions:
  - "Used polyfill-force instead of conditional polyfill for Bengali pluralization (Hermes perf issue)"
  - "Synchronous i18next init (initImmediate: false) since translations are bundled JSON"
  - "Kept en.ts and bn.ts as deprecated stubs for git history rather than deleting"
  - "Side-effect import at top of root layout ensures i18n initializes before any component"

patterns-established:
  - "i18n pattern: import { useTranslation } from 'react-i18next' then const { t } = useTranslation()"
  - "Translation keys: dot-notation namespaced (e.g., settings.language, dashboard.totalBalance)"
  - "Language names always displayed in their own script (English / bengali-script)"
  - "Language switching: call i18n.changeLanguage() + setLocale() for Zustand sync"

requirements-completed: [TOOL-05]

# Metrics
duration: 9min
completed: 2026-03-25
---

# Phase 01 Plan 03: i18next Migration Summary

**Replaced custom i18n system with i18next + react-i18next, 80+ strings in en/bn JSON, device locale detection via expo-localization, instant language switching in all tab screens**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-25T20:09:02Z
- **Completed:** 2026-03-25T20:18:05Z
- **Tasks:** 3 (2 auto + 1 checkpoint auto-approved)
- **Files modified:** 14

## Accomplishments
- Migrated all ~80 translation strings from TypeScript objects to i18next-compatible JSON format (en.json, bn.json)
- Installed and configured i18next with synchronous initialization, English fallback, and Bengali pluralization polyfill
- Wired useTranslation() into all 6 tab screens and the tab navigator layout, replacing all hardcoded English strings
- Language toggle in Settings calls i18n.changeLanguage() for instant re-render with AccessibilityInfo announcement
- Zustand locale state syncs with i18next resolved language on initialization

## Task Commits

Each task was committed atomically:

1. **Task 1: Install i18next dependencies, create JSON translations, initialize i18next** - `ec88515` (feat)
2. **Task 2: Wire i18next into Settings and all tab screens, sync Zustand locale** - `3e459c8` (feat)
3. **Task 3: Verify language switching** - Auto-approved checkpoint (no code changes)

## Files Created/Modified
- `src/lib/i18n/en.json` - English translations (80+ strings, i18next plural format)
- `src/lib/i18n/bn.json` - Bengali translations (80+ strings, Bengali plural forms)
- `src/lib/i18n/index.ts` - i18next initialization with expo-localization, polyfill-force, sync init
- `src/lib/i18n/en.ts` - Deprecated stub (redirects to en.json)
- `src/lib/i18n/bn.ts` - Deprecated stub (redirects to bn.json)
- `app/_layout.tsx` - Added side-effect i18n import at top for early initialization
- `app/(tabs)/_layout.tsx` - Tab labels use t() for translated tab names
- `app/(tabs)/settings.tsx` - All labels use t(), language toggle uses i18n.changeLanguage()
- `app/(tabs)/index.tsx` - Dashboard strings translated (quick actions, empty states, section headers)
- `app/(tabs)/accounts.tsx` - Account strings translated (net worth, add account form)
- `app/(tabs)/budget.tsx` - Budget strings translated (ready to assign, column headers, overspent)
- `app/(tabs)/reports.tsx` - Report strings translated (tab labels, section headers, empty states)
- `app/(tabs)/transactions.tsx` - Transaction strings translated (empty state)
- `src/stores/app-store.ts` - Locale initial value synced from i18n.language
- `package.json` - Added i18next, react-i18next, expo-localization, @formatjs/intl-pluralrules

## Decisions Made
- Used `polyfill-force` instead of conditional `polyfill` for @formatjs/intl-pluralrules because conditional detection is extremely slow on Hermes/Android (documented in research Pitfall 2)
- Used `initImmediate: false` for synchronous i18next initialization since translations are bundled JSON -- prevents flash of untranslated keys
- Kept old en.ts and bn.ts as deprecated stubs rather than deleting, preserving git history and preventing broken imports elsewhere
- Added side-effect import `import "../src/lib/i18n"` at the very top of root layout to ensure i18n initializes before any component renders

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all translation strings are fully wired with real content.

## Next Phase Readiness
- i18next infrastructure complete and available for all future phases to add new translation keys
- All new screens/components should use `useTranslation()` from react-i18next
- New translation keys should be added to both en.json and bn.json simultaneously
- Bengali pluralization works via CLDR rules (one/other) through the polyfill

## Self-Check: PASSED

All created files exist, all commits verified, SUMMARY.md created.

---
*Phase: 01-tooling-foundation*
*Completed: 2026-03-25*
