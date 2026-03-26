---
phase: 03-budget-ideology-onboarding
verified: 2026-03-26T01:36:20Z
status: gaps_found
score: 6/10 must-haves verified
re_verification: false
gaps:
  - truth: "Sinking funds section appears above regular category groups with 'True Expenses' header and fund rows"
    status: failed
    reason: "SinkingFundSection filters templates by f.preSelected, but the SinkingFundTemplate interface and all data objects use 'monthsToTarget'/'targetAmount' field names — there is no 'preSelected' field. The filter always returns an empty array, so the section always renders the empty-state ('No True Expenses yet') rather than the 4 Bangladeshi sinking fund rows."
    artifacts:
      - path: "src/components/budget/SinkingFundSection.tsx"
        issue: "Line 20: filter(f => f.preSelected) evaluates to f.undefined — always empty. Line 49/57: accesses fund.defaultMonths and fund.defaultTargetPaisa which don't exist on the type."
      - path: "src/services/mock-data/index.ts"
        issue: "SinkingFundTemplate interface uses { targetAmount, monthsToTarget } not { defaultTargetPaisa, defaultMonths, preSelected } as expected by SinkingFundSection and SinkingFundRow."
      - path: "src/components/budget/SinkingFundRow.tsx"
        issue: "Lines 32-33: accesses template.defaultMonths which doesn't exist in SinkingFundTemplate — TypeScript error TS2339, runtime value is undefined causing NaN in expectedProgress."
    missing:
      - "Add 'preSelected: boolean', 'defaultTargetPaisa: number', 'defaultMonths: number' fields to SinkingFundTemplate interface in src/services/mock-data/index.ts and update data objects, OR update SinkingFundSection/SinkingFundRow to use the existing field names (targetAmount, monthsToTarget)"

  - truth: "Each sinking fund row shows progress bar with teal fill on-track and saffron fill behind, plus 'Suggested: X/month' text"
    status: failed
    reason: "SinkingFundRow is substantively implemented with correct progress bar logic and calculateSinkingFundSuggest integration, but it never renders in practice because SinkingFundSection's preSelected filter always returns empty (see above gap). Additionally, template.defaultMonths accessed on line 32 is always undefined, causing NaN status classification."
    artifacts:
      - path: "src/components/budget/SinkingFundRow.tsx"
        issue: "Runtime: template.defaultMonths is undefined, elapsedMonths = NaN, expectedProgress = NaN, status always evaluates to 'on_track' (NaN >= NaN is false, but NaN >= 1 is also false, so falls to else branch). This is a latent bug even when rows render."
    missing:
      - "Fix SinkingFundTemplate field name mismatch (see above gap) to unblock row rendering"

  - truth: "RuleTip cards can be dismissed permanently via MMKV persistence"
    status: failed
    reason: "RuleTip.tsx imports isTipDismissed and dismissTip from src/services/onboarding but these functions are not exported from onboarding/index.ts. TypeScript reports TS2305 compilation errors. At runtime (Metro bundler), the import would resolve to undefined functions, causing a runtime crash when a user taps 'Got it'. Tests pass only because RuleTip.test.tsx mocks the entire onboarding module."
    artifacts:
      - path: "src/services/onboarding/index.ts"
        issue: "Missing exports: isTipDismissed(ruleId: string): boolean and dismissTip(ruleId: string): void — these are called by RuleTip.tsx but never implemented."
      - path: "src/components/budget/RuleTip.tsx"
        issue: "Line 4: imports isTipDismissed and dismissTip from '../../services/onboarding' — TypeScript TS2305 error, runtime crash on dismiss."
    missing:
      - "Add isTipDismissed(ruleId: string): boolean and dismissTip(ruleId: string): void to src/services/onboarding/index.ts using MMKV key 'tip_dismissed_{ruleId}'"

  - truth: "User sees Days of Buffering metric computed from their balance and spending history"
    status: partial
    reason: "The useMetrics hook returns hardcoded values (ageOfMoney: 25, daysOfBuffering: 45) rather than calling calculateDaysOfBuffering from the budget engine. The plan explicitly required mock inflows/outflows to be passed through the engine functions. The key_link from use-metrics to budget-engine is completely absent (no import from budget-engine in use-metrics.ts). The metric IS displayed, but it is not computed — it is a static constant."
    artifacts:
      - path: "src/hooks/use-metrics.ts"
        issue: "Returns hardcoded { ageOfMoney: 25, ageOfMoneyTrend: 'improving', daysOfBuffering: 45, lookbackDays: 90 } with no imports from budget-engine. calculateDaysOfBuffering and calculateAgeOfMoney are never called."
    missing:
      - "Wire use-metrics.ts to use calculateAgeOfMoney and calculateDaysOfBuffering with deterministic mock inflows/outflows as specified in the plan (the plan's Task 2 action section provides the full implementation)"
