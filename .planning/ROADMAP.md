# Roadmap: DoinikHishab v1.1

## Overview

This milestone transforms DoinikHishab from a functional budgeting app into a complete YNAB-philosophy personal finance tool for Bangladesh. The journey starts with developer tooling (linting, testing, i18n) that accelerates all subsequent work, then delivers the core differentiator (3-tap transaction entry), builds out the YNAB ideology features (sinking funds, onboarding, financial health metrics), adds advanced visualizations and recurring transaction management, introduces debt payoff and statement import capabilities, and finishes with deployment infrastructure (OTA updates) and E2E testing once features are stable.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Tooling Foundation** - Biome linting, Jest testing infrastructure, and i18next internationalization to accelerate all subsequent development
- [ ] **Phase 2: 3-Tap Transaction Entry** - The core differentiator: amount keypad, category grid, smart defaults, auto-save in under 10 seconds
- [ ] **Phase 3: Budget Ideology & Onboarding** - YNAB philosophy embedded in UI: sinking funds, financial health metrics, education carousel, and guided first-time setup
- [ ] **Phase 4: Mobile Reports & Sankey** - All reports fully functional on mobile with touch interactions, plus Sankey cash flow visualization
- [ ] **Phase 5: Recurring & Subscriptions** - Calendar view for bills, subscription auto-detection, cash flow forecasting with danger zones
- [ ] **Phase 6: Goals & Statement Import** - Debt payoff with avalanche/snowball comparison, save-up goals, and bKash/Nagad statement parsing
- [ ] **Phase 7: Deployment & E2E Testing** - OTA updates via expo-updates and Maestro E2E test flows for critical user paths

## Phase Details

### Phase 1: Tooling Foundation
**Goal**: Developers have fast linting, a working test harness, and proper Bengali/English internationalization before building any features
**Depends on**: Nothing (first phase)
**Requirements**: TOOL-01, TOOL-02, TOOL-05
**Success Criteria** (what must be TRUE):
  1. Running `bun run lint` checks the entire codebase with Biome and reports zero errors on clean code
  2. Running `bun run test` executes Jest tests against a React Native component using React Native Testing Library, and at least one sample test passes
  3. Switching the app language between Bengali and English updates all visible text instantly, with correct Bengali plural forms (e.g., "5 items" renders properly in Bengali)
  4. The i18n system detects the device locale on first launch and defaults to the matching language
**Plans**: 3 plans

Plans:
- [x] 01-01: Biome linting and formatting setup
- [x] 01-02: Jest + React Native Testing Library setup with Convex mock patterns
- [x] 01-03: i18next + expo-localization migration from custom i18n system

### Phase 2: 3-Tap Transaction Entry
**Goal**: Users can enter a transaction in under 10 seconds with 3 taps: amount, category, save
**Depends on**: Phase 1
**Requirements**: TRAN-01, TRAN-02, TRAN-03, TRAN-04, TRAN-05
**Success Criteria** (what must be TRUE):
  1. User taps "add transaction," enters an amount on a custom numeric keypad (no system keyboard appears), sees live BDT formatting, taps a category from a grid sorted by recent usage, and the transaction saves automatically
  2. The category grid shows the user's most frequently used categories first, not alphabetical order
  3. Account, date, and transaction type are pre-filled with smart defaults (last-used account, today, expense) so the user does not need to touch them
  4. Optional fields (payee, memo, flag) are hidden by default and only appear when the user explicitly expands them
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md -- Foundation: mock data, frequency service, storage helpers, hooks, AmountPad Bengali extension, ExpandableDetails component
- [ ] 02-02-PLAN.md -- Integration: CategoryFrequent strip, CategoryGrid generalization, QuickAdd 2-step auto-save refactor with batch mode
**UI hint**: yes

### Phase 3: Budget Ideology & Onboarding
**Goal**: Users understand and practice YNAB's envelope budgeting philosophy through culturally relevant sinking funds, financial health metrics, and a guided onboarding experience
**Depends on**: Phase 2
**Requirements**: BUDG-01, BUDG-02, BUDG-03, BUDG-04, BUDG-05, ONBD-01, ONBD-02, ONBD-03, ONBD-04
**Success Criteria** (what must be TRUE):
  1. User sees Bengali-named sinking fund templates (Eid Fund, School Fees, Wedding Gifts, Medical Reserve) with progress bars showing accumulation toward target and monthly auto-suggest amounts
  2. "Ready to Assign" is prominently displayed on the budget screen, color-coded teal when positive and red when over-assigned, with "Give every taka a job" language in both Bengali and English
  3. User sees Age of Money on the dashboard card with a trend arrow, and Days of Buffering alongside it with a configurable lookback period
  4. First-time user completes a guided onboarding flow: YNAB 4 Rules education carousel (Bengali/English toggle), add first account, create categories from pre-populated Bangladeshi templates, assign first money, enter first transaction, with a progress indicator showing completion status
  5. Contextual rule tips surface at the right moment (first overspend triggers Rule 3 tip, first sinking fund triggers Rule 2 tip)
**Plans**: 4 plans

