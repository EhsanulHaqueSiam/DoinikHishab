# Phase 2: 3-Tap Transaction Entry - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebuild the QuickAdd bottom sheet flow into a true 3-tap transaction entry: amount (custom keypad) → category (frequency-sorted grid) → auto-save. Smart defaults pre-fill account, date, and type. Optional fields (payee, memo, flag, account override, date) are hidden behind an expandable "+" Details" section. The existing full transaction editor (app/transaction/add.tsx) remains for complex entries.

</domain>

<decisions>
## Implementation Decisions

### Flow Design
- **D-01:** Auto-save on category tap — tapping a category immediately saves the transaction with haptic feedback + category tile flash (300ms green). No confirm step. True 3-tap: amount entry → Next → category tap = done.
- **D-02:** Bottom sheet remains the entry surface — keep @gorhom/bottom-sheet. No full-screen modal or inline dashboard entry.
- **D-03:** After save, sheet resets to amount step for rapid entry (batch mode). User swipes down to close when done. Brief success flash animation before reset.
- **D-04:** Next button disabled when amount is ৳0 — prevents accidental zero transactions. Current AmountPad behavior preserved.
- **D-05:** Haptic pulse + category tile green flash (300ms) as success feedback. No full-screen overlay, no toast. Subtle but unmistakable.
- **D-06:** Type toggle (expense/income/transfer) stays at top of sheet — current design preserved. Expense is default but user can switch with one tap.
- **D-07:** Keep existing decimal point behavior in AmountPad — dot key, max 2 decimal places, paisa conversion via Math.round(num * 100).
- **D-08:** Keep both flows — QuickAdd (3-tap bottom sheet) for fast entry, full editor (app/transaction/add.tsx) for complex transactions. Quick add is the default entry point.

### Category Grid
- **D-09:** Frequency section at top + grouped section below. Top strip shows dynamically-sized "Frequent" categories (2 rows, count based on screen width). Below: full grid grouped by category groups (current CategoryGrid layout).
- **D-10:** Frequency calculated with hybrid approach — hardcoded Bangladesh-relevant defaults (Food, Transport, Utilities first), then overridden by local MMKV tap counts as user enters transactions. When Convex re-enables, sync with server-side transaction history.
- **D-11:** Frequent strip size is dynamic based on device width — calculate how many category tiles fit in 2 rows at ~80dp per tile. More on tablets, fewer on small phones.