human_verification:
  - test: "Visual: budget screen sinking fund section"
    expected: "After fixing the preSelected/field-name gap, the 'True Expenses' section should render 4 rows (Eid Fund, School Fees, Wedding Gifts, Medical Reserve) with animated progress bars at varying fill levels and 'Suggested: Tk X/month' text below each bar"
    why_human: "Cannot verify animated progress bar fill colors (teal vs saffron) and animation behavior programmatically"
  - test: "Visual: onboarding flow end-to-end"
    expected: "First launch redirects to /onboarding/rules. Bengali/English toggle changes all text. StepIndicator dots animate between screens. Completing Step 5 navigates to dashboard and does not re-show onboarding on refresh."
    why_human: "Navigation flow, animation, and MMKV persistence across app restarts requires live device/browser testing"
  - test: "RuleTip dismiss persistence after fix"
    expected: "Tapping 'Got it' on a rule tip dismisses it with a collapse animation and it does not reappear after navigating away and returning to the budget screen"
    why_human: "MMKV read-after-write behavior and animation cannot be verified programmatically"
---

# Phase 3: Budget Ideology and Onboarding Verification Report

**Phase Goal:** Users understand and practice YNAB's envelope budgeting philosophy through culturally relevant sinking funds, financial health metrics, and a guided onboarding experience
**Verified:** 2026-03-26T01:36:20Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User sees Days of Buffering metric displayed on dashboard | ✓ VERIFIED | MetricsCard renders hardcoded 45 days via useMetrics, displayed in two-column card below BalanceCard |
| 2 | User sees Age of Money with trend arrow on dashboard | ✓ VERIFIED | MetricsCard imports TrendingUp/TrendingDown icons, displays ageOfMoney with directional arrow |
| 3 | Sinking funds section appears with 'True Expenses' header and fund rows | ✗ FAILED | SinkingFundSection.filter(f => f.preSelected) always returns [] — `preSelected` field absent from SinkingFundTemplate type and data. Empty state always shown. |
| 4 | Each sinking fund row shows teal/saffron progress bar + auto-suggest | ✗ FAILED | SinkingFundRow implementation is correct but never renders (blocked by preSelected filter) |
| 5 | ReadyToAssignHero shows as hero banner with teal/red glow states | ✓ VERIFIED | text-hero font, shadow() glow in positive and negative states, i18n subtitles, integrated in budget.tsx |
| 6 | RuleTip cards can be permanently dismissed via MMKV | ✗ FAILED | isTipDismissed/dismissTip missing from onboarding service — TypeScript TS2305 errors, runtime crash on dismiss |
| 7 | First-time user is redirected to onboarding flow | ✓ VERIFIED | app/_layout.tsx checks isOnboardingComplete() and redirects to /onboarding/rules via useEffect |
| 8 | User can complete 5-step onboarding with StepIndicator progress | ✓ VERIFIED | All 6 files exist, StepIndicator in layout, RuleCarousel in rules.tsx, CategoryTemplateSelector in categories.tsx, TextInput+800000 paisa in assign.tsx, advance(4)+complete() in transaction.tsx |
| 9 | Days of Buffering is computed from balance and spending history | ✗ PARTIAL | useMetrics returns hardcoded constants — calculateDaysOfBuffering is never called; no import from budget-engine |
| 10 | 126 tests all pass | ✓ VERIFIED | 19 test suites, 126 tests, all passing |

