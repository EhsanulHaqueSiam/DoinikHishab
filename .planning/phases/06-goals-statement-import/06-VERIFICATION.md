---
phase: 06-goals-statement-import
verified: 2026-03-26T09:00:00Z
status: gaps_found
score: 9/10 must-haves verified
gaps:
  - truth: "User can import a bKash or Nagad statement and see import states with correct text"
    status: partial
    reason: "ImportScreen.tsx references 3 i18n keys that do not exist in en.ts or bn.ts: import.importing, import.successTitle, import.importMore. React-i18next will render the raw key strings on screen during the 'importing' spinner and 'success' state."
    artifacts:
      - path: "src/components/import/ImportScreen.tsx"
        issue: "Uses t(\"import.importing\"), t(\"import.successTitle\"), t(\"import.importMore\") which are missing from en.ts"
      - path: "src/lib/i18n/en.ts"
        issue: "import namespace has 'success' but not 'successTitle', has 'parsing' but not 'importing', has 'tryAnother' but not 'importMore'"
    missing:
      - "Add import.importing (e.g. \"Importing transactions...\") to src/lib/i18n/en.ts and src/lib/i18n/bn.ts"
      - "Add import.successTitle (e.g. \"Import Complete\") to src/lib/i18n/en.ts and src/lib/i18n/bn.ts"
      - "Add import.importMore (e.g. \"Import More\") to src/lib/i18n/en.ts and src/lib/i18n/bn.ts"
human_verification:
  - test: "Create a save-up goal and verify progress bar animates, status badge shows correct label, monthly contribution calculation is correct"
    expected: "Goal card shows animated progress bar in teal color, status badge (Ahead/On Track/Behind/Funded), and '৳X/month needed'"
    why_human: "Animation smoothness and visual layout cannot be verified programmatically"
  - test: "Add 2+ debts and verify strategy comparison section appears with teal border on Avalanche card"
    expected: "Strategy Comparison section renders below Debt Payoff section, Avalanche card has left teal border, delta savings line shows"
    why_human: "Conditional rendering with 2+ debts and visual border styling requires visual inspection"
  - test: "Select a TXT bKash statement file and verify the parse -> review -> import flow"
    expected: "Spinner shows during parse, review list shows transactions with checkbox, type pill, duplicate badge; import saves to MMKV"
    why_human: "Requires actual file system interaction with a real bKash statement file"
  - test: "Navigate from dashboard Goals card and from Settings Import row to verify navigation"
    expected: "Dashboard Goals card taps to /goals, Settings 'Import Statement' row taps to /import, Transactions screen Import button taps to /import"
    why_human: "Navigation behavior requires running app on device/emulator"
---

# Phase 6: Goals & Statement Import Verification Report

**Phase Goal:** Users can plan debt payoff with strategy comparison and import bKash/Nagad statements to reduce manual entry burden
**Verified:** 2026-03-26T09:00:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Save-up goals can be created, read, updated, and deleted from MMKV storage | VERIFIED | `src/services/goal-storage/index.ts` exports all 7 CRUD functions; 9/9 storage tests pass |
| 2 | Pay-down goals can be created, read, updated, and deleted from MMKV storage | VERIFIED | Same service; `savePayDownGoal`, `updatePayDownGoal`, `deletePayDownGoal` all implemented and tested |
| 3 | Amortization schedule generates correct month-by-month breakdown with integer paisa math | VERIFIED | `generateAmortization` in `goal-engine/index.ts`; 20/20 engine tests pass including final balance = 0, principal+interest = payment, 360-month cap |
| 4 | Avalanche vs snowball strategy comparison produces different interest totals and payoff dates | VERIFIED | `compareStrategies` in `goal-engine/index.ts`; test verifies avalanche total interest <= snowball total interest |
| 5 | Goal status calculation returns ahead/on_track/behind/funded based on time-proportional progress | VERIFIED | `calculateGoalStatus` uses 5% tolerance band; all 4 status values tested |
| 6 | Monthly contribution calculation returns (target - current) / remaining months | VERIFIED | `calculateMonthlyContribution` uses `Math.ceil`; edge cases tested (funded, current month) |
| 7 | Goal budget categories are generated as 'Goal: [name]' entries | VERIFIED | `getGoalBudgetCategories` maps goals to `{ name: "Goal: ${goal.name}", ... }`; budget.tsx consumes `goalBudgetCategories` from `useGoals` |
| 8 | bKash/Nagad statement text can be parsed into structured transactions on-device | VERIFIED | `parseBkashText`, `parseNagadText` implemented with flexible column detection; 18 parser tests pass |
| 9 | PDF/XLS/TXT dispatch routes correctly and password-protected PDFs throw clear error | VERIFIED | `parseStatement` dispatches by mimeType; `parsePDF` throws human-readable error for empty extraction; 22 index tests pass |
| 10 | Import states (importing spinner, success screen) render correct text | FAILED | `ImportScreen.tsx` uses `t("import.importing")`, `t("import.successTitle")`, `t("import.importMore")` — none exist in `en.ts`; these states will render raw key strings |

