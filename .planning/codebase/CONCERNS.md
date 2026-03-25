# Codebase Concerns

**Analysis Date:** 2026-03-25

## Tech Debt

**Type Safety Issues in use-budget hook:**
- Issue: Excessive use of `any` type casts instead of proper typing
- Files: `src/hooks/use-budget.ts` (lines 45, 49, 50, 54, 60, 65, 77, 80, 84, 92)
- Impact: Loses TypeScript safety benefits, increases risk of runtime errors in critical budget calculation logic. Makes refactoring harder.
- Fix approach: Create proper types for transaction and budget objects, add type guards, leverage Convex auto-generated types more effectively

**Weak Error Handling in Transaction Save:**
- Issue: Error caught but only logged with `console.error`, no user feedback
- Files: `src/components/transaction/QuickAdd.tsx` (line 69)
- Impact: User doesn't know transaction save failed, may duplicate entry attempt, no retry mechanism
- Fix approach: Add error toast notification, enable user to retry, store failed transactions locally

**Unsafe Type Cast in FAB Component:**
- Issue: Platform.web styles cast to `any` for position CSS
- Files: `src/components/platform/FAB.tsx` (line 17)
- Impact: Type checking disabled for style object, potential runtime issues on web platform
- Fix approach: Define proper TypeScript interface for web-specific styles, use conditional type narrowing

**Empty Catch Block:**
- Issue: Haptics API error silently swallowed with `catch {}`
- Files: `src/components/transaction/QuickAdd.tsx` (line 66)
- Impact: Platform-specific failures hidden, harder to debug Expo Haptics issues
- Fix approach: Log error or provide graceful fallback indicator

**Storage API Basic Obfuscation Only:**
- Issue: API keys stored with only string obfuscation, not proper encryption
- Files: `src/services/storage/index.ts` (line 99 comment)
- Impact: API keys readable from device storage if MMKV is compromised, security risk for AI providers
- Fix approach: Implement proper encryption (e.g., crypto-js or similar), document that this is not production-ready

## Known Bugs

**CSV Date Parsing Ambiguity:**
- Symptoms: DD/MM/YYYY and MM/DD/YYYY formats both match same regex, causing month/day swaps
- Files: `convex/import/csvParser.ts` (lines 36, 45-48)
- Trigger: Importing bank statement with ambiguous date format (e.g., 02/03/2024 could be Feb 3 or Mar 2)
- Workaround: Manually correct transactions after import, or standardize CSV export format to ISO 8601
- Fix: Add format detection heuristic or require user to specify format during import

**AI Router Stub Implementation:**
- Symptoms: AI features return hardcoded responses instead of calling real APIs
- Files: `convex/ai/router.ts` (entire file)
- Trigger: Any AI feature usage (categorization, NLQ, advisor)
- Workaround: None - feature unavailable in current state
- Fix: Implement actual API calls to configured providers (Anthropic, OpenAI, etc.)

## Security Considerations

**API Keys in Convex Actions:**
- Risk: API keys passed as plaintext arguments in Convex actions
- Files: `convex/ai/router.ts` (line 19)
- Current mitigation: Only accepted via Convex secure action context (not exposed to client)
- Recommendations:
  - Store API keys in Convex environment variables only, never accept as function arguments
  - Add rate limiting to AI actions
  - Log API calls for audit trail
  - Implement API key rotation mechanism

**Device ID Generation Weak:**
- Risk: Device ID uses `Date.now() + Math.random()` which is predictable
- Files: `src/stores/app-store.ts` (line 34), `src/services/storage/index.ts` (line 75)
- Current mitigation: Non-security-critical for device tracking only
- Recommendations: Use crypto.getRandomValues() for better entropy if used for security decisions

**Multi-tenancy Index Reliance:**
- Risk: All Convex queries depend on userId index being enforced, no backup validation
- Files: All Convex functions and schema (`convex/*.ts`)
- Current mitigation: Convex type system enforces index structure, database enforces foreign keys
- Recommendations: Add explicit userId validation in mutation handlers to prevent cross-user data access