Plans:
- [x] 03-01-PLAN.md -- Data foundation: budget engine extensions, mock data templates, onboarding service, YNAB rules data, hooks, i18n keys
- [x] 03-02-PLAN.md -- Budget screen UI: ReadyToAssignHero, SinkingFundSection, SinkingFundRow, RuleTip components and integration
- [ ] 03-03-PLAN.md -- Dashboard MetricsCard, onboarding UI components (RuleCarousel, StepIndicator, CategoryTemplateSelector), settings integration
- [ ] 03-04-PLAN.md -- Onboarding flow: 5-step guided setup screens, root layout onboarding gate, human verification
**UI hint**: yes

### Phase 4: Mobile Reports & Sankey
**Goal**: Users can explore all financial reports on their phone with touch-friendly interactions, including a Sankey cash flow visualization
**Depends on**: Phase 3
**Requirements**: RPRT-01, RPRT-02, RPRT-03, RPRT-04, RPRT-05, RPRT-06
**Success Criteria** (what must be TRUE):
  1. All existing reports (spending breakdown, income vs expense, net worth) render correctly on mobile screens with tap-to-filter segments and swipe between time periods
  2. Age of Money trend line chart appears in the reports section showing AoM over time
  3. Sankey cash flow diagram renders on mobile as a simplified vertical layout (income top, expenses bottom) and as full horizontal layout on web
  4. User can toggle Sankey privacy mode to hide amounts and show only proportions for sharing/screenshots
**Plans**: TBD

Plans:
- [ ] 04-01: Mobile-responsive chart components with touch interactions
- [ ] 04-02: Age of Money trend chart in reports
- [ ] 04-03: Sankey cash flow diagram with d3-sankey and react-native-svg
**UI hint**: yes

### Phase 5: Recurring & Subscriptions
**Goal**: Users never miss a bill and can see exactly where their recurring money goes, with a forward-looking cash flow projection
**Depends on**: Phase 4
**Requirements**: RECR-01, RECR-02, RECR-03, RECR-04, RECR-05, RECR-06
**Success Criteria** (what must be TRUE):
  1. User sees a calendar view showing upcoming bills and subscriptions with color-coded status indicators (paid/upcoming/overdue), and can toggle between calendar grid and list view with monthly totals
  2. The app auto-detects subscriptions from transaction history (3+ occurrences of the same payee at regular intervals) and surfaces them for user confirmation
  3. User can view a subscriptions page showing total monthly and annual burn rate, with ability to manually add or remove subscriptions
  4. Cash flow forecasting chart projects account balance over 30/60/90 days based on recurring items, with danger zones highlighted in red where projected balance dips below zero
**Plans**: TBD

Plans:
- [ ] 05-01: Recurring transaction calendar with status indicators
- [ ] 05-02: Subscription auto-detection and management view
- [ ] 05-03: Cash flow forecasting chart with danger zone highlighting
**UI hint**: yes

### Phase 6: Goals & Statement Import
**Goal**: Users can plan debt payoff with strategy comparison and import bKash/Nagad statements to reduce manual entry burden
**Depends on**: Phase 5
**Requirements**: GOAL-01, GOAL-02, GOAL-03, GOAL-04, GOAL-05, IMPT-01, IMPT-02, IMPT-03, IMPT-04, IMPT-05
**Success Criteria** (what must be TRUE):
  1. User can create a save-up goal with target amount, target date, and linked account, seeing on-track/behind/ahead status with a progress bar and calculated monthly contribution
  2. User can create a pay-down goal for a loan with balance, APR, and minimum payment, seeing an amortization schedule with projected payoff date
  3. User can compare avalanche vs snowball debt payoff strategies side-by-side, seeing total interest saved and payoff date difference between strategies
  4. Goal contributions appear as budget category line items in the budget view
  5. User can import a bKash or Nagad statement (PDF, XLS, or TXT), see parsed transactions with type mapping (Cash Out = expense, Cash In = income), review duplicates flagged by date + amount + reference, and confirm import -- all parsing happens on-device
**Plans**: TBD

Plans:
- [ ] 06-01: Save-up goals with progress tracking
- [ ] 06-02: Pay-down goals with amortization and strategy comparison
- [ ] 06-03: bKash statement parser with on-device PDF processing
- [ ] 06-04: Nagad parser, transaction type mapping, and deduplication
**UI hint**: yes

### Phase 7: Deployment & E2E Testing
**Goal**: App updates ship instantly via OTA without app store review, and critical user paths are validated by automated E2E tests
**Depends on**: Phase 6
**Requirements**: TOOL-03, TOOL-04
**Success Criteria** (what must be TRUE):
  1. A JavaScript-only change published via EAS Update reaches a test device without requiring an app store submission
  2. Fingerprint detection prevents OTA updates from shipping when native code changes are present
  3. Maestro E2E test flows cover the critical user paths (add transaction, view budget, navigate reports) and pass against a running app build
**Plans**: TBD

Plans:
- [ ] 07-01: expo-updates OTA configuration with fingerprint safety and update channels
- [ ] 07-02: Maestro E2E test framework setup with critical flow YAML files

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Tooling Foundation | 0/3 | Not started | - |
| 2. 3-Tap Transaction Entry | 0/2 | Not started | - |
| 3. Budget Ideology & Onboarding | 0/4 | Not started | - |
| 4. Mobile Reports & Sankey | 0/3 | Not started | - |
| 5. Recurring & Subscriptions | 0/3 | Not started | - |
| 6. Goals & Statement Import | 0/4 | Not started | - |
| 7. Deployment & E2E Testing | 0/2 | Not started | - |
