# Phase 6: Goals & Statement Import - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver save-up and pay-down goal tracking with progress visualization, avalanche vs snowball debt payoff strategy comparison, budget integration via auto-created goal categories, bKash/Nagad statement parsing (PDF/XLS/TXT) with on-device processing, transaction type mapping, duplicate detection, and import review/confirmation flow.

</domain>

<decisions>
## Implementation Decisions

### Save-Up Goals
- **D-01:** Bottom sheet form for goal creation — target amount, target date (date picker), linked account (dropdown), name. Validates required fields. Matches AddSubscriptionForm pattern
- **D-02:** Horizontal progress bar with percentage + "৳X of ৳Y" text. Green when on-track, saffron when behind, teal when ahead. Reuse SinkingFundRow progress pattern from Phase 3
- **D-03:** "৳X/month needed" subtitle below progress bar — calculated as (target - current) / remaining months. Updates dynamically
- **D-04:** Card-based list on dedicated Goals screen. Each card shows name, progress bar, status badge, monthly contribution

### Pay-Down Goals & Strategy Comparison
- **D-05:** Expandable amortization table — month, payment, principal, interest, remaining balance. Collapsed by default, "Show schedule" to expand. First 6 rows visible, "Load more" for rest
- **D-06:** Side-by-side card comparison — Avalanche vs Snowball cards each showing total interest paid, payoff date, total cost. Recommended strategy highlighted with teal border. Delta row showing savings
- **D-07:** Reuse existing Input component — currency input for balance/payment, numeric for APR%. APR shown as "12.5%", amounts in BDT
- **D-08:** FlashList of debt cards — each shows balance, APR, min payment, projected payoff. "Add Debt" button. Strategy comparison runs across all debts simultaneously

### Statement Import (bKash/Nagad)
- **D-09:** expo-document-picker (already installed) — filter PDF, XLS, TXT MIME types. Single file selection. Loading spinner during parse
- **D-10:** On-device regex parsing — bKash patterns (Cash In, Cash Out, Send Money, Payment). XLS via xlsx library. No server-side processing
- **D-11:** Checklist of parsed transactions — each row: date, description, amount, mapped type. Checkbox to include/exclude. Yellow duplicate badge when date+amount+reference matches existing. "Import Selected" button at bottom
- **D-12:** Hardcoded type mapping — Cash Out/Send Money/Payment = expense, Cash In/Add Money = income, Cashback = income. User can override per transaction in review

### Budget Integration & Navigation
- **D-13:** Goal categories auto-created — "Goal: [name]" category in budget view. Monthly contribution target becomes category target. Activity tracked as contributions
- **D-14:** Goals screen as nested route from dashboard — `app/goals/index.tsx` via "Goals" card on dashboard. Dashboard card shows top 2-3 goals with progress bars
- **D-15:** Import as nested route — `app/import/index.tsx` from Settings > Import Statement + "Import" button on transactions screen
- **D-16:** MMKV storage for goals — same pattern as recurring storage. JSON array with goal objects. Budget integration reads from this store

### Claude's Discretion
- Date picker component choice and styling
- Amortization calculation precision (rounding)
- Statement format detection heuristics
- Duplicate detection threshold tuning
- Import progress indicators
- Goal detail screen layout

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@gorhom/bottom-sheet` — Already installed for goal creation form
- `expo-document-picker` — Already installed for file selection
- `src/components/ui/Input.tsx` — Form inputs for goal fields
- `src/components/ui/Button.tsx` — CTA buttons
- `src/services/recurring-storage/index.ts` — MMKV persistence pattern to replicate for goals
- `src/components/recurring/AddSubscriptionForm.tsx` — Bottom sheet form pattern
- `src/components/budget/SinkingFundRow.tsx` — Progress bar pattern for goal progress
- `src/lib/currency.ts` — Amount formatting
- `@shopify/flash-list` — FlashList for debt cards and import review list

### Established Patterns
- Mock data at hook level with Convex fallback
- NativeWind className for styling
- MMKV for offline-first data persistence
- Bottom sheet forms for creation flows
- i18n via useTranslation for all user-facing strings
- Jest testing with mock services

### Integration Points
- Dashboard screen: add "Goals" card linking to goals screen
- Budget view: auto-created goal categories
- Settings screen: add "Import Statement" link
- Transactions screen: add "Import" button
- New routes: `app/goals/index.tsx`, `app/goals/[id].tsx`, `app/import/index.tsx`
- New packages: `xlsx` for XLS parsing
- i18n keys for goals and import strings

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches following the decisions above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