**CSV Import No Validation:**
- Risk: Imported transactions not validated for invalid dates, zero amounts, or missing required fields
- Files: `convex/import/csvParser.ts` (lines 110-112)
- Current mitigation: Transactions with empty dates or descriptions skipped (but zeros allowed)
- Recommendations: Validate all parsed amounts are non-zero, dates are valid ISO format, add transaction deduplication by reference field

## Performance Bottlenecks

**Budget Calculation N+1 Problem:**
- Problem: useBudget hook calculates category budgets by mapping over categories and searching budgets array for each
- Files: `src/hooks/use-budget.ts` (lines 77-109)
- Cause: No indexing of budgets by categoryId, linear search on each category
- Improvement path: Build Map<categoryId, budget> once, O(1) lookup instead of O(n) per category

**Bulk Transaction Operations Race Condition:**
- Problem: Promise.all for bulk updates doesn't guarantee atomicity; partial failures leave inconsistent state
- Files: `src/hooks/use-transactions.ts` (lines 111-148)
- Cause: Each mutation fires independently, network failure mid-bulk-operation creates orphaned updates
- Improvement path: Implement server-side bulk mutation in Convex that updates all records transactionally

**Query Watchers Without Limits:**
- Problem: useQuery calls fetch all transactions, no pagination or limits
- Files: `src/hooks/use-transactions.ts` (lines 31-34), `src/hooks/use-budget.ts` (lines 35-38)
- Cause: Large transaction histories cause memory bloat and slow rendering
- Improvement path: Add pagination, implement virtual scrolling, cache recent queries

**Spreadsheet Charts Render All Data:**
- Problem: Income/Expense chart processes all transactions without month filtering
- Files: `src/components/reports/IncomeExpenseChart.tsx` (lines 134 lines, likely processes all data)
- Cause: Client-side filtering of large datasets
- Improvement path: Push aggregation to Convex backend, return pre-calculated monthly summaries

## Fragile Areas

**Budget Logic Relies on Manual Activity Tracking:**
- Files: `src/services/budget-engine/index.ts`, `convex/budgets.ts`
- Why fragile: Budget "activity" field must be manually updated when transactions are created/modified (line 76 in budgets.ts shows `activity: 0` default). No automatic sync between transaction changes and budget activity. Manual transaction edits/deletions can orphan budget activity.
- Safe modification: Add transaction hooks in Convex that automatically update budget activity. Test transaction→budget sync thoroughly.
- Test coverage: No test files found; budget calculations untested

**Reconciliation Gap Calculation:**
- Files: `convex/reconciliation.ts` (lines 46-47)
- Why fragile: Gap is calculated as `actualBalance - expectedBalance` but expectedBalance is account.balance snapshot at reconciliation start. If transactions are added during reconciliation, expectedBalance becomes stale.
- Safe modification: Store expected balance calculation methodology, allow recalculation, add reconciliation state machine to prevent concurrent edits
- Test coverage: No test coverage for reconciliation flows