**Score:** 6/10 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/services/budget-engine/index.ts` | calculateDaysOfBuffering, calculateSinkingFundSuggest | ✓ VERIFIED | Both functions exported and tested (11 tests pass) |
| `src/services/budget-engine/index.test.ts` | Tests for both new functions | ✓ VERIFIED | 11 unit tests covering null guards, integer results, edge cases |
| `src/services/mock-data/index.ts` | SINKING_FUND_TEMPLATES, CATEGORY_TEMPLATE_SETS | ✓ VERIFIED | 4 templates + 4 template sets exported, but field names differ from plan spec (targetAmount vs defaultTargetPaisa, monthsToTarget vs defaultMonths, no preSelected) |
| `src/services/onboarding/index.ts` | getOnboardingState, completeStep, skipOnboarding, completeOnboarding, resetOnboarding, isTipDismissed, dismissTip | ✗ STUB | isTipDismissed and dismissTip are MISSING — not exported. Plan required them, RuleTip imports them, they do not exist. |
| `src/services/onboarding/rules.ts` | YNAB_RULES, YnabRule | ✓ VERIFIED | 4 rules with titleKey, descKey, exampleKey, icon, color |
| `src/hooks/use-metrics.ts` | useMetrics with budget engine integration | ✗ HOLLOW | Returns hardcoded mock values, no import from budget-engine, key_link broken |
| `src/hooks/use-onboarding.ts` | useOnboarding with state + actions | ✓ VERIFIED | Wraps onboarding service, exposes advance/skip/complete/reset |
| `src/components/budget/ReadyToAssignHero.tsx` | Hero banner teal/red states | ✓ VERIFIED | text-hero, shadow() glow, teal/red states, i18n subtitles |
| `src/components/budget/ReadyToAssignHero.test.tsx` | Render tests | ✓ VERIFIED | 5 tests: positive/zero/negative states, accessible button role, title label |
| `src/components/budget/SinkingFundSection.tsx` | True Expenses container with fund rows | ✗ HOLLOW | Implemented but always shows empty state due to preSelected filter bug |
| `src/components/budget/SinkingFundRow.tsx` | Progress bar + auto-suggest row | ✗ HOLLOW | Substantive code exists but relies on template.defaultMonths (undefined) — progress classification broken even if rendered |
| `src/components/budget/RuleTip.tsx` | Dismissible tip card with MMKV | ✗ STUB | Imports non-existent exports from onboarding service — TypeScript TS2305 error, runtime crash |
| `src/components/budget/RuleTip.test.tsx` | Render tests | ✓ VERIFIED | 5 tests pass (module fully mocked) |
| `src/components/dashboard/MetricsCard.tsx` | Age of Money + Days of Buffering card | ✓ VERIFIED | Two-column layout, TrendingUp/Down icons, settings gear, useMetrics hook |
| `src/components/dashboard/MetricsCard.test.tsx` | Render tests | ✓ VERIFIED | 4 tests pass |
| `src/components/onboarding/RuleCarousel.tsx` | 4-card horizontal carousel | ✓ VERIFIED | pagingEnabled, snapToInterval, YNAB_RULES.map(), pagination dots |
| `src/components/onboarding/RuleCarousel.test.tsx` | Render tests | ✓ VERIFIED | 3 tests pass |
| `src/components/onboarding/RuleCard.tsx` | Single rule card | ✓ VERIFIED | icon, title, description, example box with saffron left border |
| `src/components/onboarding/StepIndicator.tsx` | 5-dot progress stepper | ✓ VERIFIED | currentStep/completedSteps props, active/completed/inactive states |
| `src/components/onboarding/CategoryTemplateSelector.tsx` | 2x2 template grid | ✓ VERIFIED | CATEGORY_TEMPLATE_SETS, selection state, 4 icons |
| `app/onboarding/_layout.tsx` | Stack layout with StepIndicator | ✓ VERIFIED | StepIndicator in shared header, Stack.Screen for all 5 routes |
| `app/onboarding/rules.tsx` | Step 1: YNAB 4 Rules screen | ✓ VERIFIED | RuleCarousel, language toggle, letsGo/skip buttons |
| `app/onboarding/account.tsx` | Step 2: Add first account | ✓ VERIFIED | 3 preset cards, advance(1), navigate to categories |
| `app/onboarding/categories.tsx` | Step 3: Category template + sinking funds | ✓ VERIFIED | CategoryTemplateSelector, SINKING_FUND_TEMPLATES checkboxes, advance(2) |
| `app/onboarding/assign.tsx` | Step 4: Assign money | ✓ VERIFIED | TextInput fields, MOCK_BALANCE=800000, remaining counter, advance(3) |
| `app/onboarding/transaction.tsx` | Step 5: First transaction | ✓ VERIFIED | advance(4), complete(), startBudgeting CTA, navigate to tabs |
| `app/_layout.tsx` | Root layout with onboarding gate | ✓ VERIFIED | isOnboardingComplete() check, useEffect redirect, Stack.Screen name="onboarding" |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/hooks/use-metrics.ts` | `src/services/budget-engine/index.ts` | imports calculateAgeOfMoney, calculateDaysOfBuffering | NOT_WIRED | use-metrics.ts has NO imports from budget-engine — returns hardcoded constants |
| `src/hooks/use-onboarding.ts` | `src/services/onboarding/index.ts` | imports getOnboardingState, completeStep, skipOnboarding | ✓ WIRED | All 5 functions imported and used |
| `src/services/onboarding/index.ts` | `src/services/storage/index.ts` | imports getSetting, setSetting, deleteSetting | ✓ WIRED | Line 6: `import { deleteSetting, getSetting, setSetting } from "../storage"` |
| `src/components/budget/ReadyToAssignHero.tsx` | `src/lib/i18n/en.ts` | useTranslation for readyToAssign keys | ✓ WIRED | t("readyToAssign.positive"), t("readyToAssign.zero"), t("readyToAssign.overAssigned") |
| `src/components/budget/SinkingFundRow.tsx` | `src/services/budget-engine/index.ts` | calculateSinkingFundSuggest | ✓ WIRED | Line 6 import, line 39 call in useMemo |
| `src/components/budget/RuleTip.tsx` | `src/services/onboarding/index.ts` | isTipDismissed, dismissTip | NOT_WIRED | Imports non-existent exports — TS2305 compilation errors |
| `app/(tabs)/budget.tsx` | `src/components/budget/ReadyToAssignHero.tsx` | import + render | ✓ WIRED | Line 8 import, line 72 render |
| `src/components/dashboard/MetricsCard.tsx` | `src/hooks/use-metrics.ts` | imports useMetrics | ✓ WIRED | Line 3 import, line 12 call |
| `src/components/onboarding/RuleCarousel.tsx` | `src/services/onboarding/rules.ts` | imports YNAB_RULES | ✓ WIRED | Line 5 import, used in map |
| `src/components/onboarding/CategoryTemplateSelector.tsx` | `src/services/mock-data/index.ts` | imports CATEGORY_TEMPLATE_SETS | ✓ WIRED | Line 5 import, line 31 map |
| `app/(tabs)/index.tsx` | `src/components/dashboard/MetricsCard.tsx` | renders MetricsCard | ✓ WIRED | Line 7 import, line 134 render |
| `app/_layout.tsx` | `src/services/onboarding/index.ts` | checks isOnboardingComplete | ✓ WIRED | Line 11 import, line 50 call |
| `app/onboarding/_layout.tsx` | `src/components/onboarding/StepIndicator.tsx` | renders StepIndicator | ✓ WIRED | Line 4 import, line 13 render |
| `app/onboarding/rules.tsx` | `src/components/onboarding/RuleCarousel.tsx` | renders RuleCarousel | ✓ WIRED | Line 6 import, line 54 render |
| `app/onboarding/categories.tsx` | `src/components/onboarding/CategoryTemplateSelector.tsx` | renders CategoryTemplateSelector | ✓ WIRED | Line 7 import, line 105 render |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `MetricsCard.tsx` | ageOfMoney, daysOfBuffering | useMetrics() | No — hardcoded constants (25, 45) | STATIC — displays values but not computed from balance/spending |
| `SinkingFundSection.tsx` | preSelectedFunds | SINKING_FUND_TEMPLATES.filter | No — f.preSelected is always undefined | DISCONNECTED — filter always returns [] |
| `ReadyToAssignHero.tsx` | amount prop | budget.tsx readyToAssign (Zustand+mock) | Yes — calculated from mock category data | FLOWING |
| `RuleCarousel.tsx` | YNAB_RULES | rules.ts constant | Yes — static data constant (correct for this use case) | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Budget engine: calculateDaysOfBuffering | `bun run test -- budget-engine` | 11/11 tests pass | ✓ PASS |
| Budget engine: calculateSinkingFundSuggest | `bun run test -- budget-engine` | 11/11 tests pass | ✓ PASS |
| RuleTip component renders + dismisses | `bun run test -- RuleTip` | 5/5 tests pass (module mocked) | ✓ PASS |
| MetricsCard renders with data and null | `bun run test -- MetricsCard` | 4/4 tests pass | ✓ PASS |
| RuleCarousel renders all 4 rules | `bun run test -- RuleCarousel` | 3/3 tests pass | ✓ PASS |
| Full test suite no regressions | `bun run test` | 19 suites, 126 tests pass | ✓ PASS |
| TypeScript compilation | `npx tsc --noEmit` | TS2305 on RuleTip.tsx (missing exports); TS2339 on SinkingFundRow.tsx and SinkingFundSection.tsx (wrong field names) | ✗ FAIL |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| BUDG-01 | 03-01, 03-02 | Sinking funds displayed with Bengali templates | ✗ BLOCKED | Templates defined in mock-data, but SinkingFundSection never renders rows due to preSelected filter bug |
| BUDG-02 | 03-02 | Sinking fund progress bars with auto-suggest | ✗ BLOCKED | SinkingFundRow implements this correctly, but never renders (blocked by BUDG-01 gap) |
| BUDG-03 | 03-02 | "Give every taka a job" — Ready to Assign color-coded | ✓ SATISFIED | ReadyToAssignHero with text-hero, teal/red shadow states, i18n, integrated in budget screen |
| BUDG-04 | 03-01, 03-03 | Age of Money with FIFO algorithm and trend arrow | ✓ SATISFIED | MetricsCard shows TrendingUp/TrendingDown icons; mock data acceptable per Convex-offline constraint |
| BUDG-05 | 03-01, 03-03 | Days of Buffering with configurable lookback | ? PARTIAL | Displayed in MetricsCard but hardcoded (45) — not computed from balance/spending. Key_link from use-metrics to budget-engine is absent. |
| ONBD-01 | 03-03, 03-04 | YNAB 4 Rules carousel with Bengali/English toggle | ✓ SATISFIED | RuleCarousel with 4 cards, language toggle in rules.tsx |
| ONBD-02 | 03-04 | Guided flow: account, categories, assign, transaction | ✓ SATISFIED | All 5 screens exist with correct content and navigation |
| ONBD-03 | 03-02 | Contextual rule tips that surface and dismiss | ✗ BLOCKED | RuleTip renders tips correctly, but dismiss crashes (missing isTipDismissed/dismissTip exports) |
| ONBD-04 | 03-03, 03-04 | Progress indicator for onboarding completion | ✓ SATISFIED | StepIndicator 5 dots with active/completed/inactive states, in layout header |

