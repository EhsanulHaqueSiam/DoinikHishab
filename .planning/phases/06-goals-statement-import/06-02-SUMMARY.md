---
phase: 06-goals-statement-import
plan: 02
subsystem: services
tags: [statement-parser, bkash, nagad, xlsx, pdf, i18n, import]

# Dependency graph
requires: []
provides:
  - "Statement parser service with bKash/Nagad text, XLS, and PDF parsers"
  - "Transaction type mapping constants (BKASH_TYPE_MAP, NAGAD_TYPE_MAP)"
  - "Format auto-detection (bKash vs Nagad) from file content"
  - "Duplicate detection by date+amount+reference hash"
  - "Import-domain i18n keys in English and Bengali (18 keys)"
affects: [06-goals-statement-import]

# Tech tracking
tech-stack:
  added: [xlsx 0.18.5, expo-pdf-text-extract 1.0.1]
  patterns: [header-based column detection, format auto-detection heuristic, debit/credit column pattern for Nagad]

key-files:
  created:
    - src/services/statement-parser/types.ts
    - src/services/statement-parser/type-mapping.ts
    - src/services/statement-parser/bkash-parser.ts
    - src/services/statement-parser/nagad-parser.ts
    - src/services/statement-parser/xls-parser.ts
    - src/services/statement-parser/pdf-parser.ts
    - src/services/statement-parser/index.ts
    - src/services/statement-parser/bkash-parser.test.ts
    - src/services/statement-parser/nagad-parser.test.ts
    - src/services/statement-parser/pdf-parser.test.ts
    - src/services/statement-parser/index.test.ts
  modified:
    - jest.setup.js
    - package.json
    - bun.lock
    - src/lib/i18n/en.ts
    - src/lib/i18n/bn.ts
    - src/lib/i18n/en.json
    - src/lib/i18n/bn.json

key-decisions:
  - "Static import for expo-pdf-text-extract instead of dynamic import for reliable Jest mock interception"
  - "Separator detection from header row instead of first line to handle title-prefixed statements"
  - "Debit/Credit column pattern for Nagad parser determines expense/income without type mapping"

patterns-established:
  - "Header-based column detection: find header row by keyword, detect separator from header, map columns flexibly"
  - "Format auto-detection: check for provider-specific keywords in text content"
  - "Dual-column debit/credit pattern for Nagad statement parsing"

requirements-completed: [IMPT-01, IMPT-02, IMPT-03, IMPT-04, IMPT-05]

# Metrics
duration: 8min
completed: 2026-03-26
---

# Phase 06 Plan 02: Statement Parser Summary

**On-device bKash/Nagad statement parser with text/XLS/PDF support, type mapping, duplicate detection, and 18 import i18n keys**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-26T07:57:49Z
- **Completed:** 2026-03-26T08:06:00Z
- **Tasks:** 2
- **Files modified:** 18

## Accomplishments
- Built complete statement-parser service module with bKash and Nagad text parsers supporting flexible column detection
- Added XLS parser via SheetJS and PDF parser via expo-pdf-text-extract with clear password-protected error messaging
- Implemented format auto-detection, parse dispatch by MIME type, and duplicate detection by hash
- Added 18 import-domain i18n keys in both English and Bengali matching the UI-SPEC copywriting contract
- 45 tests passing across 4 test files

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies, add Jest mocks, build statement parser with PDF support and tests** - `63310be` (feat)
2. **Task 2: Import i18n keys for English and Bengali** - `710892a` (feat)

## Files Created/Modified
- `src/services/statement-parser/types.ts` - ParsedTransaction, ImportResult, StatementFormat, ParseError interfaces
- `src/services/statement-parser/type-mapping.ts` - BKASH_TYPE_MAP, NAGAD_TYPE_MAP, mapTransactionType function
- `src/services/statement-parser/bkash-parser.ts` - bKash text statement parser with flexible column detection
- `src/services/statement-parser/nagad-parser.ts` - Nagad text statement parser with debit/credit column support
- `src/services/statement-parser/xls-parser.ts` - XLS/XLSX parser via SheetJS with flexible header matching
- `src/services/statement-parser/pdf-parser.ts` - PDF text extraction with password-protected error handling
- `src/services/statement-parser/index.ts` - Main entry: detectFormat, parseStatement, detectDuplicates
- `src/services/statement-parser/bkash-parser.test.ts` - 10 tests for bKash parser
- `src/services/statement-parser/nagad-parser.test.ts` - 8 tests for Nagad parser
- `src/services/statement-parser/pdf-parser.test.ts` - 5 tests for PDF parser
- `src/services/statement-parser/index.test.ts` - 22 tests for type mapping, format detection, duplicates, dispatch
- `jest.setup.js` - Added mocks for xlsx, expo-document-picker, expo-file-system/legacy, expo-pdf-text-extract
- `package.json` - Added xlsx and expo-pdf-text-extract dependencies
- `src/lib/i18n/en.ts` - Added import namespace with 18 keys
- `src/lib/i18n/bn.ts` - Added import namespace with Bengali translations
- `src/lib/i18n/en.json` - Added import namespace to JSON
- `src/lib/i18n/bn.json` - Added import namespace to JSON

## Decisions Made
- Used static import for expo-pdf-text-extract instead of dynamic import -- dynamic imports don't work reliably with Jest mocks
- Detect tab/comma separator from the header row rather than the first line, since statements often have a title line without separators
- Nagad parser uses debit/credit columns directly to determine expense/income, falling back to type mapping only when those columns are absent

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed separator detection using header row instead of first line**
- **Found during:** Task 1 (Nagad parser tests)
- **Issue:** First line of statement is often a title (e.g., "Nagad Statement") with no tab separators, causing comma to be selected as separator for tab-separated data
- **Fix:** Moved separator detection to run after header row is found, using the header line for separator detection
- **Files modified:** src/services/statement-parser/nagad-parser.ts, src/services/statement-parser/bkash-parser.ts
- **Verification:** All Nagad and bKash tests pass
- **Committed in:** 63310be (Task 1 commit)

**2. [Rule 1 - Bug] Fixed PDF parser dynamic import to static import**
- **Found during:** Task 1 (PDF parser tests)
- **Issue:** Dynamic `await import("expo-pdf-text-extract")` bypassed Jest mock, causing extractText to return empty string and throwing password-protected error for valid inputs
- **Fix:** Changed to static `import { extractText } from "expo-pdf-text-extract"` for reliable mock interception
- **Files modified:** src/services/statement-parser/pdf-parser.ts
- **Verification:** All PDF parser tests pass including happy path, password-protected, and web platform error
- **Committed in:** 63310be (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for correct parser behavior. No scope creep.

## Issues Encountered
None beyond the auto-fixed bugs above.

## Known Stubs
None -- all parsers are fully implemented with real parsing logic.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Statement parser service is complete and tested, ready for import UI consumption (Plan 03/04)
- All i18n keys for the import domain are available in both languages
- detectFormat, parseStatement, and detectDuplicates are exported for hook/component use

## Self-Check: PASSED

All 11 created files verified. Both task commits (63310be, 710892a) confirmed in git log.

---
*Phase: 06-goals-statement-import*
*Completed: 2026-03-26*