**Age of Money FIFO Simulation:**
- Files: `src/services/budget-engine/index.ts` (lines 61-111)
- Why fragile: Complex pointer-based simulation with multiple index variables (inflowIdx, inflowRemaining). Off-by-one errors in loop logic (line 104 doesn't check bounds after increment). Edge case: empty inflow arrays return null but consumers may not handle.
- Safe modification: Add unit tests for edge cases (empty arrays, single transaction, exact match). Refactor to functional accumulator pattern instead of mutable indices.
- Test coverage: Function untested

**CSV Date Format Ambiguity (mentioned above):**
- Files: `convex/import/csvParser.ts` (lines 34-51)
- Why fragile: Regex matching is order-dependent; if DD/MM/YYYY comes before MM/DD/YYYY in date formats, will parse incorrectly. No fallback if all formats fail to match.
- Safe modification: Add explicit format parameter to parseCSV, validate dates after parsing, allow user to confirm sample dates before bulk import
- Test coverage: No test files for CSV parsing

**Target Progress Status Calculation Thresholds:**
- Files: `src/services/budget-engine/index.ts` (lines 123-178)
- Why fragile: Status determined by hardcoded thresholds (0.8 for "on_track", 0.5 for savings). Different target types have different thresholds, making logic hard to follow. No way to customize thresholds.
- Safe modification: Extract thresholds to constants, add configuration per category group, document rationale for each threshold
- Test coverage: calculateTargetProgress function untested

## Scaling Limits

**All Transactions Loaded Into Memory:**
- Current capacity: 10,000 transactions per user (estimate before slowdown)
- Limit: React Native app memory constraints (~500MB on device), JSON parse time O(n)
- Scaling path: Implement server-side pagination (Convex cursor-based), add transaction archival, use IndexedDB for web caching

**Convex Backend Without Caching Layer:**
- Current capacity: ~100 concurrent users before hitting rate limits (estimated)
- Limit: Convex document read/write ops per minute, no Redis cache
- Scaling path: Add Convex rate limiting, implement app-level caching with Zustand, consider caching layer for frequently accessed reports

**No Data Archival/Cleanup:**
- Current capacity: Unbounded growth (all transactions retained forever)
- Limit: Convex storage costs scale linearly with data size
- Scaling path: Implement transaction archival (move to separate table after 2 years), add cleanup for duplicate imported transactions, batch process reconciliation records

**Report Calculations Not Cached:**
- Current capacity: Real-time calculations work well for <5000 transactions
- Limit: Generating multiple reports simultaneously can cause UI lag
- Scaling path: Add background calculation crons, cache report data by month, pre-calculate common reports

## Dependencies at Risk

**Expo SDK 55 Compatibility:**
- Risk: Expo 55 recently released, breaking changes possible in minor versions. React Native 0.83 is bleeding edge.
- Impact: New RN releases may break Reanimated, Gesture Handler, or other native modules
- Migration plan: Pin exact versions in package.json, add regression tests for platform-specific features before minor version upgrades

**Convex 1.32.0 Breaking Changes:**
- Risk: Convex rapidly evolving, actions API changed twice in last year
- Impact: AI functions using action API may break on major version upgrades
- Migration plan: Monitor Convex changelog, test thoroughly before upgrading, keep action payloads simple

**react-native-mmkv Dependency:**
- Risk: Storage adapter silently falls back to in-memory if MMKV fails to load, but web always uses in-memory
- Impact: Web users' API keys/settings lost on page refresh
- Migration plan: Use browser localStorage for web platform, document that web instance is ephemeral

## Missing Critical Features

**No Offline Support:**
- Problem: App requires active Convex connection; transactions can't be created offline
- Blocks: Mobile use in areas with poor connectivity, batch transaction entry
- Mitigation: Add IndexedDB queue for offline transactions, sync on reconnect

**No Transaction Undo/Rollback:**
- Problem: Deleted transactions are permanently gone, no recovery mechanism
- Blocks: Accident recovery, audit trails
- Mitigation: UndoStack table exists in schema but isn't wired up to any mutations

**No Automated Categorization:**
- Problem: AI categorization is stubbed out, users must manually categorize everything
- Blocks: Fast transaction entry experience, category rules learning
- Mitigation: Implement Convex action to call real AI provider, add payee→category mapping

**No Split Transactions:**
- Problem: Schema has splitParentId field but no split functionality in UI or mutations
- Blocks: Single receipt with multiple categories, grocery + home goods
- Mitigation: Implement split UI in QuickAdd, add split mutation handler in Convex

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: Budget engine calculations, CSV parsing, target progress logic, date normalization, amount conversion
- Files: `src/services/budget-engine/index.ts`, `convex/import/csvParser.ts`, `src/hooks/use-budget.ts`
- Risk: Critical financial calculation errors go unnoticed. CSV import silently produces wrong amounts or dates.
- Priority: High - affects all budget/report features and data imports

**No Integration Tests:**
- What's not tested: Transaction creation → budget activity update, reconciliation flow, bulk operations atomicity
- Risk: Data inconsistencies only discovered in production after months of normal use
- Priority: High - affects data integrity across major workflows

**No E2E Tests:**
- What's not tested: Onboarding flow, account creation, budget assignment, report generation
- Risk: UI regressions only found during manual testing or user reports
- Priority: Medium - affects user experience but has manual workarounds

**No Component Tests:**
- What's not tested: QuickAdd state machine (amount → category → confirm steps), error states, form validation
- Risk: Component logic bugs only surfaced through manual testing
- Priority: Medium - component-level issues recoverable through UI

---

*Concerns audit: 2026-03-25*