**Score:** 9/10 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/services/goal-storage/types.ts` | SaveUpGoal, PayDownGoal, GoalDataStore, GoalStatus, AmortizationRow, StrategyResult, GoalBudgetCategory | VERIFIED | All 7 types exported; 84 lines |
| `src/services/goal-storage/index.ts` | MMKV CRUD for goals and debts | VERIFIED | 80 lines; all 7 functions exported; imports getJSON/setJSON from "../storage" |
| `src/services/goal-engine/index.ts` | Pure calculation functions | VERIFIED | 227 lines; all 5 functions exported; imports types from goal-storage |
| `src/services/statement-parser/types.ts` | ParsedTransaction, ImportResult, StatementFormat, ParseError | VERIFIED | All 4 types exported |
| `src/services/statement-parser/type-mapping.ts` | BKASH_TYPE_MAP, NAGAD_TYPE_MAP, mapTransactionType | VERIFIED | All 3 exports present; 8 bKash types, 7 Nagad types mapped |
| `src/services/statement-parser/bkash-parser.ts` | parseBkashText | VERIFIED | 134 lines; real parsing logic with header detection, column matching, date normalization |
| `src/services/statement-parser/nagad-parser.ts` | parseNagadText | VERIFIED | Full implementation with debit/credit column pattern |
| `src/services/statement-parser/xls-parser.ts` | parseXLS | VERIFIED | Uses xlsx library with flexible header mapping |
| `src/services/statement-parser/pdf-parser.ts` | parsePDF | VERIFIED | Static import of expo-pdf-text-extract; password-protected error handling; web platform guard |
| `src/services/statement-parser/index.ts` | parseStatement, detectDuplicates, detectFormat | VERIFIED | All 3 exported; PDF/XLS/TXT dispatch; hash-based duplicate detection |
| `src/components/goals/GoalCard.tsx` | Save-up goal card with progress bar and status badge (min 40 lines) | VERIFIED | 78 lines; calculates status + monthly contribution; renders GoalProgress |
| `src/components/goals/GoalForm.tsx` | Bottom sheet form for goal creation (min 80 lines) | VERIFIED | 219 lines; BottomSheet with validation; MOCK_ACCOUNTS intentional (backend offline) |
| `src/components/goals/DebtCard.tsx` | Pay-down card with expandable amortization (min 40 lines) | VERIFIED | 87 lines; toggles AmortizationTable; shows payoff date from amortization length |
| `src/components/goals/StrategyComparison.tsx` | Side-by-side avalanche vs snowball (min 50 lines) | VERIFIED | 101 lines; recommended border on avalanche; delta savings row |
| `src/hooks/use-goals.ts` | Hook with MMKV CRUD and goalBudgetCategories | VERIFIED | 92 lines; refreshKey pattern; imports from goal-storage and goal-engine |
| `app/goals/index.tsx` | Goals list screen route (min 60 lines) | VERIFIED | 134 lines; 3 sections (savings, debt, strategy); empty states; bottom sheet forms |
| `app/goals/[id].tsx` | Goal detail screen route (min 50 lines) | VERIFIED | 68 lines; edit/delete handlers; not-found guard |
| `src/components/import/FilePickerButton.tsx` | File picker card with upload icon (min 20 lines) | VERIFIED | 47 lines; copyToCacheDirectory handled in useImport hook |
| `src/components/import/ImportReviewList.tsx` | FlashList with select/deselect (min 40 lines) | VERIFIED | 80 lines; FlashList of ImportReviewRow |
| `src/components/import/ImportReviewRow.tsx` | Row with checkbox, type pill, duplicate badge (min 40 lines) | VERIFIED | 114 lines; full checkbox + TypeMappingPill + Duplicate badge |
| `src/components/import/ImportScreen.tsx` | Main import state machine UI (min 60 lines) | STUB-PARTIAL | 138 lines, substantive — but 3 i18n keys missing (import.importing, import.successTitle, import.importMore) causing raw key display in importing/success states |
| `src/hooks/use-import.ts` | 7-state import machine | VERIFIED | 269 lines; full pick->parse->review->import state machine; PDF/XLS/TXT dispatch |
| `app/import/index.tsx` | Import screen route (min 15 lines) | VERIFIED | 27 lines; renders ImportScreen with header |
| `src/components/goals/GoalDashboardCard.tsx` | Dashboard widget (min 40 lines) | VERIFIED | 98 lines; uses useGoals; navigates to /goals |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `src/services/goal-storage/index.ts` | `src/services/storage/index.ts` | getJSON/setJSON imports | VERIFIED | `import { getJSON, setJSON } from "../storage"` at line 7 |
| `src/services/goal-engine/index.ts` | `src/services/goal-storage/types.ts` | type imports | VERIFIED | `import type { AmortizationRow, GoalBudgetCategory, GoalStatus, SaveUpGoal, StrategyResult } from "../goal-storage/types"` |
| `src/hooks/use-goals.ts` | `src/services/goal-storage/index.ts` | getGoals import | VERIFIED | `import { getGoals, savePayDownGoal, saveSaveUpGoal, ... } from "../services/goal-storage"` |
| `src/hooks/use-goals.ts` | `src/services/goal-engine/index.ts` | calculateGoalStatus, getGoalBudgetCategories | VERIFIED | `import { getGoalBudgetCategories } from "../services/goal-engine"` |
| `app/goals/index.tsx` | `src/hooks/use-goals.ts` | useGoals hook | VERIFIED | `import { useGoals } from "../../src/hooks/use-goals"` |
| `src/components/goals/GoalCard.tsx` | `src/components/goals/GoalProgress.tsx` | GoalProgress component | VERIFIED | `import { GoalProgress } from "./GoalProgress"` |
| `src/hooks/use-import.ts` | `src/services/statement-parser/index.ts` | parseStatement, detectDuplicates | VERIFIED | `import { detectDuplicates, parseStatement, ... } from "../services/statement-parser"` |
| `src/hooks/use-import.ts` | `expo-document-picker` | getDocumentAsync | VERIFIED | `import * as DocumentPicker from "expo-document-picker"` at line 11 |
| `src/hooks/use-import.ts` | `expo-file-system/legacy` | readAsStringAsync | VERIFIED | `import { EncodingType, readAsStringAsync } from "expo-file-system/legacy"` at line 12 |
| `src/components/import/ImportScreen.tsx` | `src/hooks/use-import.ts` | useImport hook | VERIFIED | `import { useImport } from "../../hooks/use-import"` |
| `app/(tabs)/index.tsx` | `src/components/goals/GoalDashboardCard.tsx` | GoalDashboardCard | VERIFIED | `import { GoalDashboardCard } from "../../src/components/goals/GoalDashboardCard"` at line 8; rendered at line 139 |
| `src/components/goals/GoalDashboardCard.tsx` | `src/hooks/use-goals.ts` | useGoals hook | VERIFIED | `import { useGoals } from "../../hooks/use-goals"` |
| `app/(tabs)/budget.tsx` | `src/hooks/use-goals.ts` | goalBudgetCategories | VERIFIED | `import { useGoals } from "../../src/hooks/use-goals"` at line 13; `goalBudgetCategories` destructured and rendered at line 170 |
| `app/(tabs)/transactions.tsx` | `src/services/storage/index.ts` | getJSON("import:transactions") | VERIFIED | `import { getJSON } from "../../src/services/storage"` at line 13; reads "import:transactions" at line 64 |
| `app/(tabs)/settings.tsx` | `/import` route | router.push | VERIFIED | `onPress={() => router.push("/import" as any)}` at line 115 |
| `src/services/statement-parser/index.ts` | `src/services/statement-parser/bkash-parser.ts` | parseBkashText | VERIFIED | `import { parseBkashText } from "./bkash-parser"` at line 9 |
| `src/services/statement-parser/index.ts` | `src/services/statement-parser/nagad-parser.ts` | parseNagadText | VERIFIED | `import { parseNagadText } from "./nagad-parser"` at line 10 |
| `src/services/statement-parser/index.ts` | `src/services/statement-parser/pdf-parser.ts` | parsePDF | VERIFIED | `import { parsePDF } from "./pdf-parser"` at line 11 |
| `src/services/statement-parser/bkash-parser.ts` | `src/services/statement-parser/type-mapping.ts` | BKASH_TYPE_MAP | VERIFIED | `import { mapTransactionType } from "./type-mapping"` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `app/goals/index.tsx` | saveUpGoals, payDownGoals | `useGoals()` -> `getGoals()` -> `getJSON("goals:data")` (MMKV) | Yes — reads from persistent MMKV store | FLOWING |
| `src/components/goals/GoalDashboardCard.tsx` | saveUpGoals, payDownGoals | `useGoals()` -> MMKV | Yes — live MMKV data | FLOWING |
| `app/(tabs)/budget.tsx` | goalBudgetCategories | `useGoals()` -> `getGoalBudgetCategories(saveUpGoals)` (pure function) | Yes — computed from live MMKV goals | FLOWING |
| `app/(tabs)/transactions.tsx` | imported transactions | `getJSON<ParsedTransaction[]>("import:transactions")` (MMKV) | Yes — reads from MMKV written by useImport.importSelected | FLOWING |
| `src/components/goals/GoalDetailView.tsx` | MOCK_CONTRIBUTIONS | Hardcoded array | No — contribution history is mock | STATIC (intentional — backend offline per project constraint) |
| `src/components/goals/GoalForm.tsx` | MOCK_ACCOUNTS | Hardcoded array | No — accounts from Convex | STATIC (intentional — Convex offline per project constraint) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Goal service tests (29 tests) | `bun run test -- src/services/goal-storage/index.test.ts src/services/goal-engine/index.test.ts --no-coverage` | 29 passed, 0 failed | PASS |
| Statement parser tests (45 tests) | `bun run test -- src/services/statement-parser/ --no-coverage` | 45 passed, 0 failed | PASS |
| Full test suite (320 tests) | `bun run test -- --no-coverage` | 320 passed, 45 suites | PASS |
| xlsx dependency installed | grep in package.json | `"xlsx": "^0.18.5"` found | PASS |
| expo-pdf-text-extract installed | grep in package.json | `"expo-pdf-text-extract": "^1.0.1"` found | PASS |
| `export useGoals` hook | grep exports | Exported as named function from `src/hooks/use-goals.ts` | PASS |
| Missing i18n keys | grep `import.importing\|successTitle\|importMore` in en.ts | Not found | FAIL — 3 keys absent |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| GOAL-01 | 06-01, 06-03 | Save-up goals with target amount, target date, linked account, monthly contribution | SATISFIED | SaveUpGoal type, GoalCard, GoalForm, calculateMonthlyContribution |
| GOAL-02 | 06-01, 06-03, 06-05 | Save-up goal status tracking: on-track, behind, ahead with progress bars | SATISFIED | calculateGoalStatus with 5% tolerance; GoalProgress animated bar; GoalDashboardCard |
| GOAL-03 | 06-01, 06-03 | Pay-down goals with loan balance, APR, minimum payment, amortization schedule | SATISFIED | PayDownGoal type, DebtCard with AmortizationTable, generateAmortization |
| GOAL-04 | 06-01, 06-03 | Avalanche vs snowball strategy comparison showing total interest saved and payoff date difference | SATISFIED | compareStrategies, StrategyComparison component with recommended teal border and delta row |
| GOAL-05 | 06-01, 06-03, 06-05 | Goal contributions appear as budget category line items | SATISFIED | getGoalBudgetCategories, useGoals.goalBudgetCategories, budget.tsx renders "Goals" group |
| IMPT-01 | 06-02, 06-04 | bKash PDF statement parser handling password-protected PDFs | SATISFIED | parsePDF with expo-pdf-text-extract; password-protected error thrown when extraction empty |
| IMPT-02 | 06-02, 06-04 | Nagad statement parser supporting XLS, PDF, and TXT formats | SATISFIED | parseNagadText (TXT), parseXLS with provider hint, parsePDF -> nagad detection |
| IMPT-03 | 06-02, 06-04 | Transaction type mapping (bKash Cash Out=expense, Cash In=income, Send Money=user-decided) | SATISFIED | BKASH_TYPE_MAP maps all known types; TypeMappingPill allows user to toggle per row |
| IMPT-04 | 06-02, 06-04 | Deduplication check against existing transactions by date+amount+reference | SATISFIED | detectDuplicates with hash `${date}|${amount}|${reference}`; duplicates unchecked by default |
| IMPT-05 | 06-02, 06-04 | All statement parsing happens on-device — never upload files to server | SATISFIED | No fetch/axios/network calls in any parser file; copyToCacheDirectory: true for Android URI safety |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/import/ImportScreen.tsx` | 64 | `t("import.importing")` — key missing in en.ts | Warning | "importing" spinner shows raw key string `"import.importing"` instead of localized text |
| `src/components/import/ImportScreen.tsx` | 114 | `t("import.successTitle")` — key missing in en.ts | Warning | Success state title shows raw key string `"import.successTitle"` |
| `src/components/import/ImportScreen.tsx` | 116 | `t("import.importMore")` — key missing in en.ts | Warning | Success state button shows raw key string `"import.importMore"` |
| `src/components/goals/GoalDetailView.tsx` | 25-29 | MOCK_CONTRIBUTIONS hardcoded array | Info | Contribution history shows 3 fixed entries (Jan-Mar 2026); intentional — backend offline |
| `src/components/goals/GoalForm.tsx` | 17-21 | MOCK_ACCOUNTS hardcoded array | Info | Linked account shows Savings/Cash/Bank pills only; intentional — Convex offline |