**Note:** REQUIREMENTS.md marks BUDG-02 and BUDG-03 as "Pending" — the verification above supersedes this. BUDG-03 IS implemented (ReadyToAssignHero is substantive and wired). BUDG-01 and BUDG-02 are blocked by the field name mismatch.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/services/onboarding/index.ts` | — | Missing exports isTipDismissed, dismissTip | Blocker | RuleTip.tsx imports these, TypeScript TS2305 errors, runtime crash on tip dismiss |
| `src/components/budget/SinkingFundSection.tsx` | 20, 49, 57 | Accesses f.preSelected, fund.defaultMonths, fund.defaultTargetPaisa (wrong field names) | Blocker | Always renders empty state; TypeScript TS2339 errors |
| `src/components/budget/SinkingFundRow.tsx` | 32-33 | Accesses template.defaultMonths (wrong field name) | Blocker | NaN in progress calculation; TypeScript TS2339 errors |
| `src/hooks/use-metrics.ts` | 14-22 | Hardcoded return { ageOfMoney: 25, daysOfBuffering: 45 } | Warning | Budget engine functions are implemented and tested but not called; metric displays static data |
| `src/services/onboarding/index.ts` | — | OnboardingState missing `skipped` field | Info | Plan specified skipped field, implementation omits it; no current consumer needs it |

---

### Human Verification Required

#### 1. Budget Screen — True Expenses section (post-fix)

**Test:** After fixing the preSelected/field-name gap, open the budget screen on web or device
**Expected:** 4 sinking fund rows render (Eid Fund, School Fees, Wedding Gifts, Medical Reserve) with teal progress bars at varying fill levels, "Suggested: Tk X/month" text below each, and "Behind" rows using saffron fill
**Why human:** Animated Reanimated progress bar fill, color accuracy (teal vs saffron), and visual hierarchy cannot be verified programmatically

#### 2. RuleTip dismiss persistence (post-fix)

**Test:** After adding isTipDismissed/dismissTip to onboarding service, navigate to budget screen, tap "Got it" on a rule tip
**Expected:** Tip collapses with animation and does not reappear when navigating away and returning
**Why human:** MMKV read-after-write, collapse animation (Reanimated withTiming height/opacity), and cross-navigation persistence require live testing

#### 3. Onboarding flow end-to-end

**Test:** Clear MMKV (or use fresh install / "Redo Setup"), open app on web browser
**Expected:** Redirects to /onboarding/rules. Swiping through all 4 rule cards advances pagination dots. Bengali/English toggle instantly switches all text. StepIndicator shows correct step as user progresses. Completing Step 5 navigates to dashboard. Refreshing the page stays on dashboard (not onboarding).
**Why human:** Navigation animations, Bengali text rendering, MMKV persistence across page refresh, and Reanimated dot width animation require visual confirmation

---

### Gaps Summary

**4 gaps block goal achievement:**

**Gap 1 (Blocker): SinkingFundTemplate field name mismatch** — The `SinkingFundTemplate` interface in `src/services/mock-data/index.ts` was implemented with `{ targetAmount, monthsToTarget }` field names instead of the plan's `{ defaultTargetPaisa, defaultMonths, preSelected }`. This single schema inconsistency causes two components to fail: `SinkingFundSection` filters by `f.preSelected` (always `undefined` → always empty) and `SinkingFundRow` reads `template.defaultMonths` (always `undefined` → NaN in progress math). The fix is either to update the interface + data to add the missing fields, or to update the two components to use the actual field names. TypeScript TS2339 errors confirm this at compile time.

**Gap 2 (Blocker): Missing isTipDismissed and dismissTip exports** — `RuleTip.tsx` imports `isTipDismissed` and `dismissTip` from `src/services/onboarding`, but these functions were never added to `onboarding/index.ts`. The plan's Task 1 action explicitly specified them. TypeScript TS2305 errors confirm missing exports. At runtime, tapping "Got it" on any rule tip will crash (cannot call `undefined` as a function). Tests pass only because `RuleTip.test.tsx` fully mocks the onboarding module.

**Gap 3 (Warning): useMetrics not calling budget engine** — `useMetrics` returns hardcoded `{ ageOfMoney: 25, daysOfBuffering: 45 }` without importing or calling `calculateDaysOfBuffering` or `calculateAgeOfMoney`. The plan's Task 2 action provided the full implementation with mock inflows/outflows arrays to demonstrate the engine. The displayed values are static constants, not computed. The budget engine functions are verified correct (11 tests), but the hook that should wire them to the UI is hollow.

**Gap 4 (Structural): TypeScript compilation fails** — `npx tsc --noEmit` reports errors in 3 Phase 3 files (RuleTip.tsx, SinkingFundRow.tsx, SinkingFundSection.tsx). This indicates the phase was delivered without TypeScript validation, and the build will fail in CI if strict compilation is enabled.

**Root cause pattern:** Gaps 1-4 share a common cause — the field names in `mock-data/index.ts` diverged from what the plan specified, and the missing onboarding functions were not caught because tests mocked the modules rather than testing the actual integrations.

---

_Verified: 2026-03-26T01:36:20Z_
_Verifier: Claude (gsd-verifier)_