### Optional Fields
- **D-12:** "+" Details" expandable row on the amount step, below the keypad and above the Next button. Tapping reveals inline fields. Does not break 3-tap flow when ignored.
- **D-13:** Four optional fields in expansion: payee/merchant name (text input), memo/note (text input), flag/star (boolean toggle), account override (dropdown of user's accounts).
- **D-14:** Date picker included in optional fields expansion — allows backdating transactions without leaving the quick flow. Default is today.

### Smart Defaults & Entry Point
- **D-15:** FAB (floating action button) on dashboard as entry point. Existing FAB.tsx component. Tapping opens the quick add bottom sheet.
- **D-16:** Smart defaults: last-used account (fallback to isDefault, then first account), today's date, expense type. All pre-filled, no user action needed for defaults.
- **D-17:** Full mock data flow when Convex is offline — hardcoded mock categories and accounts at hook level. Quick add works end-to-end with mock data, transactions save locally via MMKV. Matches project constraint.

### Localization
- **D-18:** Keypad always shows Arabic numerals (0-9) regardless of language setting. BDT amount display uses Bengali numerals (toBengaliNumerals) when app is in Bengali mode. Consistent with Bangladesh banking apps.

### Claude's Discretion
- Animation implementation details (Reanimated vs CSS transitions for success flash)
- MMKV storage schema for frequency counters and offline transactions
- Mock data structure for categories and accounts (shape, count, names)
- CategoryGrid refactoring approach (extend existing or rewrite)
- Test strategy for the new components

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Transaction Components (to be modified)
- `src/components/transaction/QuickAdd.tsx` — Current 3-step flow (amount → category → confirm). Must be refactored to 2-step auto-save.
- `src/components/transaction/AmountPad.tsx` — Custom numeric keypad with BDT formatting. Mostly preserved, needs "+" Details" row added.
- `src/components/transaction/CategoryGrid.tsx` — Grouped category grid. Needs frequency section prepended.
- `src/components/platform/FAB.tsx` — Floating action button component. Entry point for quick add.

### Transaction Screens
- `app/transaction/add.tsx` — Full transaction editor. Kept as separate flow for complex entries.
- `app/(tabs)/index.tsx` — Dashboard screen where FAB lives.

### State & Storage
- `src/stores/ui-store.ts` — Controls `isQuickAddOpen`, `quickAddType`, `openQuickAdd()`, `closeQuickAdd()`
- `src/stores/app-store.ts` — Holds `userId`, locale, `selectedAccountId`
- `src/services/storage/index.ts` — MMKV adapter for local storage (frequency counters, offline transactions)

### Backend Schema
- `convex/schema.ts` — Transaction, category, account table definitions
- `convex/transactions.ts` — Transaction CRUD mutations
- `convex/categories.ts` — Category queries (listCategories, listGroups)

### Project Context
- `.planning/PROJECT.md` — Core value: "3-tap manual transaction entry"
- `.planning/REQUIREMENTS.md` — TRAN-01 through TRAN-05 specifications
- `.planning/ROADMAP.md` §Phase 2 — Success criteria (4 conditions)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AmountPad.tsx` — Already implements custom keypad with BDT formatting, decimal handling, type-colored display. Needs minor extension for "+" Details" row.
- `CategoryGrid.tsx` — Already renders grouped categories with emoji icons and selection. Needs frequency section prepended and sorting logic.
- `QuickAdd.tsx` — Bottom sheet flow with Convex queries, type toggle, step management. Heavy refactor needed (remove confirm step, add auto-save, add reset-for-rapid-entry).
- `FAB.tsx` — Platform-specific floating action button. Already connected to UIStore.openQuickAdd().
- `src/lib/currency.ts` — formatCurrency(), paisaToTaka(), toBengaliNumerals() — used by AmountPad.
- `src/services/storage/index.ts` — MMKV/memory adapter — will store frequency counters offline.

### Established Patterns
- Zustand stores for UI state (UIStore for modal control, AppStore for user context)
- Convex useQuery/useMutation for data fetching (with "skip" pattern for null userId)
- @gorhom/bottom-sheet with BottomSheetScrollView for scrollable content
- Haptic feedback via expo-haptics with try/catch for web fallback
- shadow() utility from @lib/platform for platform-safe shadows
- i18next t() for all user-visible strings

### Integration Points
- `src/stores/ui-store.ts` — openQuickAdd(type) triggers the bottom sheet
- `app/(tabs)/index.tsx` — Dashboard renders FAB and QuickAdd components
- `convex/categories.ts` — listCategories and listGroups queries feed CategoryGrid
- `convex/transactions.ts` — create mutation saves the transaction
- `src/lib/i18n/en.json` + `bn.json` — New translation keys for quick add UI text

</code_context>

<specifics>
## Specific Ideas

- The "3-tap" promise is literal — amount entry, Next button, category tap = saved transaction. No confirmation step.
- Rapid entry mode (sheet stays open after save) is critical for market day / grocery shopping scenarios common in Bangladesh.
- Frequency sorting with Bangladesh-relevant defaults acknowledges that most users will start with similar categories (Food, Transport, Mobile recharge, Utilities).
- Dynamic frequent strip sizing adapts to the wide range of Android devices in Bangladesh market (from 5" budget phones to 6.7" flagships).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-3-tap-transaction-entry*
*Context gathered: 2026-03-26*