### Human Verification Required

#### 1. Goal Creation and Progress Tracking

**Test:** Open the app, navigate to the Goals screen from the dashboard card. Create a save-up goal with name "Eid Fund", target amount 50000 Taka, target date 6 months out, linked account "Savings".
**Expected:** Goal card appears with animated teal progress bar, status badge ("On Track" or "Behind"), and monthly contribution text (e.g., "৳X/month needed"). Tapping the card navigates to the detail screen.
**Why human:** Animation smoothness, visual layout correctness, and BDT formatting require visual inspection.

#### 2. Debt Payoff Strategy Comparison

**Test:** Add 2 debts with different APR values. Verify the Strategy Comparison section appears below the Debt Payoff section.
**Expected:** Avalanche card has a left teal border and "Recommended" badge. Delta row shows "You save ৳X with Avalanche and pay off N months earlier". Snowball card has no border.
**Why human:** Conditional rendering (only with 2+ debts) and visual styling require device inspection.

#### 3. Statement Import End-to-End

**Test:** From Settings > "Import Statement", tap the file picker, select a TXT bKash statement file. Review the parsed transactions.
**Expected:** Parsing spinner shows, then review list renders rows with checkboxes, type pills (expense/income toggleable), and yellow "Duplicate" badges for any duplicates. Import button shows selected count. After import, toast appears and transactions show in the Transactions tab.
**Why human:** Requires an actual bKash statement file and native file picker interaction on device.

