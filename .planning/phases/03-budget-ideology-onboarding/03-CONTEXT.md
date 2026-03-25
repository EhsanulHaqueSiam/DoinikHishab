# Phase 3: Budget Ideology & Onboarding - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement YNAB's envelope budgeting philosophy adapted for Bangladesh: culturally relevant sinking fund templates with progress visualization, Ready to Assign hero prominence, Age of Money and Days of Buffering financial health metrics on the dashboard, contextual YNAB rule tips, and a guided first-time onboarding flow with Bangladeshi category templates and YNAB 4 Rules education.

</domain>

<decisions>
## Implementation Decisions

### Sinking Funds & Bengali Templates
- **D-01:** Pre-populated sinking fund templates during onboarding with checkboxes — Eid Fund (ঈদ তহবিল), School Fees (স্কুল ফি), Wedding Gifts (বিবাহের উপহার), Medical Reserve (চিকিৎসা সঞ্চয়), Custom. Bangladeshi defaults pre-selected, user unchecks unwanted ones.
- **D-02:** Horizontal progress bar with percentage + "৳X of ৳Y" text. Teal fill when on track, saffron when behind schedule. Reuse/extend existing GoalProgress component pattern.
- **D-03:** Monthly auto-suggest: simple (target - accumulated) / months remaining. Displayed as "Suggested: ৳X/month" below the progress bar. Editable by user.
- **D-04:** Sinking funds live in a dedicated section at top of Budget tab, above regular category groups. Visually distinct with a "True Expenses" header.

### Financial Health Metrics & Dashboard
- **D-05:** Age of Money displayed on dashboard card alongside balance. Shows "Age: X days" with trend arrow (↑ green = improving, ↓ red = declining). Trend based on 30-day rolling average. Uses existing BalanceCard layout pattern.
- **D-06:** Days of Buffering = total balance / average daily expense over configurable lookback (default 90 days). Displayed as "Buffer: X days" next to Age of Money. Settings gear to change lookback period.
- **D-07:** Ready to Assign as hero banner at top of budget screen — large teal number when positive, red when over-assigned. "Give every taka a job" subtitle in current language. Tapping navigates to assignment view.
- **D-08:** YNAB rule tips as inline contextual cards below the relevant action — e.g., Rule 3 tip appears below overspent category row. Dismissible, persisted to MMKV so they don't repeat.

### Onboarding Flow
- **D-09:** YNAB 4 Rules education as horizontal carousel with 4 illustrated cards (one per rule). Bengali/English toggle at top. Each card: rule name, one-sentence explanation, culturally relevant example. "Skip" always visible.
- **D-10:** Onboarding progress tracked via horizontal stepper/dots showing 5 steps: Learn Rules → Add Account → Choose Categories → Assign Money → Enter Transaction. Steps skippable. Progress persisted to MMKV.
- **D-11:** 4 Bangladeshi category template sets: "Student" (ছাত্র), "Professional" (পেশাদার), "Freelancer" (ফ্রিল্যান্সার), "Family" (পরিবার). Each pre-selects relevant categories from existing mock categories. User picks one, then customizes.
- **D-12:** Onboarding triggers on first app launch (no userId in MMKV). Ends when user completes all 5 steps OR taps "Skip setup". After onboarding, normal dashboard loads. Re-accessible via Settings → "Redo Setup".

### Claude's Discretion
- Animation details for carousel transitions and progress bars
- FIFO algorithm implementation for Age of Money (budget-engine already has calculateAgeOfMoney)
- Onboarding screen routing approach (modal stack vs. dedicated route group)
- Rule tip content and culturally relevant examples
- Dashboard card layout for metrics (extend BalanceCard or new MetricsCard)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/services/budget-engine/index.ts` — Already has calculateReadyToAssign(), calculateAgeOfMoney(), calculateAvailable(). Extend for Days of Buffering and sinking fund auto-suggest.
- `src/components/budget/GoalProgress.tsx` — Progress bar component. Extend/adapt for sinking fund visualization.
- `src/components/budget/AssignMoney.tsx` — Money assignment UI. Integrate with Ready to Assign hero.
- `src/components/budget/BudgetRow.tsx` — Individual category row. Add contextual tip cards.
- `src/components/dashboard/BalanceCard.tsx` — Dashboard card layout. Extend for Age of Money and Days of Buffering.
- `src/services/storage/index.ts` — MMKV adapter with getJSON/setJSON. Use for onboarding progress, tip dismissals, lookback period.
- `src/services/mock-data/index.ts` — 18 categories, 4 groups. Extend with sinking fund templates and category template sets.

### Established Patterns
- i18next t() for all user-facing strings (Phase 1)
- Mock data at hook level when Convex offline (Phase 2 pattern)
- MMKV for local persistence (frequency counters, settings)
- Zustand stores for UI and app state
- @gorhom/bottom-sheet for modal content
- ExpandableDetails pattern for collapsible sections (Phase 2)

### Integration Points
- `app/(tabs)/budget.tsx` — Budget screen where Ready to Assign hero and sinking funds section will be added
- `app/(tabs)/index.tsx` — Dashboard where Age of Money and Days of Buffering metrics appear
- `app/(tabs)/settings.tsx` — "Redo Setup" option and lookback period setting
- `app/_layout.tsx` — Onboarding gate (check MMKV for first launch)
- `src/lib/i18n/en.json` + `bn.json` — Extensive new translation keys for YNAB rules, sinking fund names, onboarding steps

</code_context>

<specifics>
## Specific Ideas

- YNAB 4 Rules must be culturally adapted — Rule 1 "Give Every Dollar a Job" becomes "Give Every Taka a Job" (প্রতিটি টাকার কাজ দিন)
- Sinking fund examples should reference Bangladeshi cultural events and expenses (Eid preparations, school admission fees, wedding season gifts)
- The budget hero banner should feel like the most important number on the screen — it IS the core ideology
- Onboarding should be fast (under 3 minutes) and not feel like a tutorial wall — respect that users want to start using the app immediately

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-budget-ideology-onboarding*
*Context gathered: 2026-03-26*