#### 4. i18n Key Missing — Success State Visual Check

**Test:** Complete an import successfully and observe the success screen.
**Expected:** Should show "Import Complete" title and "Import More" button. Due to the missing i18n keys (import.successTitle, import.importMore), these will display as raw key strings.
**Why human:** Confirms the anti-pattern is visible in the UI. This is a gap that needs fixing.

### Gaps Summary

One gap was found affecting the success and importing states of the import flow.

The `ImportScreen.tsx` component references three i18n translation keys (`import.importing`, `import.successTitle`, `import.importMore`) that were added to the component but not to the translation files `en.ts` or `bn.ts`. The `en.ts` file has `import.parsing` (but not `importing`), `import.success` (but not `successTitle`), and `import.tryAnother` (but not `importMore`). React-i18next falls back to rendering the key string when a key is missing, so the "importing" spinner shows `"import.importing"` and the success screen shows `"import.successTitle"` and `"import.importMore"` as raw text.

This is a Warning-level issue — the core import parsing, duplicate detection, and transaction persistence work correctly. Only the UX text in two states (importing spinner and success screen) is broken. The fix requires adding 3 keys to both `en.ts` and `bn.ts`.

The two intentional stubs (`MOCK_CONTRIBUTIONS` in GoalDetailView and `MOCK_ACCOUNTS` in GoalForm) are documented and appropriate given the Convex backend offline constraint. They do not block phase goal achievement.

---

_Verified: 2026-03-26T09:00:00Z_
_Verifier: Claude (gsd-verifier)_
